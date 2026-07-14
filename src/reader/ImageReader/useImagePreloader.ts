import { Image } from 'expo-image';
import { useEffect } from 'react';

// Was 2 — too tight for real (larger, slower-loading) source CDNs, showed up
// as a visible wait between pages while reading. Firing on mount (index 0)
// also means this kicks off a real chunk of prefetching as soon as a
// chapter opens, not just incrementally as you scroll.
const PRELOAD_AHEAD = 8;

/** Prefetches the next few pages so paging/scrolling forward doesn't flash. */
export function useImagePreloader(pages: string[], currentIndex: number, headers?: Record<string, string>): void {
  useEffect(() => {
    const upcoming = pages.slice(currentIndex + 1, currentIndex + 1 + PRELOAD_AHEAD);
    if (upcoming.length > 0) {
      Image.prefetch(upcoming, { headers });
    }
  }, [pages, currentIndex, headers]);
}
