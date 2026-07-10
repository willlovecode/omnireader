import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../navigation/types';
import { demoLibrary, type DemoSeries } from '../reader/ImageReader/testFixtures';

type Props = NativeStackScreenProps<RootStackParamList, 'Library'>;

const NUM_COLUMNS = 3;

export function LibraryScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <FlashList
        data={demoLibrary}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <SeriesCell
            series={item}
            onPress={() => navigation.navigate('Reader', { demoId: item.id })}
          />
        )}
      />
    </View>
  );
}

function SeriesCell({ series, onPress }: { series: DemoSeries; onPress: () => void }) {
  return (
    <Pressable style={styles.cell} onPress={onPress}>
      <Image source={{ uri: series.pages[0] }} style={styles.cover} contentFit="cover" />
      <Text style={styles.title} numberOfLines={1}>
        {series.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  listContent: { padding: 8 },
  cell: { flex: 1, margin: 6 },
  cover: { width: '100%', aspectRatio: 2 / 3, borderRadius: 8, backgroundColor: '#222' },
  title: { color: '#fff', marginTop: 4, fontSize: 13 },
});
