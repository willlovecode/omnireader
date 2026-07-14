import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { BrowseStackParamList } from '../navigation/types';
import { SeriesDetailsScreen } from './SeriesDetailsScreen';
import { SourceCatalogScreen } from './SourceCatalogScreen';
import { SourceListScreen } from './SourceListScreen';

const Stack = createNativeStackNavigator<BrowseStackParamList>();

// Nested so SourceCatalog/SeriesDetails keep the tab bar visible — only
// Reader (on the root stack) covers it.
export function BrowseStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrowseHome" component={SourceListScreen} />
      <Stack.Screen name="SourceCatalog" component={SourceCatalogScreen} />
      <Stack.Screen name="SeriesDetails" component={SeriesDetailsScreen} />
    </Stack.Navigator>
  );
}
