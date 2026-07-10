import { Image } from 'react-native';

import type { ContentType } from '../../sources/Source';

// Step-1 scaffolding: stands in for the SQLite library (step 2) and a real
// Source (step 3). Delete this module once both land.

export interface DemoSeries {
  id: string;
  title: string;
  contentType: ContentType;
  pages: string[];
}

function resolve(mod: number): string {
  return Image.resolveAssetSource(mod).uri;
}

const demoAPages = [
  require('../../../assets/test-manga/demo-a/001.png'),
  require('../../../assets/test-manga/demo-a/002.png'),
  require('../../../assets/test-manga/demo-a/003.png'),
  require('../../../assets/test-manga/demo-a/004.png'),
  require('../../../assets/test-manga/demo-a/005.png'),
  require('../../../assets/test-manga/demo-a/006.png'),
  require('../../../assets/test-manga/demo-a/007.png'),
  require('../../../assets/test-manga/demo-a/008.png'),
  require('../../../assets/test-manga/demo-a/009.png'),
  require('../../../assets/test-manga/demo-a/010.png'),
].map(resolve);

const demoBPages = [
  require('../../../assets/test-manga/demo-b/001.png'),
  require('../../../assets/test-manga/demo-b/002.png'),
  require('../../../assets/test-manga/demo-b/003.png'),
  require('../../../assets/test-manga/demo-b/004.png'),
  require('../../../assets/test-manga/demo-b/005.png'),
  require('../../../assets/test-manga/demo-b/006.png'),
  require('../../../assets/test-manga/demo-b/007.png'),
  require('../../../assets/test-manga/demo-b/008.png'),
].map(resolve);

export const demoLibrary: DemoSeries[] = [
  { id: 'demo-a', title: 'Demo Manga A', contentType: 'image', pages: demoAPages },
  { id: 'demo-b', title: 'Demo Manga B', contentType: 'image', pages: demoBPages },
];

export function getDemoSeries(id: string): DemoSeries | undefined {
  return demoLibrary.find((series) => series.id === id);
}
