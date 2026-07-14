import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { BrowseStackParamList } from '../navigation/types';
import { getAllSources } from '../sources/registry';
import type { Source } from '../sources/Source';
import { LargeTitle } from '../ui/CollapsingHeader';
import { radii, spacing, useAppTheme } from '../ui/theme';

type Props = NativeStackScreenProps<BrowseStackParamList, 'BrowseHome'>;

export function SourceListScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const sources = getAllSources();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlashList
        style={styles.list}
        data={sources}
        keyExtractor={(item) => item.info.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + spacing.md }]}
        ListHeaderComponent={<LargeTitle title="Browse" />}
        renderItem={({ item }) => (
          <SourceRow
            source={item}
            onPress={() => navigation.navigate('SourceCatalog', { sourceId: item.info.id })}
          />
        )}
      />
    </View>
  );
}

function SourceRow({ source, onPress }: { source: Source; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.icon, { backgroundColor: colors.accent }]}>
        <Text style={styles.iconText}>{source.info.name[0]}</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{source.info.name}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {source.info.lang.toUpperCase()} · {source.info.contentType === 'image' ? 'Manga' : 'Novels'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  icon: { width: 40, height: 40, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  rowText: { flex: 1, gap: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 12 },
});
