import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { BrowseStackParamList, MainTabParamList, RootStackParamList } from '../navigation/types';
import { getSource } from '../sources/registry';
import { LargeTitle } from '../ui/CollapsingHeader';
import { radii, spacing, useAppTheme } from '../ui/theme';

type Props = CompositeScreenProps<
  NativeStackScreenProps<BrowseStackParamList, 'SeriesDetails'>,
  CompositeScreenProps<BottomTabScreenProps<MainTabParamList, 'Browse'>, NativeStackScreenProps<RootStackParamList>>
>;

export function SeriesDetailsScreen({ route, navigation }: Props) {
  const { sourceId, seriesId } = route.params;
  const { colors } = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const source = getSource(sourceId);

  const detailsQuery = useQuery({
    queryKey: ['source', sourceId, 'details', seriesId],
    queryFn: () => {
      if (!source) throw new Error(`Unknown source: ${sourceId}`);
      return source.getDetails(seriesId);
    },
  });

  const chaptersQuery = useQuery({
    queryKey: ['source', sourceId, 'chapters', seriesId],
    queryFn: () => {
      if (!source) throw new Error(`Unknown source: ${sourceId}`);
      return source.getChapters(seriesId);
    },
  });

  const title = detailsQuery.data?.title ?? 'Loading…';
  const goBack = () => navigation.goBack();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: tabBarHeight + spacing.lg }}>
        <LargeTitle title={title} onBack={goBack} backLabel="Browse" />

        <View style={styles.content}>
          {detailsQuery.isError && (
            <Text style={[styles.status, { color: colors.textSecondary }]}>Couldn't load this series.</Text>
          )}

          {detailsQuery.data && (
            <View style={styles.summaryRow}>
              <View style={[styles.cover, { backgroundColor: colors.backgroundSecondary }]}>
                {detailsQuery.data.coverUrl && (
                  <Image source={{ uri: detailsQuery.data.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
                )}
              </View>
              <View style={styles.summaryText}>
                {!!detailsQuery.data.authors?.length && (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    {detailsQuery.data.authors.join(', ')}
                  </Text>
                )}
                {detailsQuery.data.status && (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    {detailsQuery.data.status[0].toUpperCase() + detailsQuery.data.status.slice(1)}
                  </Text>
                )}
              </View>
            </View>
          )}

          {!!detailsQuery.data?.genres?.length && (
            <View style={styles.genreRow}>
              {detailsQuery.data.genres.map((genre) => (
                <View key={genre} style={[styles.genreChip, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={[styles.genreText, { color: colors.textPrimary }]}>{genre}</Text>
                </View>
              ))}
            </View>
          )}

          {detailsQuery.data?.description && (
            <Text style={[styles.description, { color: colors.textPrimary }]}>{detailsQuery.data.description}</Text>
          )}

          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {chaptersQuery.data ? `${chaptersQuery.data.length} CHAPTERS` : 'CHAPTERS'}
          </Text>

          {chaptersQuery.data?.map((chapter) => (
            <Pressable
              key={chapter.id}
              style={[styles.chapterRow, { borderBottomColor: colors.border }]}
              onPress={() =>
                navigation.navigate('Reader', {
                  sourceId,
                  seriesId,
                  chapterId: chapter.id,
                  title: detailsQuery.data?.title ?? chapter.title,
                })
              }
            >
              <Text style={[styles.chapterTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {chapter.title}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },
  status: { fontSize: 14, textAlign: 'center', paddingVertical: spacing.lg },
  summaryRow: { flexDirection: 'row', gap: spacing.md },
  cover: { width: 100, aspectRatio: 2 / 3, borderRadius: radii.md, overflow: 'hidden' },
  summaryText: { flex: 1, justifyContent: 'center', gap: spacing.xs },
  meta: { fontSize: 13 },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  genreChip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.pill },
  genreText: { fontSize: 12, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginTop: spacing.sm },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chapterTitle: { flex: 1, fontSize: 15 },
});
