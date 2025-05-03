import {
    Attributes,
    Options,
    Parameters,
    type ParsedLine,
    type Playlist,
    type PlaylistHeader,
    type PlaylistItem,
    PlaylistItemValidator,
} from "./types.ts";

/**
 * M3U8Parser class is responsible for parsing and filtering M3U8 playlists.
 *
 * It can parse raw M3U8 data or fetch the playlist from a provided URL.
 *
 * @class
 * @classdesc M3U8Parser class provides functionality to parse, filter, and retrieve M3U8 playlist data.
 *
 * @param {Object} params - The parameters for initializing the parser.
 * @param {string} [params.playlist] - The raw M3U8 playlist content.
 * @param {string} [params.url] - The URL to fetch the M3U8 playlist from.
 *
 * @example
 * const parser = new M3U8Parser({ playlist: "./playlist.m3u8" });
 * const parser = new M3U8Parser({ url: "http://example.com/playlist.m3u8" });
 *
 * @throws {Error} If the playlist is not valid or fetch fails.
 */
export class M3U8Parser {
    public rawPlaylist = "";
    public filteredMap: Map<string, Playlist> = new Map();

    public items: Map<number, PlaylistItem> = new Map();
    public header: PlaylistHeader = {} as PlaylistHeader;
    public groups: Set<string> = new Set();

    /**
     * Creates an instance of M3U8Parser.
     *
     * @param {Object} params - The parameters for initializing the parser.
     * @param {string} [params.playlist] - The raw M3U8 playlist content.
     * @param {string} [params.url] - The URL to fetch the M3U8 playlist from.
     */
    constructor({ playlist, url }: { playlist?: string; url?: string }) {
        if (playlist) {
            this.rawPlaylist = playlist;
            this.parse(playlist);
        }

        if (url) {
            this.fetchPlaylist({ url });
        }
    }

    /**
     * Parses the raw M3U8 playlist content and populates the items and header.
     *
     * @private
     * @param {string} raw - The raw playlist content.
     * @returns {void}
     *
     * @throws {Error} If the playlist is not valid.
     */
    private parse(raw: string): void {
        let i = 0;
        const lines = raw.split("\n").map(this.parseLine);
        const firstLine = lines.find((l) => l.index === 0);

        if (!firstLine || !/^#EXTM3U/.test(firstLine.raw)) {
            throw new Error("Playlist is not valid");
        }

        this.parseHeader(firstLine?.raw);

        for (const line of lines) {
            if (line.index === 0) continue;
            const string = line.raw.toString().trim();

            if (string.startsWith("#EXTINF:")) {
                this.items.set(i, this.handleEXTINF(line));
            } else if (string.startsWith("#EXTVLCOPT:")) {
                if (!this.items.get(i)) continue;
                this.handleEXTVLCOPT(string, i);
            } else if (string.startsWith("#EXTGRP:")) {
                if (!this.items.get(i)) continue;
                this.handleEXTGRP(string, i);
            } else {
                const item = this.items.get(i);
                if (!item) continue;
                const url = this.getUrl(string);
                const user_agent = this.getParameter(
                    string,
                    Parameters.USER_AGENT,
                );
                const referrer = this.getParameter(string, Parameters.REFERER);
                this.groups.add(item.group.title);

                if (url) {
                    this.items.set(
                        i,
                        PlaylistItemValidator.parse({
                            ...item,
                            url,
                            http: {
                                ...item.http,
                                user_agent,
                                referrer,
                            },
                            raw: this.mergeRaw(item, line),
                        }),
                    );
                    i++;
                } else {
                    this.items.set(
                        i,
                        PlaylistItemValidator.parse({
                            ...item,
                            raw: this.mergeRaw(item, line),
                        }),
                    );
                }
            }
        }
    }

    /**
     * Merges raw line data with existing playlist item data.
     *
     * @private
     * @param {PlaylistItem} item - The playlist item to update.
     * @param {ParsedLine | string} line - The line to merge with the playlist item.
     * @returns {string} - The updated raw string.
     */
    private mergeRaw(item: PlaylistItem, line: ParsedLine | string): string {
        if (typeof line === "string") {
            return item?.raw ? item.raw.concat(`\n${line}`) : `${line}`;
        }

        return item?.raw ? item.raw.concat(`\n${line.raw}`) : `${line.raw}`;
    }

    /**
     * Parses a single line from the playlist.
     *
     * @private
     * @param {string} line - The raw line to parse.
     * @param {number} index - The line index.
     * @returns {ParsedLine} - The parsed line.
     */
    parseLine(line: string, index: number): ParsedLine {
        return {
            index,
            raw: line,
        };
    }

    /**
     * Parses the header information from the raw playlist.
     *
     * @private
     * @param {string} line - The raw header line.
     * @returns {void}
     */
    parseHeader(line: string): void {
        const supportedAttrs = [Attributes.X_TVG_URL, Attributes.URL_TVG];
        const attrs = new Map();

        for (const attrName of supportedAttrs) {
            const tvgUrl = this.getAttribute(attrName, line);
            if (tvgUrl) {
                attrs.set(attrName, tvgUrl);
            }
        }

        this.header = {
            attrs: Object.fromEntries(attrs.entries()),
            raw: line,
        };
    }

