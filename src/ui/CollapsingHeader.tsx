import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, useAppTheme } from './theme';

interface LargeTitleProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  rightAccessory?: ReactNode;
}

/** The screen's title — rendered as the scrollable list's own header (e.g.
 *  FlashList's ListHeaderComponent) so it scrolls away with the content and
 *  only reappears once you scroll back to the top. No pinned/compact
 *  substitute while scrolled — that was tried and explicitly not wanted.
 *  Pads for the top safe area itself, since it's always the first thing in
 *  the scrollable content once the fixed top SafeAreaView goes away. */
export function LargeTitle({ title, onBack, backLabel, rightAccessory }: LargeTitleProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }}>
      {onBack && (
        <Pressable style={styles.backRow} onPress={onBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={colors.accent} />
          {backLabel && <Text style={[styles.backLabel, { color: colors.accent }]}>{backLabel}</Text>}
        </Pressable>
      )}
      <View style={styles.largeTitleRow}>
        <Text style={[styles.largeTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        {rightAccessory}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  backLabel: { fontSize: 17, marginLeft: 2 },
  largeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  largeTitle: { fontSize: 34, fontWeight: '700', flexShrink: 1 },
});
