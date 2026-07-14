import type { CheerioAPI } from 'cheerio/slim';

import { dedupeById } from '../dedupeById';
import type { SeriesListItem } from '../Source';

// Shared across Madara-theme sites (WordPress + "Madara" manga theme —
// arenascans.org, aquareader.org, and many others). Only the archive/search
// listing markup and the chapter-reading-page image markup have proven
// identical across the sites verified so far (2026-07-13); the manga
// DETAILS page is customized per-site (different child themes), so that
// stays hand-written per source. Don't generalize further than this until a
// third site actually needs it — this isn't the step-4 generic engine yet.

export function parseMadaraSeriesList($: CheerioAPI, sourceId: string): SeriesListItem[] {
  const items: SeriesListItem[] = [];
  $('.c-tabs-item__content').each((_, el) => {
    const node = $(el);
    const link = node.find('a[title]').first();
    const id = link.attr('href');
    const title = link.attr('title')?.trim();
    const coverUrl = node.find('img').attr('data-src')?.trim() || node.find('img').attr('src')?.trim();
    if (id && title) {
      items.push({ id, sourceId, title, coverUrl, contentType: 'image' });
    }
  });
  return dedupeById(items);
}

export function parseMadaraPageImages($: CheerioAPI): string[] {
  const pages: string[] = [];
  $('div.page-break img').each((_, el) => {
    const img = $(el);
    const url =
      img.attr('data-src')?.trim() || img.attr('data-lazy-src')?.trim() || img.attr('src')?.trim();
    if (url) pages.push(url);
  });
  return pages;
}
