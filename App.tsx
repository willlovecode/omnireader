import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ensureDatabaseReady } from './src/db/bootstrap';
import { RootNavigator } from './src/navigation/RootNavigator';
import { WebViewRenderHost } from './src/sources/webview/WebViewRenderHost';
import { useAppTheme } from './src/ui/theme';

const queryClient = new QueryClient();

export default function App() {
  const { scheme, colors } = useAppTheme();
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    ensureDatabaseReady()
      .then(() => setDbReady(true))
      .catch((error: unknown) => setDbError(error instanceof Error ? error.message : String(error)));
  }, []);

  const navigationTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.accent,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
    },
  };

  if (dbError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background }}>
        <Text style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>Database failed to start</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>{dbError}</Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
        <WebViewRenderHost />
      </QueryClientProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}
