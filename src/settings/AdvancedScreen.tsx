import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SettingsStackParamList } from '../navigation/types';
import { PlaceholderScreen } from '../ui/PlaceholderScreen';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Advanced'>;

export function AdvancedScreen({ navigation }: Props) {
  return (
    <PlaceholderScreen
      title="Advanced"
      icon="construct-outline"
      message="Cache management, debug logging, and similar — nothing here yet."
      onBack={() => navigation.goBack()}
      backLabel="Settings"
    />
  );
}
