# M3U8Parser

`M3U8Parser` is a TypeScript class designed to parse and filter M3U8 playlists.
It allows you to load M3U8 playlists from a raw string or fetch them from a URL.
The parser can be used to access, filter, and manipulate the playlist data,
making it ideal for working with M3U8 streams.

## Installation

You can install `M3U8Parser` by simply importing it into your project:

```bash
deno add jsr:@fbritoferreira/m3u8
```

## Usage

Below are some examples of how to use `M3U8Parser` in different scenarios.

### Example 1: Using the Parser with a Raw Playlist

This example shows how to initialize the `M3U8Parser` with a raw playlist string
and retrieve the parsed playlist and filtered groups.

```js
/**
 * Example of parsing a raw M3U8 playlist from a string.
 *
 * This demonstrates how to initialize the M3U8Parser with a raw playlist string
 * and retrieve the parsed playlist and filtered groups.
 *
 * @example
 * const rawPlaylist = `#EXTM3U
 * #EXTINF:-1,Example Channel
 * http://example.com/channel.m3u8
 * #EXTGRP:Group A
 * http://example.com/channel2.m3u8
 * #EXTINF:-1,Another Channel
 * http://example.com/channel3.m3u8
 * `;
 *
 * const parser = new M3U8Parser({ playlist: rawPlaylist });
 *
 * // Get the full parsed playlist
 * const fullPlaylist = parser.getPlaylist();
 * console.log(fullPlaylist);
 *
 * // Filter the playlist by group "Group A"
 * const groupAPlaylist = parser.getPlaylistByGroup("Group A");
 * console.log(groupAPlaylist);
 */
const rawPlaylist = `#EXTM3U
#EXTINF:-1,Example Channel
http://example.com/channel.m3u8
#EXTGRP:Group A
http://example.com/channel2.m3u8
#EXTINF:-1,Another Channel
http://example.com/channel3.m3u8
`;

const parser = new M3U8Parser({ playlist: rawPlaylist });

// Get the full parsed playlist
const fullPlaylist = parser.getPlaylist();
console.log(fullPlaylist);

// Filter the playlist by group "Group A"
const groupAPlaylist = parser.getPlaylistByGroup("Group A");
console.log(groupAPlaylist);
```

### Example 2: Fetching and Parsing a Playlist from a URL

This example demonstrates how to initialize the `M3U8Parser` with a URL, fetch
the playlist, parse it, and then filter by group.

```js
/**
 * Example of fetching and parsing an M3U8 playlist from a URL.
 *
 * This demonstrates how to initialize the M3U8Parser with a URL, fetch the playlist,
 * parse it, and then filter by group.
 *
 * @example
 * const url = 'https://example.com/path/to/playlist.m3u8';
 *
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
 */
const url = "https://example.com/path/to/playlist.m3u8";

const parser = new M3U8Parser({ url });

// Wait for the playlist to be fetched and parsed
parser.fetchPlaylist({ url }).then(() => {
    // Get the full parsed playlist
    const fullPlaylist = parser.getPlaylist();
    console.log(fullPlaylist);

    // Filter the playlist by group "Sports"
    const sportsPlaylist = parser.getPlaylistByGroup("Sports");
    console.log(sportsPlaylist);
}).catch((error) => {
    console.error("Failed to fetch or parse the playlist:", error);
});
```

### Methods

Here are some of the key methods available in the `M3U8Parser` class:

- **`getPlaylist()`**: Returns the full parsed playlist.
- **`getPlaylistByGroup(group: string)`**: Returns a playlist filtered by the
  specified group.
- **`getPlaylistsByGroups(groups: string[])`**: Returns a playlist filtered by
  multiple groups.
- **`playlistGroups()`**: Returns an array of all group names in the playlist.
- **`write()`**: Returns the playlist as a string (stringified playlist).
- **`filterPlaylist(filters?: string[])`**: Filters the playlist by group(s).
