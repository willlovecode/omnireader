import type { Chapter, ChapterContent, Page, SeriesDetails, SeriesListItem, Source } from '../Source';
import { fetchHtml } from '../httpHtml';
import { parseMadaraPageImages, parseMadaraSeriesList } from '../madara/madaraCommon';
import { parseRelativeAgo } from '../relativeDate';

// Hand-written source (CLAUDE.md build order step 3). arenascans.org runs
// WordPress + the Madara theme, but on a heavily customized child theme
// ("madara-child-mk") — the details-page markup (h1.htitle, .hchips--genres
// etc.) is site-specific, NOT the stock Madara classes other Madara sites
// use. Listing/search and the chapter-reading-page markup DO match stock
// Madara (see ../madara/madaraCommon.ts). Verified live 2026-07-13.
//
// One nice find: this skin embeds the full chapter list as JSON in a
// <script id="mk-chapters-data"> tag (normally rendered client-side by
// mk-chapters.js) — easier and more reliable to parse than the usual
// HTML chapter-row table.

const SOURCE_ID = 'arenascans';
const BASE_URL = 'https://arenascans.org';

const STATUS_MAP: Record<string, SeriesDetails['status']> = {
  ongoing: 'ongoing',
  completed: 'completed',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  'on hold': 'hiatus',
};

function parseStatus(text: string): SeriesDetails['status'] {
  return STATUS_MAP[text.trim().toLowerCase()] ?? 'unknown';
}

interface MkChapterItem {
  id: number;
  num: string;
  name: string;
  url: string;
  ago: string;
}

export const arenaScansSource: Source = {
  info: {
    id: SOURCE_ID,
    name: 'Arena Scans',
    lang: 'en',
    contentType: 'image',
    baseUrl: BASE_URL,
    version: '1.0.0',
  },

  async getPopular(page, ctx) {
    const $ = await fetchHtml(`${BASE_URL}/page/${page}/?s&post_type=wp-manga&m_orderby=latest`, BASE_URL, ctx);
    const items = parseMadaraSeriesList($, SOURCE_ID);
    return { items, hasNextPage: items.length > 0 };
  },

  async search(query, page, ctx): Promise<Page<SeriesListItem>> {
    const url = `${BASE_URL}/page/${page}/?s=${encodeURIComponent(query)}&post_type=wp-manga`;
    const $ = await fetchHtml(url, BASE_URL, ctx);
    const items = parseMadaraSeriesList($, SOURCE_ID);
    return { items, hasNextPage: items.length > 0 };
  },

  async getDetails(seriesId, ctx): Promise<SeriesDetails> {
    const $ = await fetchHtml(seriesId, BASE_URL, ctx);

    const title = $('h1.htitle').first().text().trim();
    const coverUrl = $('.hposter img').attr('data-src')?.trim() || $('.hposter img').attr('src');
    const description = $('meta[property="og:description"]').attr('content')?.trim();
    const genres = $('.hchips--genres a.chip')
      .map((_, el) => $(el).text().trim())
      .get();
    const status = parseStatus($('.htag--status').first().text());

    return {
      id: seriesId,
      sourceId: SOURCE_ID,
      title,
      coverUrl,
      contentType: 'image',
      description,
      genres,
      status,
    };
  },

  async getChapters(seriesId, ctx): Promise<Chapter[]> {
    const $ = await fetchHtml(seriesId, BASE_URL, ctx);
    const raw = $('#mk-chapters-data').html();
    if (!raw) return [];

    const parsed = JSON.parse(raw) as { items?: MkChapterItem[] };
    return (parsed.items ?? []).map((item) => ({
      id: item.url,
      sourceId: SOURCE_ID,
      seriesId,
      title: item.name,
      number: Number.parseFloat(item.num),
      publishedAt: parseRelativeAgo(item.ago),
    }));
  },

  async getContent(chapterId, ctx): Promise<ChapterContent> {
    const $ = await fetchHtml(chapterId, BASE_URL, ctx);
    const pages = parseMadaraPageImages($);
    if (pages.length === 0) {
      throw new Error('ArenaScans: could not find page images in chapter page');
    }
    return { contentType: 'image', pages, headers: { Referer: BASE_URL } };
  },
};