    /**
     * Handles the EXTGRP tag and updates the associated playlist item.
     *
     * @private
     * @param {string} line - The raw EXTGRP line.
     * @param {number} index - The index of the playlist item.
     * @returns {void}
     */
    private handleEXTGRP(line: string, index: number): void {
        const item = this.items.get(index);
        if (!item) {
            return;
        }

        this.items.set(
            index,
            PlaylistItemValidator.parse({
                ...item,
                group: {
                    ...item.group,
                    title: this.getValue(line) ?? item?.group.title,
                },
                raw: this.mergeRaw(item, line),
            }),
        );
    }

    /**
     * Handles the EXTVLCOPT tag and updates the HTTP options for the playlist item.
     *
     * @private
     * @param {string} line - The raw EXTVLCOPT line.
     * @param {number} index - The index of the playlist item.
     * @returns {void}
     */
    private handleEXTVLCOPT(line: string, index: number): void {
        const item = this.items.get(index);

        this.items.set(
            index,
            PlaylistItemValidator.parse({
                ...item,
                http: {
                    ...item?.http,
                    "user-agent":
                        this.getOption(line, Options.HTTP_USER_AGENT) ??
                            item?.http["user-agent"],
                    referrer: this.getOption(line, Options.HTTP_REFERRER) ??
                        item?.http.referrer,
                },
                raw: `\r\n${line}`,
            }),
        );
    }

    /**
     * Handles the EXTINF tag and extracts relevant information for the playlist item.
     *
     * @private
     * @param {ParsedLine} line - The parsed EXTINF line.
     * @returns {PlaylistItem} - The parsed playlist item.
     */
    private handleEXTINF(line: ParsedLine): PlaylistItem {
        return PlaylistItemValidator.parse({
            name: this.getName(line.raw),
            tvg: {
                id: this.getAttribute(Attributes.TVG_ID, line.raw),
                name: this.getAttribute(Attributes.TVG_NAME, line.raw),
                logo: this.getAttribute(Attributes.TVG_LOGO, line.raw),
                url: this.getAttribute(Attributes.TVG_URL, line.raw),
                rec: this.getAttribute(Attributes.TVG_REC, line.raw),
            },
            group: {
                title: this.getAttribute(Attributes.GROUP_TITLE, line.raw),
            },
            http: {
                referrer: "",
                "user-agent": this.getAttribute(
                    Attributes.USER_AGENT,
                    line.raw,
                ),
            },
            url: undefined,
            raw: line.raw,
            index: line.index + 1,
            catchup: {
                type: this.getAttribute(Attributes.CATCHUP, line.raw),
                days: this.getAttribute(Attributes.CATCHUP_DAYS, line.raw),
                source: this.getAttribute(Attributes.CATCHUP_SOURCE, line.raw),
            },
            timeshift: this.getAttribute(Attributes.TIMESHIFT, line.raw),
        });
    }

    /**
     * Retrieves the value of a specific attribute from a playlist line.
     *
     * @private
     * @param {Attributes} name - The name of the attribute.
     * @param {string} line - The line containing the attribute.
     * @returns {string} - The value of the attribute.
     */
    private getAttribute(name: Attributes, line: string): string {
        const regex = new RegExp(name + '="(.*?)"', "gi");
        const match = regex.exec(line);

        return (match && match[1] ? match[1] : "")?.trimStart()?.trimEnd();
    }

    /**
     * Retrieves the name from the EXTINF line.
     *
     * @private
     * @param {string} line - The raw EXTINF line.
     * @returns {string} - The parsed name.
     */
    private getName(line: string): string {
        const name = line?.split(/[\r\n]+/)?.shift()?.split(",")
            .pop()?.trimStart()?.trimEnd();
        return name || "";
    }

