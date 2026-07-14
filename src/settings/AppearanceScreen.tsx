import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SettingsStackParamList } from '../navigation/types';
import { ACCENT_OPTIONS } from '../ui/accentColors';
import { BackHeader } from '../ui/BackHeader';
import { radii, spacing, useAppTheme } from '../ui/theme';
import { APP_ICON_OPTIONS } from './appIcons';
import { type ThemeMode, useSettingsStore } from './settingsStore';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Appearance'>;

const THEME_MODES: { id: ThemeMode; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export function AppearanceScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const accentColor = useSettingsStore((s) => s.accentColor);
  const appIcon = useSettingsStore((s) => s.appIcon);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const setAccentColor = useSettingsStore((s) => s.setAccentColor);
  const setAppIcon = useSettingsStore((s) => s.setAppIcon);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <BackHeader label="Settings" onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.textPrimary }]}>Appearance</Text>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Section title="Theme" colors={colors}>
          <View style={styles.segmented}>
            {THEME_MODES.map((mode) => {
              const selected = mode.id === themeMode;
              return (
                <Pressable
                  key={mode.id}
                  style={[styles.segment, { backgroundColor: selected ? colors.accent : colors.backgroundSecondary }]}
                  onPress={() => setThemeMode(mode.id)}
                >
                  <Text style={[styles.segmentText, { color: selected ? '#FFFFFF' : colors.textPrimary }]}>
                    {mode.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Accent Color" colors={colors}>
          <View style={styles.swatchRow}>
            {ACCENT_OPTIONS.map((option) => {
              const selected = option.value === accentColor;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setAccentColor(option.value)}
                  style={[styles.swatchOuter, selected && { borderColor: option.value }]}
                >
                  <View style={[styles.swatch, { backgroundColor: option.value }]}>
                    {selected && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="App Icon" colors={colors}>
          <View style={styles.swatchRow}>
            {APP_ICON_OPTIONS.map((option) => {
              const selected = option.id === appIcon;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setAppIcon(option.id)}
                  style={[styles.swatchOuter, selected && { borderColor: colors.accent }]}
                >
                  <View style={[styles.iconSwatch, { backgroundColor: option.color }]}>
                    <Text style={styles.iconGlyph}>{option.glyph}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Placeholders — real icon artwork and actual home-screen switching land once the app
            moves off Expo Go to a custom build.
          </Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 34,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.xl },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  segmented: { flexDirection: 'row', gap: spacing.sm },
  segment: { flex: 1, paddingVertical: spacing.sm, borderRadius: radii.sm, alignItems: 'center' },
  segmentText: { fontSize: 14, fontWeight: '600' },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  swatchOuter: { borderRadius: radii.pill, borderWidth: 2, borderColor: 'transparent', padding: 3 },
  swatch: { width: 36, height: 36, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  iconSwatch: { width: 36, height: 36, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  helperText: { fontSize: 12, lineHeight: 17 },
});
