import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SettingsStackParamList } from '../navigation/types';
import { PlaceholderScreen } from '../ui/PlaceholderScreen';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Tracking'>;

export function TrackingScreen({ navigation }: Props) {
  return (
    <PlaceholderScreen
      title="Tracking"
      icon="sync-outline"
      message="Not on the roadmap yet — this row exists for shell parity only."
      onBack={() => navigation.goBack()}
      backLabel="Settings"
    />
  );
}
