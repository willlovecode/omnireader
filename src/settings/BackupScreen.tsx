import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SettingsStackParamList } from '../navigation/types';
import { PlaceholderScreen } from '../ui/PlaceholderScreen';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Backup'>;

// Local JSON export/import, not cloud sync — CLAUDE.md explicitly rules out
// accounts/cloud sync for this project. Arrives at build-order step 7, once
// there's a real library to back up.
export function BackupScreen({ navigation }: Props) {
  return (
    <PlaceholderScreen
      title="Backup"
      icon="download-outline"
      message="Export/import your library + progress to a JSON file — arrives once there's a real library to back up."
      onBack={() => navigation.goBack()}
      backLabel="Settings"
    />
  );
}
