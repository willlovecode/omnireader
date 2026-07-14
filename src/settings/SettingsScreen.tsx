import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SettingsStackParamList } from '../navigation/types';
import { SearchBar } from '../ui/SearchBar';
import { spacing, useAppTheme } from '../ui/theme';
import { SettingsGroup, SettingsRow } from './SettingsRow';
import { useSettingsStore } from './settingsStore';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsHome'>;

export function SettingsScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const [query, setQuery] = useState('');
  const incognitoMode = useSettingsStore((s) => s.incognitoMode);
  const setIncognitoMode = useSettingsStore((s) => s.setIncognitoMode);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.header, { color: colors.textPrimary }]}>Settings</Text>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search" />

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.lg }]}>
        <SettingsGroup>
          <SettingsRow
            icon="eye-off-outline"
            iconColor="#8E8E93"
            label="Incognito Mode"
            subtitle="Pauses reading history while enabled"
            toggle={{ value: incognitoMode, onValueChange: setIncognitoMode }}
            last
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon="text-outline"
            iconColor="#0A84FF"
            label="Appearance"
            onPress={() => navigation.navigate('Appearance')}
          />
          <SettingsRow
            icon="library-outline"
            iconColor="#FF453A"
            label="Library"
            onPress={() => navigation.navigate('LibrarySettings')}
          />
          <SettingsRow
            icon="book-outline"
            iconColor="#30D158"
            label="Reader"
            onPress={() => navigation.navigate('ReaderSettings')}
          />
          <SettingsRow
            icon="sync-outline"
            iconColor="#FF9F0A"
            label="Tracking"
            onPress={() => navigation.navigate('Tracking')}
          />
          <SettingsRow
            icon="download-outline"
            iconColor="#5E5CE6"
            label="Backup"
            onPress={() => navigation.navigate('Backup')}
          />
          <SettingsRow
            icon="construct-outline"
            iconColor="#8E8E93"
            label="Advanced"
            onPress={() => navigation.navigate('Advanced')}
            last
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon="information-circle-outline"
            iconColor="#8E8E93"
            label="About"
            onPress={() => navigation.navigate('About')}
            last
          />
        </SettingsGroup>
      </ScrollView>
    </SafeAreaView>
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
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: spacing.xl },
});
