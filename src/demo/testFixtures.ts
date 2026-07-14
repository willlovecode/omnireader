import { Image } from 'react-native';

import type { ContentType } from '../sources/Source';

// Step-1 scaffolding: stands in for the SQLite library (step 2) and a real
// Source (step 3). Delete this module once both land.

export interface DemoSeries {
  id: string;
  title: string;
  contentType: ContentType;
  /** Cover image URI. Absent for the text demo — no cover art exists yet, so
   *  the library falls back to a title card. */
  cover?: string;
  pages?: string[];
  chapterTitle?: string;
  html?: string;
  /** Demo-only unread badge — real unread counts need progress tracking
   *  (CLAUDE.md build order, step 2), which doesn't exist yet. */
  unreadCount?: number;
}

function resolve(mod: number): string {
  return Image.resolveAssetSource(mod).uri;
}

const demoAPages = [
  require('../../assets/test-manga/demo-a/001.png'),
  require('../../assets/test-manga/demo-a/002.png'),
  require('../../assets/test-manga/demo-a/003.png'),
  require('../../assets/test-manga/demo-a/004.png'),
  require('../../assets/test-manga/demo-a/005.png'),
  require('../../assets/test-manga/demo-a/006.png'),
  require('../../assets/test-manga/demo-a/007.png'),
  require('../../assets/test-manga/demo-a/008.png'),
  require('../../assets/test-manga/demo-a/009.png'),
  require('../../assets/test-manga/demo-a/010.png'),
].map(resolve);

const demoBPages = [
  require('../../assets/test-manga/demo-b/001.png'),
  require('../../assets/test-manga/demo-b/002.png'),
  require('../../assets/test-manga/demo-b/003.png'),
  require('../../assets/test-manga/demo-b/004.png'),
  require('../../assets/test-manga/demo-b/005.png'),
  require('../../assets/test-manga/demo-b/006.png'),
  require('../../assets/test-manga/demo-b/007.png'),
  require('../../assets/test-manga/demo-b/008.png'),
].map(resolve);

const demoNovelHtml = `
  <p>The lighthouse keeper had not seen another ship in eleven days, which was
  itself unremarkable, except that the log insisted he had not seen one in
  three.</p>
  <p>He read the entry again by lamplight, tracing the ink with a fingertip as
  though touch might reveal a forgery. The hand was his own. The dates were
  not.</p>
  <p>Outside, the beam swept its slow circle over water gone the color of wet
  slate. Somewhere below, the tide was doing what tides do, indifferent to
  missing days and the men who counted them.</p>
  <p>He decided, as he had decided most nights that winter, that the sea kept
  better records than he did, and that this was probably fine.</p>
`;

export const demoLibrary: DemoSeries[] = [
  {
    id: 'demo-a',
    title: 'Demo Manga A',
    contentType: 'image',
    cover: demoAPages[0],
    pages: demoAPages,
    unreadCount: 4,
  },
  {
    id: 'demo-b',
    title: 'Demo Manga B',
    contentType: 'image',
    cover: demoBPages[0],
    pages: demoBPages,
  },
  {
    id: 'demo-c',
    title: 'The Lighthouse Ledger',
    contentType: 'text',
    chapterTitle: 'Chapter 1: The Missing Days',
    html: demoNovelHtml,
    unreadCount: 2,
  },
];

export function getDemoSeries(id: string): DemoSeries | undefined {
  return demoLibrary.find((series) => series.id === id);
}
