import { Image } from 'expo-image';
import { useEffect } from 'react';

const PRELOAD_AHEAD = 2;

/** Prefetches the next few pages so paging/scrolling forward doesn't flash. */
export function useImagePreloader(pages: string[], currentIndex: number): void {
  useEffect(() => {
    const upcoming = pages.slice(currentIndex + 1, currentIndex + 1 + PRELOAD_AHEAD);
    if (upcoming.length > 0) {
      Image.prefetch(upcoming);
    }
  }, [pages, currentIndex]);
}
