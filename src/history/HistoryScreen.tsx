import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SearchBar } from '../ui/SearchBar';
import { spacing, useAppTheme } from '../ui/theme';

// Placeholder — reading history needs progress tracking backed by the
// SQLite library (CLAUDE.md build order, step 2), which doesn't exist yet.
export function HistoryScreen() {
  const { colors } = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.header, { color: colors.textPrimary }]}>History</Text>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search history" />
      <View style={[styles.center, { paddingBottom: tabBarHeight }]}>
        <Ionicons name="time-outline" size={40} color={colors.textSecondary} />
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          Reading history arrives with progress tracking.
        </Text>
      </View>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  message: { fontSize: 15, textAlign: 'center' },
});
