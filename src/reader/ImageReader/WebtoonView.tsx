import { FlashList, type ViewToken } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useCallback, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

interface Props {
  pages: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

// Test fixtures are a fixed 2:3 aspect ratio. Real sources will have varying
// page heights, which will need per-image measurement — deferred until step 3+
// when actual source pages exist to measure.
const PAGE_ASPECT_RATIO = 2 / 3;

export function WebtoonView({ pages, currentIndex, onIndexChange }: Props) {
  const { width } = useWindowDimensions();

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
      data={pages}
      keyExtractor={(uri, i) => `${i}-${uri}`}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={handleViewableItemsChanged}
      renderItem={({ item }) => (
        <Image source={{ uri: item }} style={{ width, aspectRatio: PAGE_ASPECT_RATIO }} contentFit="cover" />
      )}
    />
  );
}
