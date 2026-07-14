import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ReaderScreen } from '../reader/ReaderScreen';
import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Reader is pushed on top of the whole tab bar (matches Aidoku: opening a
// chapter covers the tabs, not just the current tab's stack). Every screen
// renders its own header so it can theme it to light/dark + accent color.
export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Reader" component={ReaderScreen} options={{ presentation: 'fullScreenModal' }} />
    </Stack.Navigator>
  );
}
