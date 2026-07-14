import { FlashList, type FlashListRef, type ViewToken } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import type { PageViewHandle } from './types';

interface Props {
  pages: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  headers?: Record<string, string>;
}

export const PagedView = forwardRef<PageViewHandle, Props>(function PagedView(
  { pages, currentIndex, onIndexChange, headers },
  ref,
) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlashListRef<string>>(null);

  useImperativeHandle(ref, () => ({
    scrollToIndex: (index) => listRef.current?.scrollToIndex({ index, animated: false }),
  }));

  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 60 }), []);

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
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(uri, i) => `${i}-${uri}`}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={handleViewableItemsChanged}
      renderItem={({ item }) => (
        // height: '100%' fills whatever space the list actually has (between
        // the reader's header/footer) — NOT the raw device height, which
        // used to overflow past the header/footer and push them off-screen.
        <View style={{ width, height: '100%' }}>
          <Image source={{ uri: item, headers }} recyclingKey={item} style={styles.page} contentFit="contain" />
        </View>
      )}
    />
  );
});

const styles = StyleSheet.create({
  list: { flex: 1 },
  page: { width: '100%', height: '100%' },
});
