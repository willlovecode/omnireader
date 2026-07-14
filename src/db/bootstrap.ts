import { sql } from 'drizzle-orm';

import { demoLibrary } from '../demo/testFixtures';
import { db } from './client';
import { chapterProgressTable, chaptersTable, seriesTable } from './schema';

// No drizzle-kit migration pipeline yet — the schema is still small and
// changing fast enough that hand-written CREATE TABLE IF NOT EXISTS is
// simpler than generated migrations. Revisit once the schema stabilizes.
async function createTables(): Promise<void> {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS series (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content_type TEXT NOT NULL,
      cover_url TEXT,
      added_at INTEGER NOT NULL
    );
  `);
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      series_id TEXT NOT NULL REFERENCES series(id),
      source_id TEXT NOT NULL,
      title TEXT NOT NULL,
      number REAL,
      published_at INTEGER
    );
  `);
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS chapter_progress (
      chapter_id TEXT PRIMARY KEY REFERENCES chapters(id),
      series_id TEXT NOT NULL REFERENCES series(id),
      position INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
  `);
}

// Demo-only seed so the library has something real to query until a source
// exists (CLAUDE.md build order, step 3). Reader still opens each demo
// series' whole content blob (see src/demo/testFixtures.ts) rather than
// individual chapters — these chapter rows exist for unread-count/Updates
// purposes only; nothing writes progress to them yet.
async function seedIfEmpty(): Promise<void> {
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(seriesTable);
  if (count > 0) return;

  const now = Date.now();
  for (const [seriesIndex, series] of demoLibrary.entries()) {
    await db.insert(seriesTable).values({
      id: series.id,
      sourceId: 'demo',
      title: series.title,
      contentType: series.contentType,
      coverUrl: series.cover,
      // Stagger so "date added" sort has something meaningful to show.
      addedAt: now - (demoLibrary.length - seriesIndex) * 86_400_000,
    });

    const chapterCount = series.contentType === 'image' ? 5 : 3;
    const unread = series.unreadCount ?? 0;
    for (let n = 1; n <= chapterCount; n++) {
      const chapterId = `${series.id}-ch${n}`;
      await db.insert(chaptersTable).values({
        id: chapterId,
        seriesId: series.id,
        sourceId: 'demo',
        title: `Chapter ${n}`,
        number: n,
        publishedAt: now - (chapterCount - n) * 86_400_000,
      });

      const isRead = n <= chapterCount - unread;
      await db.insert(chapterProgressTable).values({
        chapterId,
        seriesId: series.id,
        position: 0,
        completed: isRead,
        updatedAt: now,
      });
    }
  }
}

let readyPromise: Promise<void> | null = null;

/** Idempotent — safe to call from multiple mount points; only runs once. */
export function ensureDatabaseReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = createTables().then(seedIfEmpty);
  }
  return readyPromise;
}
