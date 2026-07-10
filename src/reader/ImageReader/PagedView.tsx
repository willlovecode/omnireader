import { FlashList, type ViewToken } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useCallback, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

interface Props {
  pages: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function PagedView({ pages, currentIndex, onIndexChange }: Props) {
  const { width, height } = useWindowDimensions();

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
      data={pages}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(uri, i) => `${i}-${uri}`}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={handleViewableItemsChanged}
      renderItem={({ item }) => (
        <View style={{ width, height }}>
          <Image source={{ uri: item }} style={styles.page} contentFit="contain" />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', height: '100%' },
});
