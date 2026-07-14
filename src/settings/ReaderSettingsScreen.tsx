import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SettingsStackParamList } from '../navigation/types';
import { PlaceholderScreen } from '../ui/PlaceholderScreen';

type Props = NativeStackScreenProps<SettingsStackParamList, 'ReaderSettings'>;

export function ReaderSettingsScreen({ navigation }: Props) {
  return (
    <PlaceholderScreen
      title="Reader"
      icon="book-outline"
      message="Default reading mode and font settings — right now these live per-session in the reader itself."
      onBack={() => navigation.goBack()}
      backLabel="Settings"
    />
  );
}
