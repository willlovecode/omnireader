# omnireader

A reading app for manga, manhwa and light novels, built with Expo and React Native.

Sources are plain JSON configs, not code. One generic engine reads a config and turns it into a
working source, so a new site is added by writing data, without a new app release. The configs live in
[omnireader-registry](https://github.com/willlovecode/omnireader-registry) and are fetched at
runtime; bundled copies ship with the app as an offline fallback.

## Features

- Browse, search and open series from any configured source
- Image reader with paged and webtoon (vertical scroll) modes, page slider and image preloading
- Text reader for light novels
- Library with update grouping, read history and an incognito mode
- Chapter downloads for offline reading
- Library and progress backup to a JSON file, and restore from one
- Themes, accent colours and alternative app icons

## How sources work

```text
sources/<id>.json  ──validateConfig──▶  config  ──createSourceFromConfig──▶  Source
                                                                            │
                                    reader · library · downloads ◀──────────┘
```

- `src/sources/engine/` is the only interpreter. Nothing in a config is executed: there is no
  `eval`, and regexes are compiled by the validator, so a bad pattern is a config error.
- The engine has no React Native dependency, so the same code runs in the app and in Node
  (`scripts/smoke-sources.ts` checks every config against the live site).
- The format is described by a JSON Schema (`src/sources/engine/schema.json`) and documented in
  [src/sources/engine/README.md](src/sources/engine/README.md).

## Stack

Expo SDK 54 · React Native 0.81 · TypeScript · React Navigation · TanStack Query · Zustand ·
SQLite with Drizzle ORM · cheerio

## Run locally

Requires Node.js and npm. The app uses `expo-dev-client`, so run it in a development build.

```bash
npm install
npm start
```

## Legal

omnireader hosts no content. It reads pages that a source config points to, in the same way a
browser does. Use it only with sites whose content you are allowed to access.

## License

MIT
