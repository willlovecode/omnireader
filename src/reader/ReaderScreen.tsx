import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getDemoSeries } from '../demo/testFixtures';
import type { RootStackParamList } from '../navigation/types';
import { getSource } from '../sources/registry';
import { useAppTheme } from '../ui/theme';
import { ImageReader } from './ImageReader/ImageReader';
import { TextReader } from './TextReader/TextReader';

type Props = NativeStackScreenProps<RootStackParamList, 'Reader'>;

// The single content-type branch point (CLAUDE.md, "Content-type handling
// rules"): nothing else in the app should switch on contentType.
export function ReaderScreen({ route, navigation }: Props) {
  const onClose = () => navigation.goBack();

  return (
    // Reader is presented as a fullScreenModal (RootNavigator) so it covers
    // the tab bar; react-native-safe-area-context doesn't reliably inherit
    // real device insets into fullScreenModal-presented screens, so nest a
    // fresh provider here to force a correct re-measurement for this screen
    // specifically — otherwise SafeAreaView reports 0 and the header/footer
    // render under the notch / off past the home indicator.
    <SafeAreaProvider>
      {'demoId' in route.params ? (
        <DemoReader demoId={route.params.demoId} onClose={onClose} />
      ) : (
        <SourceReader {...route.params} onClose={onClose} />
      )}
    </SafeAreaProvider>
  );
}

function DemoReader({ demoId, onClose }: { demoId: string; onClose: () => void }) {
  const series = getDemoSeries(demoId);
  if (!series) {
    return <Message text={`Unknown demo series: ${demoId}`} />;
  }

  switch (series.contentType) {
    case 'image':
      return <ImageReader pages={series.pages ?? []} title={series.title} onClose={onClose} />;
    case 'text':
      return (
        <TextReader
          html={series.html ?? ''}
          title={series.title}
          chapterTitle={series.chapterTitle}
          onClose={onClose}
        />
      );
  }
}

function SourceReader({
  sourceId,
  chapterId,
  title,
  onClose,
}: {
  sourceId: string;
  seriesId: string;
  chapterId: string;
  title: string;
  onClose: () => void;
}) {
  const { colors } = useAppTheme();
  const source = getSource(sourceId);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['source', sourceId, 'content', chapterId],
    queryFn: () => {
      if (!source) throw new Error(`Unknown source: ${sourceId}`);
      return source.getContent(chapterId);
    },
  });

  if (isPending) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (isError) {
    return <Message text={error instanceof Error ? error.message : 'Failed to load chapter'} />;
  }

  switch (data.contentType) {
    case 'image':
      // chapterId doubles as the chapter's real page URL for all of our
      // hand-written sources (see Source.ts notes on ids) — powers the
      // "open in browser" button.
      return (
        <ImageReader pages={data.pages} headers={data.headers} title={title} onClose={onClose} sourceUrl={chapterId} />
      );
    case 'text':
      return <TextReader html={data.html} title={title} onClose={onClose} />;
  }
}

function Message({ text }: { text: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.message}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  message: { color: '#fff' },
});
