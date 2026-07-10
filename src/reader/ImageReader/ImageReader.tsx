import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PagedView } from './PagedView';
import type { ReaderMode } from './types';
import { useImagePreloader } from './useImagePreloader';
import { WebtoonView } from './WebtoonView';

interface Props {
  pages: string[];
  title: string;
  initialMode?: ReaderMode;
}

export function ImageReader({ pages, title, initialMode = 'paged' }: Props) {
  const [mode, setMode] = useState<ReaderMode>(initialMode);
  const [currentIndex, setCurrentIndex] = useState(0);

  useImagePreloader(pages, currentIndex);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Pressable
          style={styles.toggle}
          onPress={() => setMode((m) => (m === 'paged' ? 'webtoon' : 'paged'))}
        >
          <Text style={styles.toggleText}>{mode === 'paged' ? 'Paged' : 'Webtoon'}</Text>
        </Pressable>
      </SafeAreaView>

      {mode === 'paged' ? (
        <PagedView pages={pages} currentIndex={currentIndex} onIndexChange={setCurrentIndex} />
      ) : (
        <WebtoonView pages={pages} currentIndex={currentIndex} onIndexChange={setCurrentIndex} />
      )}

      <View style={styles.footer} pointerEvents="none">
        <Text style={styles.counter}>
          {currentIndex + 1} / {pages.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: '#000',
  },
  title: { color: '#fff', fontSize: 16, flex: 1, marginRight: 8 },
  toggle: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#333', borderRadius: 6 },
  toggleText: { color: '#fff', fontSize: 13 },
  footer: { position: 'absolute', bottom: 16, alignSelf: 'center' },
  counter: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
    fontSize: 12,
  },
});
