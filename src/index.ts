/**
 * Exports the M3U8Parser class responsible for parsing M3U8 playlist files.
 * @module parser
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
