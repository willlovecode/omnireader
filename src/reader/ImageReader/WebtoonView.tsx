import { FlashList, type FlashListRef, type ViewToken } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import type { PageViewHandle } from './types';
import { usePageDimensions } from './usePageDimensions';

interface Props {
  pages: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  headers?: Record<string, string>;
}

// Used only until a page's real size has been measured (see
// usePageDimensions) — real source pages, manhwa especially, vary hugely in
// height, so this is just a placeholder to avoid a layout jump from zero.
const FALLBACK_ASPECT_RATIO = 2 / 3;

export const WebtoonView = forwardRef<PageViewHandle, Props>(function WebtoonView(
  { pages, currentIndex, onIndexChange, headers },
  ref,
) {
  const { width } = useWindowDimensions();
  const pageSizes = usePageDimensions(pages, headers);
  const listRef = useRef<FlashListRef<string>>(null);

  useImperativeHandle(ref, () => ({
    scrollToIndex: (index) => listRef.current?.scrollToIndex({ index, animated: false }),
  }));

  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 50 }), []);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<string>[] }) => {
      const first = viewableItems[0];
      if (first?.index != null && first.index !== currentIndex) {
        onIndexChange(first.index);
      }
    },
    [currentIndex, onIndexChange],
  );

  return (
    <FlashList
      ref={listRef}
      style={styles.list}
      data={pages}
      keyExtractor={(uri, i) => `${i}-${uri}`}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={handleViewableItemsChanged}
      renderItem={({ item }) => {
        // Sizing the box to the image's OWN aspect ratio (once measured)
        // means contentFit="cover" never has anything to crop — cover and
        // contain are identical when the box matches the image's real
        // proportions. Before that measurement resolves, the fallback ratio
        // will crop/pad briefly; unavoidable without knowing the real size
        // up front.
        const size = pageSizes[item];
        const aspectRatio = size ? size.width / size.height : FALLBACK_ASPECT_RATIO;
        return (
          // recyclingKey: FlashList reuses view instances as you scroll
          // rather than destroying/recreating them, and without this
          // expo-image keeps showing whatever the recycled view last
          // displayed until the new source finishes loading — on a real
          // (slower, larger) CDN this showed up as pages visibly reverting
          // to an earlier page mid-scroll.
          <Image source={{ uri: item, headers }} recyclingKey={item} style={{ width, aspectRatio }} contentFit="cover" />
        );
      }}
    />
  );
});

const styles = StyleSheet.create({
  list: { flex: 1 },
});
