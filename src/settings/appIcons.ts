// Placeholder app icon choices. These only drive the Settings picker UI for
// now — actually swapping the OS home-screen icon needs a native module
// (e.g. expo-dynamic-app-icon) that requires a custom dev-client build, which
// the project doesn't have yet (still testing via Expo Go). Real icon
// artwork + native wiring comes later; swap these placeholders out then.
export interface AppIconOption {
  id: string;
  label: string;
  color: string;
  glyph: string;
}

export const APP_ICON_OPTIONS: AppIconOption[] = [
  { id: 'default', label: 'Default', color: '#0A84FF', glyph: 'O' },
  { id: 'dark', label: 'Dark', color: '#1C1C1E', glyph: 'O' },
  { id: 'mono', label: 'Mono', color: '#8E8E93', glyph: 'O' },
];

export const DEFAULT_APP_ICON = APP_ICON_OPTIONS[0].id;
