import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../navigation/types';
import { ImageReader } from './ImageReader/ImageReader';
import { getDemoSeries } from './ImageReader/testFixtures';

type Props = NativeStackScreenProps<RootStackParamList, 'Reader'>;

// The single content-type branch point (CLAUDE.md, "Content-type handling
// rules"): nothing else in the app should switch on contentType. TextReader
// isn't built yet, so only 'image' is wired up.
export function ReaderScreen({ route }: Props) {
  const series = getDemoSeries(route.params.demoId);
  if (!series) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Unknown demo series: {route.params.demoId}</Text>
      </View>
    );
  }

  switch (series.contentType) {
    case 'image':
      return <ImageReader pages={series.pages} title={series.title} />;
    case 'text':
      return (
        <View style={styles.center}>
          <Text style={styles.message}>Text reader not implemented yet.</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  message: { color: '#fff' },
});
