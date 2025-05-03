/**
 * M3U8Parser - A class designed to parse and filter M3U8 playlists.
 *
 * This class allows you to load M3U8 playlists from a raw string or fetch them from a URL.
 * The parser can be used to access, filter, and manipulate the playlist data,
 * making it ideal for working with M3U8 streams.
 *
 * @module M3U8Parser
 *
 * @example Example of parsing a raw M3U8 playlist from a string:
 * ```ts
 * const rawPlaylist = `#EXTM3U
 * #EXTINF:-1,Example Channel
 * http://example.com/channel.m3u8
 * #EXTGRP:Group A
 * http://example.com/channel2.m3u8
 * #EXTINF:-1,Another Channel
 * http://example.com/channel3.m3u8
 * `;
 * const parser = new M3U8Parser({ playlist: rawPlaylist });
 *
 * // Get the full parsed playlist
 * const fullPlaylist = parser.getPlaylist();
 * console.log(fullPlaylist);
 *
 * // Filter the playlist by group "Group A"
 * const groupAPlaylist = parser.getPlaylistByGroup("Group A");
 * console.log(groupAPlaylist);
 * ```
 *
 * @example Example of fetching and parsing an M3U8 playlist from a URL:
 * ```ts
 * const url = 'https://example.com/path/to/playlist.m3u8';
 * const parser = new M3U8Parser({ url });
 *
 * // Wait for the playlist to be fetched and parsed
 * parser.fetchPlaylist({ url }).then(() => {
 *     // Get the full parsed playlist
 *     const fullPlaylist = parser.getPlaylist();
 *     console.log(fullPlaylist);
 *
 *     // Filter the playlist by group "Sports"
 *     const sportsPlaylist = parser.getPlaylistByGroup("Sports");
 *     console.log(sportsPlaylist);
 * }).catch((error) => {
 *     console.error('Failed to fetch or parse the playlist:', error);
 * });
 * ```
 */
export { M3U8Parser } from "./parser.ts";

/**
 * Re-exports various types and validators used in the playlist processing.
 *
 * @typedef {object} Attributes - Key-value pairs associated with M3U8 tags.
 * @typedef {object} Options - Configuration options for parsing.
 * @typedef {object} Parameters - Parameters used during parsing.
 * @typedef {function} PlaylistItemTvgValidator - Function to validate TVG-specific data in playlist items.
 * @typedef {function} PlaylistItemValidator - Function to validate generic playlist items.
 */
export {
    Attributes,
    Options,
    Parameters,
    PlaylistItemTvgValidator,
    PlaylistItemValidator,
} from "./types.ts";

/**
 * Re-exports various type definitions used throughout the M3U8 parsing process.
 *
 * @typedef {object} ParsedLine - Represents a parsed line from an M3U8 file.
 * @typedef {object} Playlist - Represents the entire playlist structure.
 * @typedef {object} PlaylistHeader - Metadata found at the top of a playlist.
 * @typedef {object} PlaylistItem - Represents a media item in the playlist.
 * @typedef {object} PlaylistItemTvg - Represents TVG metadata within a playlist item.
 */
export type {
    ParsedLine,
    Playlist,
    PlaylistHeader,
    PlaylistItem,
    PlaylistItemTvg,
} from "./types.ts";
