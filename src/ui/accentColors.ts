// A neutral, non-branded starting palette of accent colors the user picks
// from in Settings — not tied to any particular app's look.
export interface AccentOption {
  id: string;
  label: string;
  value: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'blue', label: 'Blue', value: '#0A84FF' },
  { id: 'indigo', label: 'Indigo', value: '#5E5CE6' },
  { id: 'purple', label: 'Purple', value: '#BF5AF2' },
  { id: 'pink', label: 'Pink', value: '#FF375F' },
  { id: 'red', label: 'Red', value: '#FF453A' },
  { id: 'orange', label: 'Orange', value: '#FF9F0A' },
  { id: 'yellow', label: 'Yellow', value: '#FFD60A' },
  { id: 'green', label: 'Green', value: '#30D158' },
  { id: 'teal', label: 'Teal', value: '#40C8E0' },
];

export const DEFAULT_ACCENT = ACCENT_OPTIONS[0].value;
