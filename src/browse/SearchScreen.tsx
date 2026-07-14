import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Fragment, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { MainTabParamList } from '../navigation/types';
import { getAllSources } from '../sources/registry';
import type { SeriesListItem } from '../sources/Source';
import { SearchBar } from '../ui/SearchBar';
import { radii, spacing, useAppTheme, type AppTheme } from '../ui/theme';

type Props = BottomTabScreenProps<MainTabParamList, 'Search'>;
type Colors = AppTheme['colors'];

interface SourceResults {
  sourceId: string;
  sourceName: string;
  items: SeriesListItem[];
}

// The round bubble next to the tab capsule opens this — search across every
// installed source at once (distinct from Library's inline search, which
// only searches what's already in your library, and from a source's own
// catalog search inside Browse).
export function SearchScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState('');
  const trimmedQuery = query.trim();
  const sources = getAllSources();

  const { data, isPending, isError } = useQuery({
    queryKey: ['search-all', trimmedQuery],
    enabled: trimmedQuery.length > 0,
    queryFn: async (): Promise<SourceResults[]> => {
      const results = await Promise.allSettled(sources.map((source) => source.search(trimmedQuery, 1)));
      return sources
        .map((source, i) => {
          const result = results[i];
          return {
            sourceId: source.info.id,
            sourceName: source.info.name,
            items: result.status === 'fulfilled' ? result.value.items : [],
          };
        })
        .filter((group) => group.items.length > 0);
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.header, { color: colors.textPrimary }]}>Search</Text>
      <SearchBar value={query} onChangeText={setQuery} placeholder={`Search ${sources.length} sources`} />

      {!trimmedQuery && (
        <Text style={[styles.status, { color: colors.textSecondary }]}>
          Search across all {sources.length} installed source{sources.length === 1 ? '' : 's'}.
        </Text>
      )}
      {trimmedQuery && isPending && (
        <Text style={[styles.status, { color: colors.textSecondary }]}>Searching…</Text>
      )}
      {trimmedQuery && isError && (
        <Text style={[styles.status, { color: colors.textSecondary }]}>Search failed. Try again.</Text>
      )}
      {trimmedQuery && data && data.length === 0 && (
        <Text style={[styles.status, { color: colors.textSecondary }]}>No results.</Text>
      )}

      <FlashList
        style={styles.list}
        data={data ?? []}
        keyExtractor={(group) => group.sourceId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: group }) => (
          <SourceResultRow
            group={group}
            colors={colors}
            onPressItem={(seriesId) =>
              navigation.navigate('Browse', { screen: 'SeriesDetails', params: { sourceId: group.sourceId, seriesId } })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

function SourceResultRow({
  group,
  colors,
  onPressItem,
}: {
  group: SourceResults;
  colors: Colors;
  onPressItem: (seriesId: string) => void;
}) {
  return (
    <View style={styles.group}>
      <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>{group.sourceName.toUpperCase()}</Text>
      {group.items.map((item) => (
        <Fragment key={item.id}>
          <Pressable style={styles.row} onPress={() => onPressItem(item.id)}>
            <View style={[styles.cover, { backgroundColor: colors.backgroundSecondary }]}>
              {item.coverUrl && (
                <Image source={{ uri: item.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
              )}
            </View>
            <Text style={[styles.rowTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.title}
            </Text>
          </Pressable>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: 34,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  status: { textAlign: 'center', fontSize: 14, paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  list: { flex: 1 },
  listContent: { padding: spacing.lg, gap: spacing.lg },
  group: { gap: spacing.xs },
  groupTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  cover: { width: 40, height: 40, borderRadius: radii.sm, overflow: 'hidden' },
  rowTitle: { flex: 1, fontSize: 15 },
});
