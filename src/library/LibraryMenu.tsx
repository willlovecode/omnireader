import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { radii, spacing, useAppTheme } from '../ui/theme';

export type ViewMode = 'grid' | 'list';
export type SortMode = 'title' | 'dateAdded';
export type FilterMode = 'all' | 'image' | 'text';

const SORT_LABELS: Record<SortMode, string> = { title: 'Title', dateAdded: 'Date Added' };
const FILTER_LABELS: Record<FilterMode, string> = { all: 'All', image: 'Manga', text: 'Novels' };

interface Props {
  visible: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
}

type MenuView = 'root' | 'sort' | 'filter';

export function LibraryMenu({
  visible,
  onClose,
  viewMode,
  onViewModeChange,
  sortMode,
  onSortModeChange,
  filterMode,
  onFilterModeChange,
}: Props) {
  const { colors, scheme } = useAppTheme();
  const [view, setView] = useState<MenuView>('root');

  const close = () => {
    setView('root');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <SafeAreaView style={styles.anchor} pointerEvents="box-none">
        <View style={[styles.panel, { borderColor: colors.border }]}>
          <BlurView intensity={90} tint={scheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

          {view === 'root' && (
            <>
              {/* Multi-select needs batch actions (delete, mark read) that
                  don't exist without a real library backend yet — present
                  for shape, not wired up. */}
              <MenuRow icon="checkmark-circle-outline" label="Select" colors={colors} onPress={close} />
              <Divider colors={colors} />
              <MenuRow
                icon="grid-outline"
                label="Grid"
                colors={colors}
                selected={viewMode === 'grid'}
                onPress={() => {
                  onViewModeChange('grid');
                  close();
                }}
              />
              <MenuRow
                icon="list-outline"
                label="List"
                colors={colors}
                selected={viewMode === 'list'}
                onPress={() => {
                  onViewModeChange('list');
                  close();
                }}
              />
              <Divider colors={colors} />
              <MenuRow
                icon="swap-vertical-outline"
                label="Sort By"
                subtitle={SORT_LABELS[sortMode]}
                colors={colors}
                chevron
                onPress={() => setView('sort')}
              />
              <MenuRow
                icon="options-outline"
                label="Filter"
                colors={colors}
                chevron
                onPress={() => setView('filter')}
              />
            </>
          )}

          {view === 'sort' && (
            <>
              <SubmenuHeader label="Sort By" colors={colors} onBack={() => setView('root')} />
              {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
                <MenuRow
                  key={mode}
                  label={SORT_LABELS[mode]}
                  colors={colors}
                  selected={sortMode === mode}
                  onPress={() => {
                    onSortModeChange(mode);
                    close();
                  }}
                />
              ))}
            </>
          )}

          {view === 'filter' && (
            <>
              <SubmenuHeader label="Filter" colors={colors} onBack={() => setView('root')} />
              {(Object.keys(FILTER_LABELS) as FilterMode[]).map((mode) => (
                <MenuRow
                  key={mode}
                  label={FILTER_LABELS[mode]}
                  colors={colors}
                  selected={filterMode === mode}
                  onPress={() => {
                    onFilterModeChange(mode);
                    close();
                  }}
                />
              ))}
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function MenuRow({
  icon,
  label,
  subtitle,
  colors,
  selected,
  chevron,
  onPress,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
  selected?: boolean;
  chevron?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      {selected ? (
        <Ionicons name="checkmark" size={18} color={colors.textPrimary} style={styles.rowLeadingIcon} />
      ) : icon ? (
        <Ionicons name={icon} size={18} color={colors.textPrimary} style={styles.rowLeadingIcon} />
      ) : (
        <View style={styles.rowLeadingIcon} />
      )}
      <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
      {subtitle && <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      {chevron && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
    </Pressable>
  );
}

function SubmenuHeader({
  label,
  colors,
  onBack,
}: {
  label: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
  onBack: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onBack}>
      <Ionicons name="chevron-back" size={18} color={colors.textPrimary} style={styles.rowLeadingIcon} />
      <Text style={[styles.rowLabel, { color: colors.textPrimary, fontWeight: '700' }]}>{label}</Text>
    </Pressable>
  );
}

function Divider({ colors }: { colors: ReturnType<typeof useAppTheme>['colors'] }) {
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  anchor: { flex: 1, alignItems: 'flex-end', paddingTop: 52, paddingRight: spacing.lg },
  panel: {
    width: 240,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingVertical: spacing.xs,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  rowLeadingIcon: { width: 18 },
  rowLabel: { flex: 1, fontSize: 15 },
  rowSubtitle: { fontSize: 13 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.xs },
});
