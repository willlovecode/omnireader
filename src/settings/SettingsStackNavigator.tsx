import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { SettingsStackParamList } from '../navigation/types';
import { AboutScreen } from './AboutScreen';
import { AdvancedScreen } from './AdvancedScreen';
import { AppearanceScreen } from './AppearanceScreen';
import { BackupScreen } from './BackupScreen';
import { LibrarySettingsScreen } from './LibrarySettingsScreen';
import { ReaderSettingsScreen } from './ReaderSettingsScreen';
import { SettingsScreen } from './SettingsScreen';
import { TrackingScreen } from './TrackingScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

// Nested so every settings sub-page keeps the tab bar visible (only Reader,
// on the root stack, covers it).
export function SettingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} />
      <Stack.Screen name="Appearance" component={AppearanceScreen} />
      <Stack.Screen name="LibrarySettings" component={LibrarySettingsScreen} />
      <Stack.Screen name="ReaderSettings" component={ReaderSettingsScreen} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
      <Stack.Screen name="Backup" component={BackupScreen} />
      <Stack.Screen name="Advanced" component={AdvancedScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
