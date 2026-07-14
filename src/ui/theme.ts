import { useColorScheme } from 'react-native';

import { useSettingsStore } from '../settings/settingsStore';

// Structural (non-color) tokens — same in both themes.
export const radii = {
  sm: 8,
  md: 12,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

interface Palette {
  background: string;
  backgroundSecondary: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  overlayScrimTop: string;
  overlayScrimBottom: string;
}

const lightPalette: Palette = {
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  surface: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  overlayScrimTop: 'rgba(0,0,0,0)',
  overlayScrimBottom: 'rgba(0,0,0,0.75)',
};

const darkPalette: Palette = {
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  surface: '#1C1C1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#98989D',
  border: '#38383A',
  overlayScrimTop: 'rgba(0,0,0,0)',
  overlayScrimBottom: 'rgba(0,0,0,0.85)',
};

export type ColorScheme = 'light' | 'dark';

export interface AppTheme {
  scheme: ColorScheme;
  colors: Palette & { accent: string };
}

/** Resolves the user's theme-mode + accent-color settings against the system
 *  color scheme into a concrete, ready-to-use palette. */
export function useAppTheme(): AppTheme {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const accentColor = useSettingsStore((s) => s.accentColor);

  const scheme: ColorScheme = themeMode === 'system' ? (systemScheme ?? 'light') : themeMode;
  const palette = scheme === 'dark' ? darkPalette : lightPalette;

  return { scheme, colors: { ...palette, accent: accentColor } };
}
