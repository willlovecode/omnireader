# CLAUDE.md — Reader App

Project instructions for Claude Code. Read this fully before making changes.
Keep this file up to date when architecture decisions change.

## What this project is

A cross-platform (iOS + Android) reading app that unifies **image-based content**
(manga, manhwa, webtoons) and **text-based content** (light novels) in a single
library and reading experience. Personal project for the author and a small group
of friends — not intended for App Store / Play Store listing.

Content comes from **sources**: declarative configs that describe how to scrape a
website. The app ships a generic parsing engine that reads these configs. Sources
live outside the app in a separate registry repo and can be added at runtime.

## Non-negotiable architecture principles

1. **One app, two render surfaces.** Everything (library, source interface,
   downloader, progress tracking) is shared across content types. The ONLY place
   the code branches on content type is the final reader component, keyed on
   `contentType: 'image' | 'text'`. Do not fork the data model, library, or source
   layer per content type.

2. **Sources are DATA, not code.** A source is a declarative config (selectors +
   URLs + flags), validated against a JSON schema, parsed by ONE generic engine.
   Never `eval` or execute remote code. This keeps source-adding safe and simple.
   If a site genuinely can't be described declaratively, add an optional
   "render in hidden WebView first" flag to the config — do not add a code-execution
   escape hatch without explicit discussion.

3. **The Source interface is the contract.** The reader, library, and downloader
   depend ONLY on the `Source` interface (see `src/sources/Source.ts`), never on any
   specific site. Adding a site must never require touching reader/library code.

4. **Data must survive re-signing.** iOS friends sideload via SideStore, which
   re-signs the app every 7 days. Data persists across re-signs as long as the
   **bundle ID never changes**. Bundle ID is locked (see below) — do not change it.
   Additionally, always keep a working **export/import** of the full library +
   progress to a JSON file as a backup path.

## Locked decisions (do not change without updating this file)

- **Stack:** React Native + Expo + TypeScript.
- **Bundle ID / app identifier:** `com.omni.reader`  <!-- set once, then NEVER change -->
- **Local DB:** SQLite via `expo-sqlite` (+ a typed query layer — Drizzle preferred).
- **Async/data fetching:** TanStack Query for source calls.
- **State:** Zustand for app/UI state.
- **HTML parsing:** `cheerio` (or `node-html-parser`) in the generic source engine.
- **Lists/virtualization:** FlashList for library grids and webtoon readers.

## Repo layout (target)

```
src/
  db/                 # SQLite schema, migrations, typed queries
  models/             # shared domain types (Manga, Chapter, Progress, ...)
  sources/
    Source.ts         # the Source INTERFACE (the contract)
    engine/           # generic declarative-config parser (implements Source)
    registry/         # fetch + validate source configs from the registry repo
  library/            # library screens, tracking, downloads
  reader/
    ImageReader/      # manga/manhwa/webtoon viewer (paging + webtoon scroll)
    TextReader/       # light-novel viewer (themes, fonts, chapter nav)
  backup/             # export/import library+progress to JSON
  navigation/
  ui/                 # shared components
```

The **source registry is a SEPARATE repo** (not in this tree): it holds
`sources.json` (index + health status) and one config file per source, plus a
GitHub Actions workflow that re-checks sources and updates health. The app only
*reads* from it.

## Content-type handling rules

- Domain models carry `contentType: 'image' | 'text'`.
- A `Source` may serve either type; `getContent()` returns either page image URLs
  (image) or chapter text (text) — see the interface.
- Library, search, details, downloads: identical code paths for both types.
- Reader selection: a thin switch renders `ImageReader` or `TextReader`. That switch
  is the single branch point. Keep it that way.

## Working conventions for Claude Code

- Build in this order: (1) reader UIs against LOCAL bundled content first, no
  networking; (2) SQLite schema + library; (3) ONE hardcoded source end-to-end;
  (4) extract/confirm the generic engine + config schema; (5) registry fetch +
  manual add; (6) downloader + offline; (7) export/import backup.
- Prefer small, reviewable diffs. Explain any change that touches the Source
  interface or the DB schema before making it.
- Never introduce a second way to do networking that bypasses the Source interface.
- Do not add analytics, telemetry, or crash reporters that phone home.
- When adding a dependency, note WHY in the commit message.
- Keep TypeScript strict; no `any` in the source engine or models.

## Out of scope (do not build unless asked)

- App Store / Play Store release tooling.
- Remote code execution for sources.
- Server-side scraping proxy (the app fetches directly from each device).
- Accounts / cloud sync (backup is local-file export/import only, for now).
