import { Ionicons } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { LibraryStackParamList, RootStackParamList } from '../navigation/types';
import { radii, spacing, useAppTheme } from '../ui/theme';
import type { UpdateEntry } from './updateGrouping';
import { useUpdates } from './useLibrary';

type Props = CompositeScreenProps<
  NativeStackScreenProps<LibraryStackParamList, 'Updates'>,
  NativeStackScreenProps<RootStackParamList>
>;

const MAX_VISIBLE_CHAPTERS = 3;

export function UpdatesScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { data: updateGroups = [] } = useUpdates();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable
          style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Updates</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {updateGroups.map((group) => (
          <Fragment key={group.dateLabel}>
            <Text style={[styles.dateLabel, { color: colors.textPrimary }]}>{group.dateLabel}</Text>
            {group.entries.map((entry) => (
              <UpdateRow
                key={entry.seriesId}
                entry={entry}
                onPress={() => navigation.navigate('Reader', { demoId: entry.seriesId })}
              />
            ))}
          </Fragment>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function UpdateRow({ entry, onPress }: { entry: UpdateEntry; onPress: () => void }) {
  const { colors } = useAppTheme();
  const visible = entry.chapters.slice(0, MAX_VISIBLE_CHAPTERS);
  const remaining = entry.chapters.length - visible.length;

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.cover, { backgroundColor: colors.backgroundSecondary }]}>
        {entry.cover && <Image source={{ uri: entry.cover }} style={StyleSheet.absoluteFill} contentFit="cover" />}
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {entry.title}
        </Text>
        {visible.map((chapter) => (
          <Text key={chapter} style={[styles.chapter, { color: colors.textSecondary }]} numberOfLines={1}>
            {chapter}
          </Text>
        ))}
        {remaining > 0 && (
          <Text style={[styles.chapter, { color: colors.textSecondary }]}>+{remaining} more</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: { width: 34, height: 34, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 3, gap: spacing.md },
  dateLabel: { fontSize: 20, fontWeight: '700', marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cover: { width: 48, height: 48, borderRadius: radii.sm, overflow: 'hidden' },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  chapter: { fontSize: 13 },
});
