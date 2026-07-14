import { useEffect, useState } from 'react';
import { Image } from 'react-native';

export interface PageSize {
  width: number;
  height: number;
}

/** Measures each page's real aspect ratio so WebtoonView can size it
 *  correctly. Real source pages (manhwa especially) vary hugely in height —
 *  a fixed aspect ratio either squashes/stretches them or, worse, crops
 *  them when paired with contentFit="cover". Falls back silently (caller
 *  uses a default ratio) for any page that fails to measure. */
export function usePageDimensions(pages: string[], headers?: Record<string, string>) {
  const [sizes, setSizes] = useState<Record<string, PageSize>>({});

  useEffect(() => {
    let cancelled = false;

    for (const url of pages) {
      if (sizes[url]) continue;
      const onSuccess = (width: number, height: number) => {
        if (cancelled) return;
        setSizes((prev) => (prev[url] ? prev : { ...prev, [url]: { width, height } }));
      };
      if (headers) {
        Image.getSizeWithHeaders(url, headers, onSuccess, () => {});
      } else {
        Image.getSize(url, onSuccess, () => {});
      }
    }

    return () => {
      cancelled = true;
    };
    // Re-run only when the page list itself changes, not on every measured
    // size (sizes is intentionally excluded to avoid re-triggering measured
    // urls).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, headers]);

  return sizes;
}
