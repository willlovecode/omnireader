/**
 * Source.ts — the core contract of the app.
 *
 * The reader, library, and downloader depend ONLY on this interface, never on any
 * specific website. Every source (whether a hardcoded implementation or one driven
 * by a declarative config through the generic engine) implements `Source`.
 *
 * Manga/manhwa/webtoons and light novels both flow through this same interface.
 * The only difference is the shape of the content returned by `getContent()`,
 * discriminated by `contentType`.
 */

// ---------------------------------------------------------------------------
// Shared domain types
// ---------------------------------------------------------------------------

export type ContentType = 'image' | 'text';

/** A lightweight entry as it appears in a catalog or search result list. */
export interface SeriesListItem {
  /** Stable identifier WITHIN this source (usually the series URL or a slug). */
  id: string;
  sourceId: string;
  title: string;
  coverUrl?: string;
  contentType: ContentType;
}

/** Full metadata for one series (manga or novel). */
export interface SeriesDetails extends SeriesListItem {
  authors?: string[];
  description?: string;
  genres?: string[];
  status?: 'ongoing' | 'completed' | 'hiatus' | 'cancelled' | 'unknown';
}

/** One chapter/episode. */
export interface Chapter {
  /** Stable identifier within the source (usually the chapter URL). */
  id: string;
  sourceId: string;
  seriesId: string;
  title: string;
  /** Chapter number if the site exposes one; useful for ordering/dedupe. */
  number?: number;
  /** ISO 8601 date string if available. */
  publishedAt?: string;
}

/**
 * The content of a single chapter.
 * Discriminated union so image and text sources share one method signature.
 */
export type ChapterContent =
  | {
      contentType: 'image';
      pages: string[]; // ordered list of page image URLs
      /** Extra headers (e.g. Referer) the reader must send when loading
       *  `pages` — some sites hotlink-protect their image CDN. */
      headers?: Record<string, string>;
    }
  | { contentType: 'text'; html: string }; // sanitized chapter body as HTML

/** Paged results, for catalogs/search that support pagination. */
export interface Page<T> {
  items: T[];
  hasNextPage: boolean;
}

/** Optional per-request headers a source may require (referer, cookies, UA). */
export interface RequestContext {
  headers?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// The Source interface
// ---------------------------------------------------------------------------

export interface SourceInfo {
  id: string;          // globally unique source id, e.g. "example-manga-en"
  name: string;        // human-readable, e.g. "Example Manga"
  lang: string;        // BCP-47, e.g. "en", "ja", "de"
  contentType: ContentType;
  /** Base site URL, for display and for resolving relative links. */
  baseUrl: string;
  /** Config/schema version this source was built against. */
  version: string;
}

export interface Source {
  readonly info: SourceInfo;

  /** Browse the source's popular/catalog listing. */
  getPopular(page: number, ctx?: RequestContext): Promise<Page<SeriesListItem>>;

  /** Full-text search within the source. */
  search(
    query: string,
    page: number,
    ctx?: RequestContext,
  ): Promise<Page<SeriesListItem>>;

  /** Fetch full metadata for one series. */
  getDetails(seriesId: string, ctx?: RequestContext): Promise<SeriesDetails>;

  /** List all chapters/episodes for a series (newest-first or oldest-first;
   *  the app normalizes ordering using Chapter.number when present). */
  getChapters(seriesId: string, ctx?: RequestContext): Promise<Chapter[]>;

  /** Fetch the readable content of one chapter (pages OR text). */
  getContent(chapterId: string, ctx?: RequestContext): Promise<ChapterContent>;
}

// ---------------------------------------------------------------------------
// Notes for implementers
// ---------------------------------------------------------------------------
//
// - `id` fields are opaque to the app. Most sources use the URL as the id.
// - Never throw raw network errors; wrap them so the UI can show a friendly
//   "source unavailable" state and the health-checker can flag it.
// - `getContent` MUST return a discriminated union matching `info.contentType`.
// - The generic declarative engine (src/sources/engine) implements this SAME
//   interface driven by a config object — so the rest of the app cannot tell a
//   config-driven source from a hand-written one. That is the whole point.
