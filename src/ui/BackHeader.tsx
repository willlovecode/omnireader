import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, useAppTheme } from './theme';

interface Props {
  label: string;
  onPress: () => void;
}

/** Back-navigation row for screens pushed inside a tab's own stack (Series
 *  details, Settings sub-pages, ...). Explicitly opaque + bordered — without
 *  that, scrolled content underneath can bleed through/overlap the row
 *  since it has no background of its own to paint over it. */
export function BackHeader({ label, onPress }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <Pressable style={styles.button} onPress={onPress} hitSlop={12}>
        <Ionicons name="chevron-back" size={22} color={colors.accent} />
        <Text style={[styles.label, { color: colors.accent }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  button: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  label: { fontSize: 17, marginLeft: 2 },
});
