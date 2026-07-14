import type { ContentType } from '../sources/Source';

/** A series as stored in the local library — metadata only. Actual page
 *  images / chapter HTML are fetched on demand via Source.getContent(),
 *  never persisted here. */
export interface LibrarySeries {
  id: string;
  sourceId: string;
  title: string;
  contentType: ContentType;
  coverUrl?: string;
  addedAt: number; // epoch ms
}

export interface LibraryChapter {
  id: string;
  seriesId: string;
  sourceId: string;
  title: string;
  number?: number;
  publishedAt?: number; // epoch ms
}

export interface ChapterProgress {
  seriesId: string;
  chapterId: string;
  /** Page index (image) or paragraph index (text) — whichever the reader
   *  that wrote it uses; opaque to everything else. */
  position: number;
  completed: boolean;
  updatedAt: number; // epoch ms
}
