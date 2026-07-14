import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { BrowseStackNavigator } from '../browse/BrowseStackNavigator';
import { SearchScreen } from '../browse/SearchScreen';
import { HistoryScreen } from '../history/HistoryScreen';
import { LibraryStackNavigator } from '../library/LibraryStackNavigator';
import { SettingsStackNavigator } from '../settings/SettingsStackNavigator';
import { GlassTabBar } from './GlassTabBar';
import type { MainTabParamList } from './types';

// Mirrors Aidoku's tab bar shell (Library / Browse / History / Settings,
// plus Search broken out as its own floating bubble) — see
// TabBarController.swift in the Aidoku repo. History is still a placeholder
// until progress tracking (step 2) lands; Browse now hits a real source
// (step 3).
const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tab.Screen name="Library" component={LibraryStackNavigator} />
      <Tab.Screen name="Browse" component={BrowseStackNavigator} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} />
      <Tab.Screen name="Search" component={SearchScreen} />
    </Tab.Navigator>
  );
}
