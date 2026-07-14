import type { CheerioAPI } from 'cheerio/slim';

import type { Chapter, ChapterContent, Page, SeriesDetails, SeriesListItem, Source } from '../Source';
import { getIslandProps } from '../astroIslandProps';
import { dedupeById } from '../dedupeById';
import { fetchHtml } from '../httpHtml';

// Hand-written source (CLAUDE.md build order step 3). asurascans.com is an
// Astro site — looked like it might need JS execution (its /browse page
// showed no results for a wrong URL guess during initial research), but
// turned out to be properly server-rendered: `curl` alone returns full data
// for listing, details, and chapter pages, no WebView needed. Verified live
// 2026-07-13. Details/chapters/pages all come from Astro's server-rendered
// island props (see ../astroIslandProps.ts) rather than DOM scraping, which
// is more robust against CSS redesigns than the class-selector approach the
// other sources need.

const SOURCE_ID = 'asurascans';
const BASE_URL = 'https://asurascans.com';

interface DescriptionModalProps {
  title: string;
  description: string; // HTML string
  coverUrl: string;
  status: string;
  author?: string;
  artist?: string;
  genres: { id: number; name: string; slug: string }[];
}

interface ChapterListProps {
  chapters: {
    slug: string;
    number: number;
    series_slug: string;
    published_at?: string;
    time_ago?: string;
  }[];
}

interface ChapterReaderProps {
  seriesSlug: string;
  chapterName: string;
  pages: { url: string }[];
}

const STATUS_MAP: Record<string, SeriesDetails['status']> = {
  ongoing: 'ongoing',
  completed: 'completed',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  hiatus: 'hiatus',
  dropped: 'cancelled',
};

function parseSeriesList($: CheerioAPI): SeriesListItem[] {
  const items: SeriesListItem[] = [];
  $('.series-card').each((_, el) => {
    const node = $(el);
    const link = node.find('a[href^="/comics/"]').first();
    const href = link.attr('href');
    const title = node.find('h3').first().text().trim();
    const coverUrl = node.find('img').attr('src')?.trim();
    if (href && title) {
      items.push({ id: `${BASE_URL}${href}`, sourceId: SOURCE_ID, title, coverUrl, contentType: 'image' });
    }
  });
  return dedupeById(items);
}

export const asuraScansSource: Source = {
  info: {
    id: SOURCE_ID,
    name: 'Asura Scans',
    lang: 'en',
    contentType: 'image',
    baseUrl: BASE_URL,
    version: '1.0.0',
  },

  async getPopular(page, ctx) {
    const $ = await fetchHtml(`${BASE_URL}/browse?page=${page}`, BASE_URL, ctx);
    const items = parseSeriesList($);
    return { items, hasNextPage: items.length > 0 };
  },

  async search(query, page, ctx): Promise<Page<SeriesListItem>> {
    const $ = await fetchHtml(`${BASE_URL}/browse?page=${page}&q=${encodeURIComponent(query)}`, BASE_URL, ctx);
    const items = parseSeriesList($);
    return { items, hasNextPage: items.length > 0 };
  },

  async getDetails(seriesId, ctx): Promise<SeriesDetails> {
    const $ = await fetchHtml(seriesId, BASE_URL, ctx);
    const props = getIslandProps<DescriptionModalProps>($, 'DescriptionModal');
    if (!props) throw new Error('AsuraScans: could not find series details data');

    return {
      id: seriesId,
      sourceId: SOURCE_ID,
      title: props.title,
      coverUrl: props.coverUrl,
      contentType: 'image',
      authors: [props.author, props.artist].filter((v): v is string => !!v),
      description: cheerioTextOf(props.description),
      genres: props.genres.map((g) => g.name),
      status: STATUS_MAP[props.status.toLowerCase()] ?? 'unknown',
    };
  },

  async getChapters(seriesId, ctx): Promise<Chapter[]> {
    const $ = await fetchHtml(seriesId, BASE_URL, ctx);
    const props = getIslandProps<ChapterListProps>($, 'ChapterListReact');
    if (!props) return [];

    return props.chapters.map((chapter) => ({
      id: `${BASE_URL}/comics/${chapter.series_slug}/chapter/${chapter.number}`,
      sourceId: SOURCE_ID,
      seriesId,
      title: `Chapter ${chapter.number}`,
      number: chapter.number,
      publishedAt: chapter.published_at,
    }));
  },

  async getContent(chapterId, ctx): Promise<ChapterContent> {
    const $ = await fetchHtml(chapterId, BASE_URL, ctx);
    const props = getIslandProps<ChapterReaderProps>($, 'ChapterReader');
    if (!props || props.pages.length === 0) {
      throw new Error('AsuraScans: could not find page images for this chapter');
    }
    return { contentType: 'image', pages: props.pages.map((p) => p.url), headers: { Referer: BASE_URL } };
  },
};

/** props.description is a small HTML string (<p>...</p> tags) — strip tags
 *  down to plain text without pulling in a full HTML-to-text dependency. */
function cheerioTextOf(html: string): string {
  return html
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}
