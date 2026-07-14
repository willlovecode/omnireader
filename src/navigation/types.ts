import type { NavigatorScreenParams } from '@react-navigation/native';

// Nested inside the Browse tab: BrowseHome lists sources, SourceCatalog
// shows one source's popular/search results, SeriesDetails is a series
// within it. All keep the tab bar visible (unlike Reader).
export type BrowseStackParamList = {
  BrowseHome: undefined;
  SourceCatalog: { sourceId: string };
  SeriesDetails: { sourceId: string; seriesId: string };
};

export type MainTabParamList = {
  Library: undefined;
  // Typed as a nested-navigator param so the Search tab can deep-link into
  // Browse's SeriesDetails (navigation.navigate('Browse', { screen: ... })).
  Browse: NavigatorScreenParams<BrowseStackParamList>;
  History: undefined;
  Settings: undefined;
  Search: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Reader:
    | { demoId: string }
    | { sourceId: string; seriesId: string; chapterId: string; title: string };
};

// Nested inside the Library tab so Updates keeps the tab bar visible
// (unlike Reader, which is pushed on the root stack and covers it).
export type LibraryStackParamList = {
  LibraryHome: undefined;
  Updates: undefined;
};

// Nested inside the Settings tab so every settings sub-page keeps the tab
// bar visible too.
export type SettingsStackParamList = {
  SettingsHome: undefined;
  Appearance: undefined;
  LibrarySettings: undefined;
  ReaderSettings: undefined;
  Tracking: undefined;
  Backup: undefined;
  Advanced: undefined;
  About: undefined;
};
