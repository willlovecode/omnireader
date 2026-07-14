import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Metadata only — see src/models/types.ts. Page images / chapter HTML are
// never persisted here; they come from Source.getContent() on demand.

export const seriesTable = sqliteTable('series', {
  id: text('id').primaryKey(),
  sourceId: text('source_id').notNull(),
  title: text('title').notNull(),
  contentType: text('content_type', { enum: ['image', 'text'] }).notNull(),
  coverUrl: text('cover_url'),
  addedAt: integer('added_at').notNull(),
});

export const chaptersTable = sqliteTable('chapters', {
  id: text('id').primaryKey(),
  seriesId: text('series_id')
    .notNull()
    .references(() => seriesTable.id),
  sourceId: text('source_id').notNull(),
  title: text('title').notNull(),
  number: real('number'),
  publishedAt: integer('published_at'),
});

export const chapterProgressTable = sqliteTable('chapter_progress', {
  // A chapter has at most one progress row, so its id doubles as this
  // table's key — no need for a composite key.
  chapterId: text('chapter_id')
    .primaryKey()
    .references(() => chaptersTable.id),
  // Denormalized so "unread count per series" doesn't need a join.
  seriesId: text('series_id')
    .notNull()
    .references(() => seriesTable.id),
  position: integer('position').notNull().default(0),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  updatedAt: integer('updated_at').notNull(),
});
