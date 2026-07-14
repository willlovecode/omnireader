import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SettingsStackParamList } from '../navigation/types';
import { BackHeader } from '../ui/BackHeader';
import { spacing, useAppTheme } from '../ui/theme';

type Props = NativeStackScreenProps<SettingsStackParamList, 'About'>;

export function AboutScreen({ navigation }: Props) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <BackHeader label="Settings" onPress={() => navigation.goBack()} />
      <Text style={[styles.header, { color: colors.textPrimary }]}>About</Text>
      <View style={styles.center}>
        <Text style={[styles.appName, { color: colors.textPrimary }]}>omnireader</Text>
        <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  appName: { fontSize: 20, fontWeight: '700' },
  version: { fontSize: 14 },
});
