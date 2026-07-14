import { desc, eq, sql } from 'drizzle-orm';

import type { LibrarySeries } from '../models/types';
import { db } from './client';
import { chapterProgressTable, chaptersTable, seriesTable } from './schema';

export interface LibrarySeriesWithProgress extends LibrarySeries {
  unreadCount: number;
}

export async function getLibrarySeries(): Promise<LibrarySeriesWithProgress[]> {
  const series = await db.select().from(seriesTable);
  const unreadRows = await db
    .select({ seriesId: chapterProgressTable.seriesId, unread: sql<number>`count(*)` })
    .from(chapterProgressTable)
    .where(eq(chapterProgressTable.completed, false))
    .groupBy(chapterProgressTable.seriesId);

  const unreadBySeries = new Map(unreadRows.map((row) => [row.seriesId, row.unread]));

  return series.map((row) => ({
    id: row.id,
    sourceId: row.sourceId,
    title: row.title,
    contentType: row.contentType,
    coverUrl: row.coverUrl ?? undefined,
    addedAt: row.addedAt,
    unreadCount: unreadBySeries.get(row.id) ?? 0,
  }));
}

export interface RecentChapterRow {
  seriesId: string;
  seriesTitle: string;
  cover?: string;
  chapterId: string;
  chapterTitle: string;
  publishedAt: number;
}

export async function getRecentChapters(limit = 30): Promise<RecentChapterRow[]> {
  const rows = await db
    .select({
      seriesId: seriesTable.id,
      seriesTitle: seriesTable.title,
      cover: seriesTable.coverUrl,
      chapterId: chaptersTable.id,
      chapterTitle: chaptersTable.title,
      publishedAt: chaptersTable.publishedAt,
    })
    .from(chaptersTable)
    .innerJoin(seriesTable, eq(chaptersTable.seriesId, seriesTable.id))
    .orderBy(desc(chaptersTable.publishedAt))
    .limit(limit);

  return rows.map((row) => ({ ...row, cover: row.cover ?? undefined, publishedAt: row.publishedAt ?? 0 }));
}
