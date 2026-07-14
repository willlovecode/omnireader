import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LibraryScreen } from './LibraryScreen';
import { UpdatesScreen } from './UpdatesScreen';
import type { LibraryStackParamList } from '../navigation/types';

const Stack = createNativeStackNavigator<LibraryStackParamList>();

// Nested so Updates (opened from the bell icon) keeps the tab bar visible —
// only Reader (on the root stack) covers it.
export function LibraryStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LibraryHome" component={LibraryScreen} />
      <Stack.Screen name="Updates" component={UpdatesScreen} />
    </Stack.Navigator>
  );
}
