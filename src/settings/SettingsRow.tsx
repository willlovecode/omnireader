import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { radii, spacing, useAppTheme } from '../ui/theme';

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  toggle?: { value: boolean; onValueChange: (value: boolean) => void };
  last?: boolean;
}

/** One row of a grouped iOS-Settings-style list: colored icon square, label,
 *  and either a chevron (navigates) or a switch. */
export function SettingsRow({ icon, iconColor, label, subtitle, onPress, toggle, last }: RowProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconSquare, { backgroundColor: iconColor }]}>
        <Ionicons name={icon} size={16} color="#FFFFFF" />
      </View>
      <View style={styles.labelColumn}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {toggle && <Switch value={toggle.value} onValueChange={toggle.onValueChange} />}
      {onPress && !toggle && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
    </Pressable>
  );
}

export function SettingsGroup({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.group, { backgroundColor: colors.backgroundSecondary }, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  group: { borderRadius: radii.md, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  iconSquare: { width: 30, height: 30, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  labelColumn: { flex: 1, gap: 1 },
  label: { fontSize: 16 },
  subtitle: { fontSize: 13 },
});
