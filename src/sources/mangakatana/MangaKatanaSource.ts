// A cheerio type-only import; the "slim" entry point (used in fetchHtml, see
// ../httpHtml.ts) skips cheerio's parse5 + undici-based fromURL() helper,
// which pulls in Node core modules (node:stream) that don't exist in React
// Native / Metro.
import type { CheerioAPI } from 'cheerio/slim';

import type { Chapter, ChapterContent, Page, SeriesDetails, SeriesListItem, Source } from '../Source';
import { dedupeById } from '../dedupeById';
import { fetchHtml } from '../httpHtml';

// Hand-written, single-site implementation (CLAUDE.md build order step 3).
// Selectors verified live 2026-07-12 against mangakatana.com, cross-checked
// against the community Aidoku source for the same site
// (github.com/Skittyblock/aidoku-community-sources, src/rust/en.mangakatana)
// for the page-image-list extraction trick. This site isn't part of the
// Madara theme family (see ../madara/madaraCommon.ts) — its markup is
// unique to it, so nothing here is shared with other sources yet.

const SOURCE_ID = 'mangakatana';
const BASE_URL = 'https://mangakatana.com';

const STATUS_MAP: Record<string, SeriesDetails['status']> = {
  ongoing: 'ongoing',
  completed: 'completed',
  cancelled: 'cancelled',
};

function parseStatus(text: string): SeriesDetails['status'] {
  return STATUS_MAP[text.trim().toLowerCase()] ?? 'unknown';
}

const MONTHS: Record<string, string> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
};

/** Parses MangaKatana's "Jul-08-2026" chapter date format into ISO 8601. */
function parseChapterDate(text: string): string | undefined {
  const match = text.trim().match(/^([A-Za-z]{3})-(\d{2})-(\d{4})$/);
  if (!match) return undefined;
  const month = MONTHS[match[1].toLowerCase()];
  if (!month) return undefined;
  return `${match[3]}-${month}-${match[2]}T00:00:00.000Z`;
}

function parseSeriesList($: CheerioAPI): SeriesListItem[] {
  const items: SeriesListItem[] = [];
  $('#book_list > .item').each((_, el) => {
    const node = $(el);
    const link = node.find('.text .title a').first();
    const id = link.attr('href');
    const title = link.text().trim();
    const coverUrl = node.find('.media .wrap_img img').attr('src');
    if (id && title) {
      items.push({ id, sourceId: SOURCE_ID, title, coverUrl, contentType: 'image' });
    }
  });
  return dedupeById(items);
}

function hasNextPage($: CheerioAPI, items: SeriesListItem[]): boolean {
  return items.length > 0 && $('.uk-pagination .next').length > 0;
}

export const mangaKatanaSource: Source = {
  info: {
    id: SOURCE_ID,
    name: 'MangaKatana',
    lang: 'en',
    contentType: 'image',
    baseUrl: BASE_URL,
    version: '1.0.0',
  },

  async getPopular(page, ctx) {
    const $ = await fetchHtml(`${BASE_URL}/manga/page/${page}?filter=1`, BASE_URL, ctx);
    const items = parseSeriesList($);
    return { items, hasNextPage: hasNextPage($, items) };
  },

  async search(query, page, ctx): Promise<Page<SeriesListItem>> {
    const url = `${BASE_URL}/page/${page}?search=${encodeURIComponent(query)}&search_by=book_name`;
    const $ = await fetchHtml(url, BASE_URL, ctx);
    const items = parseSeriesList($);
    return { items, hasNextPage: hasNextPage($, items) };
  },

  async getDetails(seriesId, ctx): Promise<SeriesDetails> {
    const $ = await fetchHtml(seriesId, BASE_URL, ctx);
    const root = $('#single_book');

    const title = root.find('.info .heading').first().text().trim();
    const coverUrl = root.find('.cover img').attr('src');
    const authors = root
      .find('.meta .authors a, .meta .author')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);
    const description = root.find('.summary p').text().trim();
    const genres = root
      .find('.meta .genres a')
      .map((_, el) => $(el).text().trim())
      .get();
    const status = parseStatus(root.find('.meta .value.status').text());

    return {
      id: seriesId,
      sourceId: SOURCE_ID,
      title,
      coverUrl,
      contentType: 'image',
      authors,
      description,
      genres,
      status,
    };
  },

  async getChapters(seriesId, ctx): Promise<Chapter[]> {
    const $ = await fetchHtml(seriesId, BASE_URL, ctx);
    const chapters: Chapter[] = [];

    $('#single_book .chapters tr').each((_, el) => {
      const row = $(el);
      const link = row.find('.chapter a');
      const id = link.attr('href');
      const title = link.text().trim();
      if (!id || !title) return;

      const numberMatch = title.match(/chapter\s+([\d.]+)/i);
      const number = numberMatch ? Number.parseFloat(numberMatch[1]) : undefined;
      const publishedAt = parseChapterDate(row.find('.update_time').text());

      chapters.push({ id, sourceId: SOURCE_ID, seriesId, title, number, publishedAt });
    });

    return chapters;
  },

  async getContent(chapterId, ctx): Promise<ChapterContent> {
    const $ = await fetchHtml(chapterId, BASE_URL, ctx);
    const pages = extractPageUrls($);
    return { contentType: 'image', pages, headers: { Referer: BASE_URL } };
  },
};

/**
 * Page image URLs aren't in plain HTML — they're written into a JS array by
 * the page's own inline script (obfuscated CDN tokens), preceded by a
 * decoy one-element array. Find the script that wires these into `data-src`
 * attributes, then take the LAST `=[...]` array in it (the decoy is always
 * first) — same trick the reference Aidoku source uses for this site.
 */
function extractPageUrls($: CheerioAPI): string[] {
  const scripts = $('script').toArray();

  for (const scriptEl of scripts) {
    const script = $(scriptEl).html() ?? '';
    if (!script.includes('data-src')) continue;

    const startMarker = '=[';
    const endMarker = ',];';
    const start = script.lastIndexOf(startMarker);
    const end = script.lastIndexOf(endMarker);
    if (start === -1 || end === -1 || end <= start) continue;

    const arrayBody = script.slice(start + startMarker.length, end);
    const urls = arrayBody
      .split(',')
      .map((entry) => entry.trim().replace(/^'|'$/g, ''))
      .filter(Boolean);
    if (urls.length > 0) return urls;
  }

  throw new Error('MangaKatana: could not find page image list in chapter page');
}
