import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SettingsStackParamList } from '../navigation/types';
import { PlaceholderScreen } from '../ui/PlaceholderScreen';

type Props = NativeStackScreenProps<SettingsStackParamList, 'LibrarySettings'>;

export function LibrarySettingsScreen({ navigation }: Props) {
  return (
    <PlaceholderScreen
      title="Library"
      icon="library-outline"
      message="Default sort/filter and update-check settings arrive with the source registry."
      onBack={() => navigation.goBack()}
      backLabel="Settings"
    />
  );
}
