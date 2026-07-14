import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, useAppTheme } from '../../ui/theme';
import { PagedView } from './PagedView';
import { PageSlider } from './PageSlider';
import type { PageViewHandle, ReaderMode } from './types';
import { useImagePreloader } from './useImagePreloader';
import { WebtoonView } from './WebtoonView';

interface Props {
  pages: string[];
  title: string;
  onClose: () => void;
  initialMode?: ReaderMode;
  /** Extra request headers (e.g. Referer) for hotlink-protected sources. */
  headers?: Record<string, string>;
  /** The chapter's real page URL, if this came from a live source (not the
   *  local demo content) — powers the "open in browser" button, disabled
   *  without one, exactly like Aidoku disables its equivalent button when
   *  chapter.url is nil. */
  sourceUrl?: string;
}

// A tap moves the finger less than this; anything more is a scroll/swipe.
const TAP_MOVE_THRESHOLD = 20;

export function ImageReader({ pages, title, onClose, initialMode = 'paged', headers, sourceUrl }: Props) {
  const { colors, scheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<ReaderMode>(initialMode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(true);
  const viewRef = useRef<PageViewHandle>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useImagePreloader(pages, currentIndex, headers);

  const pagesRead = currentIndex + 1;
  const pagesLeft = pages.length - pagesRead;

  const handleSliderChange = (index: number) => {
    if (index !== currentIndex) {
      viewRef.current?.scrollToIndex(index);
      setCurrentIndex(index);
    }
  };

  // Plain touch listeners instead of Pressable: Pressable claims the touch
  // responder itself, which fights the FlashList's own scroll/paging
  // gesture underneath (confirmed on-device — scrolling barely worked).
  // onTouchStart/onTouchEnd are passive observers that don't contest the
  // responder, so native scrolling is untouched; a tap is just "the finger
  // didn't move much between start and end."
  const handleTouchStart = (e: GestureResponderEvent) => {
    touchStart.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
  };
  const handleTouchEnd = (e: GestureResponderEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = e.nativeEvent.pageX - start.x;
    const dy = e.nativeEvent.pageY - start.y;
    if (Math.hypot(dx, dy) < TAP_MOVE_THRESHOLD) {
      setChromeVisible((v) => !v);
    }
  };

  // No chapter-jump UI yet (needs a picker built on top of Source.getChapters())
  // — present for 1:1 layout parity with Aidoku, wired up once that exists.
  const openChapterList = () => {};

  const openInBrowser = () => {
    if (sourceUrl) WebBrowser.openBrowserAsync(sourceUrl);
  };

  // No reader-settings sheet yet (brightness/color filters/reading
  // direction) — temporarily mapped to the paged/webtoon toggle we already
  // have, since that's the closest existing feature. Repoint this at the
  // real settings sheet once it exists.
  const openReaderSettings = () => setMode((m) => (m === 'paged' ? 'webtoon' : 'paged'));

  const tint = scheme === 'dark' ? 'dark' : 'light';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar hidden={!chromeVisible} animated />

      {/* Base layer: always full-screen, regardless of chrome visibility —
          header/footer are overlays drawn on top, never siblings that would
          resize this and force the page to relayout/rescale. */}
      <View style={StyleSheet.absoluteFill} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {mode === 'paged' ? (
          <PagedView ref={viewRef} pages={pages} currentIndex={currentIndex} onIndexChange={setCurrentIndex} headers={headers} />
        ) : (
          <WebtoonView ref={viewRef} pages={pages} currentIndex={currentIndex} onIndexChange={setCurrentIndex} headers={headers} />
        )}
      </View>

      {chromeVisible && (
        <View style={[styles.headerOverlay, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
          <View style={styles.pill}>
            <BlurView intensity={80} tint={tint} style={StyleSheet.absoluteFill} />
            <View style={styles.headerRow}>
              <View style={styles.iconGroup}>
                <Pressable onPress={onClose} hitSlop={12}>
                  <Ionicons name="close" size={22} color={colors.textPrimary} />
                </Pressable>
                <Pressable onPress={openChapterList} hitSlop={12}>
                  <Ionicons name="list-outline" size={20} color={colors.textPrimary} />
                </Pressable>
              </View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {title}
              </Text>
              <View style={styles.iconGroup}>
                <Pressable onPress={openInBrowser} disabled={!sourceUrl} hitSlop={12}>
                  <Ionicons name="compass-outline" size={20} color={sourceUrl ? colors.textPrimary : colors.textSecondary} />
                </Pressable>
                <Pressable onPress={openReaderSettings} hitSlop={12}>
                  <Text style={[styles.aaText, { color: colors.textPrimary }]}>Aa</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}

      {chromeVisible && (
        <View style={[styles.footerOverlay, { bottom: insets.bottom + spacing.sm }]} pointerEvents="box-none">
          <View style={styles.pill}>
            <BlurView intensity={80} tint={tint} style={StyleSheet.absoluteFill} />
            <PageSlider
              value={currentIndex}
              maximum={Math.max(pages.length - 1, 0)}
              onChange={handleSliderChange}
              trackColor={colors.backgroundSecondary}
              fillColor={colors.accent}
              thumbColor={colors.accent}
            />
            <View style={styles.progressLabels}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                {pagesRead} of {pages.length}
              </Text>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                {pagesLeft} pages left
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const PILL_RADIUS = 26;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerOverlay: { position: 'absolute', left: spacing.md, right: spacing.md },
  footerOverlay: { position: 'absolute', left: spacing.md, right: spacing.md },
  pill: {
    borderRadius: PILL_RADIUS,
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 15, marginHorizontal: spacing.md },
  aaText: { fontSize: 16, fontWeight: '600' },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  progressLabel: { fontSize: 12 },
});
