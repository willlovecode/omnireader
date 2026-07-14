import type { RecentChapterRow } from '../db/queries';

export interface UpdateEntry {
  seriesId: string;
  title: string;
  cover?: string;
  chapters: string[];
}

export interface UpdateGroup {
  dateLabel: string;
  entries: UpdateEntry[];
}

const DAY_MS = 86_400_000;

function dateLabel(timestampMs: number, now: number): string {
  const startOfDay = (t: number) => Math.floor(t / DAY_MS);
  const diffDays = startOfDay(now) - startOfDay(timestampMs);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(timestampMs).toLocaleDateString();
}

/** Groups chapters (already newest-first) by date, then by series within
 *  each date — matching the Updates screen's date-header → series-row →
 *  chapter-lines layout. */
export function groupUpdates(rows: RecentChapterRow[], now = Date.now()): UpdateGroup[] {
  const groups: UpdateGroup[] = [];
  const groupByLabel = new Map<string, UpdateGroup>();

  for (const row of rows) {
    const label = dateLabel(row.publishedAt, now);
    let group = groupByLabel.get(label);
    if (!group) {
      group = { dateLabel: label, entries: [] };
      groupByLabel.set(label, group);
      groups.push(group);
    }

    let entry = group.entries.find((e) => e.seriesId === row.seriesId);
    if (!entry) {
      entry = { seriesId: row.seriesId, title: row.seriesTitle, cover: row.cover, chapters: [] };
      group.entries.push(entry);
    }
    entry.chapters.push(row.chapterTitle);
  }

  return groups;
}
