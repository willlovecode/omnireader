import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LibraryScreen } from '../library/LibraryScreen';
import { ReaderScreen } from '../reader/ReaderScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Library" component={LibraryScreen} options={{ title: 'Library' }} />
      <Stack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
