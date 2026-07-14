import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing, useAppTheme } from '../../ui/theme';
import { htmlToParagraphs } from './htmlToParagraphs';

interface Props {
  html: string;
  title: string;
  chapterTitle?: string;
  onClose: () => void;
}

const FONT_SIZES = [16, 18, 21, 24] as const;
const LINE_HEIGHT_RATIO = 1.6;

export function TextReader({ html, title, chapterTitle, onClose }: Props) {
  const { colors } = useAppTheme();
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const paragraphs = useMemo(() => htmlToParagraphs(html), [html]);
  const fontSize = FONT_SIZES[fontSizeIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={[styles.headerIcon, { color: colors.textPrimary }]}>✕</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {chapterTitle ?? title}
        </Text>
        <Pressable
          onPress={() => setFontSizeIndex((i) => (i + 1) % FONT_SIZES.length)}
          hitSlop={12}
        >
          <Text style={[styles.headerAA, { color: colors.textPrimary }]}>Aa</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {paragraphs.map((paragraph, i) => (
          <Text
            key={i}
            style={[
              styles.paragraph,
              { fontSize, lineHeight: fontSize * LINE_HEIGHT_RATIO, color: colors.textPrimary },
            ]}
          >
            {paragraph}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerIcon: { fontSize: 18 },
  headerAA: { fontSize: 17, fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 15, marginHorizontal: spacing.md },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  paragraph: { marginBottom: spacing.lg },
});
