import { z } from "zod";

/**
 * Represents the header section of a playlist, typically containing metadata.
 */
export interface PlaylistHeader {
    /**
     * Attributes extracted from the header line.
     */
    attrs: {
        /** URL pointing to TVG (TV Guide) data. */
        "x-tvg-url": string;
    };
    /**
     * The raw header line from the playlist.
     */
    raw: string;
}

/**
 * Metadata related to the TV Guide (EPG) for a playlist item.
 */
export type PlaylistItemTvg = {
    /** TVG channel ID. */
    id: string;
    /** Display name of the channel. */
    name: string;
    /** Channel stream URL. */
    url: string;
    /** Logo image URL. */
    logo: string;
    /** Recording status flag. */
    rec: string;
};

/**
 * A Zod schema validator for `PlaylistItemTvg`.
 */
export const PlaylistItemTvgValidator: z.Schema<PlaylistItemTvg> = z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    logo: z.string(),
    rec: z.string(),
});

/**
 * Represents a single item (channel) in an M3U8 playlist.
 */
export type PlaylistItem = {
    /** Display name of the playlist item. */
    name: string;
    /** Order index in the playlist. */
    index: number;
    /** TVG (EPG) metadata. */
    tvg: PlaylistItemTvg;
    /** Grouping metadata for UI or organization. */
    group: {
        title: string;
    };
    /** HTTP headers like referrer and user-agent. */
    http: {
        referrer: string;
        "user-agent": string;
    };
    /** URL of the stream. */
    url?: string;
    /** Raw line representing this item in the file. */
    raw: string;
    /** Timeshift value. */
    timeshift: string;
    /** Catchup TV metadata. */
    catchup: {
        type: string;
        source: string;
        days: string;
    };
};

/**
 * A Zod schema validator for `PlaylistItem`.
 */
export const PlaylistItemValidator: z.Schema<PlaylistItem> = z.object({
    name: z.string(),
    index: z.number(),
    tvg: PlaylistItemTvgValidator,
    group: z.object({
        title: z.string(),
    }),
    http: z.object({
        referrer: z.string(),
        "user-agent": z.string(),
    }),
    url: z.string().optional(),
    raw: z.string(),
    timeshift: z.string(),
    catchup: z.object({
        type: z.string(),
        source: z.string(),
        days: z.string(),
    }),
});

/**
 * A complete M3U8 playlist including header metadata and list of items.
 */
export interface Playlist {
    /** Metadata at the top of the playlist. */
    header: PlaylistHeader;
    /** List of playlist items (channels). */
    items: PlaylistItem[];
    /** Optional full raw playlist content. */
    raw?: string;
}

/**
 * Represents a single parsed line in the M3U8 file.
 */
export type ParsedLine = {
    /** Index of the line in the original file. */
    index: number;
    /** Raw content of the line. */
    raw: string;
};

/**
 * Known attribute keys used in M3U8 tags.
 */
export enum Attributes {
    TVG_ID = "tvg-id",
    X_TVG_URL = "x-tvg-url",
    URL_TVG = "url-tvg",
    TVG_NAME = "tvg-name",
    TVG_LOGO = "tvg-logo",
    TVG_URL = "tvg-url",
    TVG_REC = "tvg-rec",
    GROUP_TITLE = "group-title",
    USER_AGENT = "user-agent",
    CATCHUP = "catchup",
    CATCHUP_DAYS = "catchup-days",
    CATCHUP_SOURCE = "catchup-source",
    TIMESHIFT = "timeshift",
}

/**
 * Options related to HTTP headers for stream playback or parsing.
 */
export enum Options {
    HTTP_REFERRER = "http-referrer",
    HTTP_USER_AGENT = "http-user-agent",
}

/**
 * Query parameters commonly used in stream URLs.
 */
export enum Parameters {
    USER_AGENT = "user-agent",
    REFERER = "referer",
}
