import type { Chapter, ChapterContent, Page, SeriesDetails, SeriesListItem, Source } from '../Source';
import { fetchHtml } from '../httpHtml';
import { parseMadaraPageImages, parseMadaraSeriesList } from '../madara/madaraCommon';
import { parseRelativeAgo } from '../relativeDate';

// Hand-written source (CLAUDE.md build order step 3). aquareader.org is
// Madara too, on a DIFFERENT custom child theme than arenascans.org
// ("aqua-series-*" classes vs. arenascans' "h*"/"mk-*") — confirms details
// pages need per-site selectors even across sites sharing the same base
// theme. Listing/search and the chapter-reading-page markup match stock
// Madara (see ../madara/madaraCommon.ts), and this site's chapter list is
// plain server-rendered HTML (no embedded-JSON trick like arenascans).
// Verified live 2026-07-13.

const SOURCE_ID = 'aquareader';
const BASE_URL = 'https://aquareader.org';

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

export const aquaReaderSource: Source = {
  info: {
    id: SOURCE_ID,
    name: 'Aqua Reader',
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

    const title = $('.aqua-series-info__title').first().text().trim();
    const coverUrl = $('.aqua-series-cover img').attr('src')?.trim();
    const description = $('#aqua-synopsis p')
      .map((_, el) => $(el).text().trim())
      .get()
      .join('\n\n');
    const genres = $('.aqua-series-genre-pill')
      .map((_, el) => $(el).text().trim())
      .get();
    const status = parseStatus($('.aqua-series-meta__status').first().text());

    const authors: string[] = [];
    $('.aqua-series-info__creator').each((_, el) => {
      const block = $(el);
      const label = block.find('.aqua-series-info__creator-label').text().trim().toLowerCase();
      if (label === 'author') {
        authors.push(block.find('.aqua-series-info__creator-value').text().trim());
      }
    });

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

    $('.aqua-ch-item').each((_, el) => {
      const row = $(el);
      const id = row.attr('href');
      const title = row.find('.aqua-ch-item__name').text().trim();
      if (!id || !title) return;

      const numberMatch = title.match(/chapter\s+([\d.]+)/i);
      const number = numberMatch ? Number.parseFloat(numberMatch[1]) : undefined;
      const publishedAt = parseRelativeAgo(row.find('.aqua-ch-item__time').text());

      chapters.push({ id, sourceId: SOURCE_ID, seriesId, title, number, publishedAt });
    });

    return chapters;
  },

  async getContent(chapterId, ctx): Promise<ChapterContent> {
    const $ = await fetchHtml(chapterId, BASE_URL, ctx);
    const pages = parseMadaraPageImages($);
    if (pages.length === 0) {
      throw new Error('AquaReader: could not find page images in chapter page');
    }
    return { contentType: 'image', pages, headers: { Referer: BASE_URL } };
  },
};
