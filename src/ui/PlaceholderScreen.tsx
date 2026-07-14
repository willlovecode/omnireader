import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from './BackHeader';
import { spacing, useAppTheme } from './theme';

interface Props {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
  /** Present for screens pushed inside a stack (e.g. Settings sub-pages) —
   *  renders a back row instead of relying on a native header. */
  onBack?: () => void;
  backLabel?: string;
}

/** A consistent "this isn't built yet, here's why" screen — used for every
 *  part of the shell that has UI but no backing feature yet. */
export function PlaceholderScreen({ title, icon, message, onBack, backLabel }: Props) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {onBack && <BackHeader label={backLabel ?? 'Back'} onPress={onBack} />}
      <Text style={[styles.header, { color: colors.textPrimary }]}>{title}</Text>
      <View style={styles.center}>
        <Ionicons name={icon} size={40} color={colors.textSecondary} />
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
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
