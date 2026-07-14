import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { BrowseStackParamList } from '../navigation/types';
import { getSource } from '../sources/registry';
import type { SeriesListItem } from '../sources/Source';
import { LargeTitle } from '../ui/CollapsingHeader';
import { SearchBar } from '../ui/SearchBar';
import { radii, spacing, useAppTheme, type AppTheme } from '../ui/theme';

type Props = NativeStackScreenProps<BrowseStackParamList, 'SourceCatalog'>;
type Colors = AppTheme['colors'];

const NUM_COLUMNS = 3;

export function SourceCatalogScreen({ route, navigation }: Props) {
  const { sourceId } = route.params;
  const { colors } = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const source = getSource(sourceId);
  const [query, setQuery] = useState('');
  const trimmedQuery = query.trim();
  const sourceName = source?.info.name ?? sourceId;

  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: trimmedQuery ? ['source', sourceId, 'search', trimmedQuery] : ['source', sourceId, 'popular'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      if (!source) throw new Error(`Unknown source: ${sourceId}`);
      return trimmedQuery ? source.search(trimmedQuery, pageParam) : source.getPopular(pageParam);
    },
    getNextPageParam: (lastPage, pages) => (lastPage.hasNextPage ? pages.length + 1 : undefined),
  });

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  const statusMessage = isPending
    ? 'Loading…'
    : isError
      ? `Couldn't reach ${sourceName}. Check your connection and try again.`
      : items.length === 0
        ? 'No results.'
        : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlashList
        style={styles.list}
        data={items}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item, index) => `${index}-${item.id}`}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + spacing.md }]}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        ListHeaderComponent={
          <>
            <LargeTitle title={sourceName} onBack={() => navigation.goBack()} backLabel="Browse" />
            <SearchBar value={query} onChangeText={setQuery} placeholder={`Search ${sourceName}`} />
          </>
        }
        ListEmptyComponent={
          statusMessage ? <Text style={[styles.status, { color: colors.textSecondary }]}>{statusMessage}</Text> : null
        }
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={styles.footer} color={colors.accent} /> : null}
        renderItem={({ item }) => (
          <SeriesCell
            series={item}
            colors={colors}
            onPress={() => navigation.navigate('SeriesDetails', { sourceId, seriesId: item.id })}
          />
        )}
      />
    </View>
  );
}

function SeriesCell({
  series,
  colors,
  onPress,
}: {
  series: SeriesListItem;
  colors: Colors;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.cell} onPress={onPress}>
      <View style={[styles.cover, { backgroundColor: colors.backgroundSecondary }]}>
        {series.coverUrl && (
          <Image source={{ uri: series.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        )}
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
        {series.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  status: { textAlign: 'center', fontSize: 14, paddingVertical: spacing.lg },
  footer: { paddingVertical: spacing.lg },
  list: { flex: 1 },
  listContent: { padding: spacing.md },
  cell: { flex: 1, margin: spacing.sm },
  cover: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  title: { fontSize: 12, fontWeight: '600', marginTop: spacing.xs },
});
