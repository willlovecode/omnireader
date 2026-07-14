import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LibrarySeriesWithProgress } from '../db/queries';
import type { LibraryStackParamList, MainTabParamList, RootStackParamList } from '../navigation/types';
import { LargeTitle } from '../ui/CollapsingHeader';
import { SearchBar } from '../ui/SearchBar';
import { radii, spacing, useAppTheme, type AppTheme } from '../ui/theme';
import { LibraryMenu, type FilterMode, type SortMode, type ViewMode } from './LibraryMenu';
import { useLibrarySeries } from './useLibrary';

// Library lives inside its own stack (for Updates) which lives inside the
// tab navigator (for the tab bar) which lives inside the root stack (to
// push a reader that covers everything) — hence the triple composite.
type Props = CompositeScreenProps<
  NativeStackScreenProps<LibraryStackParamList, 'LibraryHome'>,
  CompositeScreenProps<BottomTabScreenProps<MainTabParamList, 'Library'>, NativeStackScreenProps<RootStackParamList>>
>;
type Colors = AppTheme['colors'];

const NUM_COLUMNS = 2;

export function LibraryScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const { data: series = [] } = useLibrarySeries();
  const [query, setQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('title');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = series;
    if (filterMode !== 'all') {
      result = result.filter((item) => item.contentType === filterMode);
    }
    if (q) {
      result = result.filter((item) => item.title.toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) =>
      sortMode === 'title' ? a.title.localeCompare(b.title) : b.addedAt - a.addedAt,
    );
    return result;
  }, [series, query, sortMode, filterMode]);

  const headerIcons = (
    <View style={styles.headerIcons}>
      <Pressable hitSlop={12} onPress={() => navigation.navigate('Updates')}>
        <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
      </Pressable>
      <Pressable hitSlop={12} onPress={() => setMenuVisible(true)}>
        <Ionicons name="ellipsis-horizontal-circle-outline" size={24} color={colors.textPrimary} />
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlashList
        style={styles.list}
        key={viewMode}
        data={filtered}
        numColumns={viewMode === 'grid' ? NUM_COLUMNS : 1}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + spacing.md }]}
        ListHeaderComponent={
          <>
            <LargeTitle title="Library" rightAccessory={headerIcons} />
            <SearchBar value={query} onChangeText={setQuery} placeholder="Find in Library" />
          </>
        }
        renderItem={({ item }) =>
          viewMode === 'grid' ? (
            <GridCell series={item} colors={colors} onPress={() => navigation.navigate('Reader', { demoId: item.id })} />
          ) : (
            <ListRow series={item} colors={colors} onPress={() => navigation.navigate('Reader', { demoId: item.id })} />
          )
        }
      />

      <LibraryMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
        filterMode={filterMode}
        onFilterModeChange={setFilterMode}
      />
    </View>
  );
}

function UnreadBadge({ count, colors }: { count: number; colors: Colors }) {
  return (
    <View style={[styles.badge, { backgroundColor: colors.accent }]}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  );
}

function GridCell({
  series,
  colors,
  onPress,
}: {
  series: LibrarySeriesWithProgress;
  colors: Colors;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.cell} onPress={onPress}>
      <View style={[styles.cover, { backgroundColor: colors.backgroundSecondary }]}>
        {series.coverUrl ? (
          <Image source={{ uri: series.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.accent }]} />
        )}
        <LinearGradient
          colors={[colors.overlayScrimTop, colors.overlayScrimBottom]}
          style={styles.scrim}
        />
        <Text style={styles.title} numberOfLines={2}>
          {series.title}
        </Text>
        {!!series.unreadCount && <UnreadBadge count={series.unreadCount} colors={colors} />}
      </View>
    </Pressable>
  );
}

function ListRow({
  series,
  colors,
  onPress,
}: {
  series: LibrarySeriesWithProgress;
  colors: Colors;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.listRow} onPress={onPress}>
      <View style={[styles.listCover, { backgroundColor: colors.backgroundSecondary }]}>
        {series.coverUrl ? (
          <Image source={{ uri: series.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.accent }]} />
        )}
        {!!series.unreadCount && <UnreadBadge count={series.unreadCount} colors={colors} />}
      </View>
      <Text style={[styles.listTitle, { color: colors.textPrimary }]} numberOfLines={1}>
        {series.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  list: { flex: 1 },
  listContent: { padding: spacing.md },
  cell: { flex: 1, margin: spacing.sm },
  cover: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: radii.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' },
  title: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    padding: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    minWidth: 22,
    height: 20,
    borderRadius: radii.sm,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  listCover: { width: 44, height: 44, borderRadius: radii.sm, overflow: 'hidden' },
  listTitle: { flex: 1, fontSize: 15, fontWeight: '600' },
});
