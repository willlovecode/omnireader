import { aquaReaderSource } from './aquareader/AquaReaderSource';
import { arenaScansSource } from './arenascans/ArenaScansSource';
import { asuraScansSource } from './asurascans/AsuraScansSource';
import { mangaKatanaSource } from './mangakatana/MangaKatanaSource';
import type { Source } from './Source';

// Hand-written sources (CLAUDE.md build order step 3). Becomes a real
// fetched registry in step 5 — this lookup shape is deliberately what
// callers will keep using once that lands.
const sources: Source[] = [mangaKatanaSource, arenaScansSource, aquaReaderSource, asuraScansSource];

export function getSource(sourceId: string): Source | undefined {
  return sources.find((source) => source.info.id === sourceId);
}

export function getAllSources(): Source[] {
  return sources;
}
