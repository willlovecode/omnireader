import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_APP_ICON } from './appIcons';
import { DEFAULT_ACCENT } from '../ui/accentColors';

export type ThemeMode = 'system' | 'light' | 'dark';

interface SettingsState {
  themeMode: ThemeMode;
  accentColor: string;
  appIcon: string;
  /** Pauses writes to reading history — stored now so the toggle is real,
   *  even though history itself doesn't exist until progress tracking
   *  (CLAUDE.md build order, step 2) lands. */
  incognitoMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
  setAppIcon: (iconId: string) => void;
  setIncognitoMode: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      accentColor: DEFAULT_ACCENT,
      appIcon: DEFAULT_APP_ICON,
      incognitoMode: false,
      setThemeMode: (themeMode) => set({ themeMode }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setAppIcon: (appIcon) => set({ appIcon }),
      setIncognitoMode: (incognitoMode) => set({ incognitoMode }),
    }),
    {
      name: 'omnireader.settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