    /**
     * Retrieves the option value from a playlist line.
     *
     * @private
     * @param {string} line - The raw line.
     * @param {Options} name - The option name.
     * @returns {string} - The option value.
     */
    private getOption(line: string, name: Options): string {
        const regex = new RegExp(":" + name + "=(.*)", "gi");
        const match = regex.exec(line);

        return match && match[1] && typeof match[1] === "string"
            ? match[1].replace(/\"/g, "")
            : "";
    }

    /**
     * Retrieves the value from a line after the colon (e.g., for EXTGRP).
     *
     * @private
     * @param {string} line - The raw line.
     * @returns {string} - The extracted value.
     */
    private getValue(line: string): string {
        const regex = new RegExp(":(.*)", "gi");
        const match = regex.exec(line);

        return match && match[1] && typeof match[1] === "string"
            ? match[1].replace(/\"/g, "")
            : "";
    }

    /**
     * Retrieves the URL from the playlist line.
     *
     * @private
     * @param {string} line - The raw line.
     * @returns {string} - The URL.
     */
    private getUrl(line: string): string {
        return line.split("|")[0] || "";
    }

    /**
     * Retrieves a parameter value from a playlist line (e.g., user-agent, referrer).
     *
     * @private
     * @param {string} line - The raw line.
     * @param {Parameters} name - The parameter name.
     * @returns {string} - The parameter value.
     */
    private getParameter(line: string, name: Parameters): string {
        const params = line.replace(/^(.*)\|/, "");
        const regex = new RegExp(name + "=(\\w[^&]*)", "gi");
        const match = regex.exec(params);

        return match && match[1] ? match[1] : "";
    }

    /**
     * Returns the entire parsed playlist object.
     *
     * @public
     * @returns {Playlist} - The parsed playlist.
     */
    public getPlaylist(): Playlist {
        return {
            header: this.header,
            items: Array.from(this.items.values()),
            raw: this.rawPlaylist,
        };
    }

    /**
     * Returns the parsed playlist filtered by group.
     *
     * @public
     * @param {string} group - The group name to filter by.
     * @returns {Playlist} - The filtered playlist.
     */
    public getPlaylistByGroup(group: string): Playlist {
        const key = group.split("").join("-");
        const cached = this.filteredMap.get(key);

        if (cached) {
            return cached;
        }

        const playlist = {
            header: this.header,
            items: this.getPlaylistItems(group),
        };

        this.filteredMap.set(key, playlist);

        return playlist;
    }

    /**
     * Filters the playlist items based on the group name.
     *
     * @private
     * @param {string} group - The group name to filter by.
     * @returns {PlaylistItem[]} - The filtered playlist items.
     */
    private getPlaylistItems(group: string): PlaylistItem[] {
        return Array.from(this.items.values()).filter((item) =>
            item?.group?.title?.toLowerCase().startsWith(group.toLowerCase())
        );
    }

    /**
     * Returns the parsed playlist filtered by multiple groups.
     *
     * @public
     * @param {string[]} groups - An array of group names.
     * @returns {Playlist} - The filtered playlist by multiple groups.
     */
    public getPlaylistsByGroups(groups: string[]): Playlist {
        const key = groups.join("-");
        const cached = this.filteredMap.get(key);

        if (cached) {
            return cached;
        }

        const items = groups.reduce((acc: PlaylistItem[], group: string) => {
            const playlistItems = this.getPlaylistItems(group);

            return [
                ...acc,
                ...playlistItems,
            ];
        }, []);

        const playlist = {
            header: this.header,
            items,
        };

        this.filteredMap.set(key, playlist);

        return playlist;
    }

    /**
     * Returns an array of all group names from the playlist.
     *
     * @public
     * @returns {string[]} - An array of group names.
     */
    public get playlistGroups(): string[] {
        return Array.from(this.groups);
    }

    /**
     * Serializes the playlist into a string format.
     *
     * @public
     * @returns {string} - The stringified playlist.
     */
    public write(): string {
        const playlist = this.getPlaylist();

        return `${playlist.header.raw}\n`.concat(
            `${playlist.items.map((item) => item.raw).join("\n")}`,
        );
    }

    /**
     * Updates the playlist items.
     *
     * @public
     * @param {Map<number, PlaylistItem>} items - The new map of playlist items.
     * @returns {void}
     */
    public updateItems(items: Map<number, PlaylistItem>): void {
        this.items = items;
    }

    /**
     * Updates the entire playlist.
     *
     * @public
     * @param {Playlist} playlist - The new playlist object.
     * @returns {void}
     */
    public updatePlaylist(playlist: Playlist): void {
        const items = new Map();
        let i = 0;

        if (playlist.items) {
            playlist.items.forEach((item) => {
                items.set(i, PlaylistItemValidator.parse(item));
                i++;
            });
        }

        this.items = items;
    }

    /**
     * Fetches an M3U8 playlist from a URL and parses it.
     *
     * @public
     * @param {string} url - The URL of the playlist.
     * @throws {Error} If the fetch operation fails.
     * @returns {Promise<void>}
     */
    public async fetchPlaylist({ url }: { url: string }): Promise<void> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch playlist: ${response.status}`);
        }

        const playlist = await response.text();
        this.rawPlaylist = playlist;
        this.parse(playlist);
    }

    /**
     * Filters the playlist by specified group names.
     *
     * @public
     * @param {string[]} filters - An array of group names to filter by.
     * @returns {void}
     */
    public filterPlaylist(
        filters?: string[],
    ): void {
        const groupsToFilter = filters?.map((filter) =>
            this.playlistGroups.filter((p) =>
                p.toLowerCase().startsWith(filter.toLowerCase())
            )
        ).flat();

        if (groupsToFilter) {
            const filteredItems = this.getPlaylistsByGroups(groupsToFilter);
            this.updatePlaylist(filteredItems);
        }
    }
}
