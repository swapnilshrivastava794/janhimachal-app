import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="nanhe-patrakar" options={{ headerShown: false }} />
            <Stack.Screen name="nanhe-patrakar-registration" options={{ headerShown: false }} />
            <Stack.Screen name="nanhe-patrakar-submission" options={{ headerShown: false }} />
            <Stack.Screen name="nanhe-patrakar-portfolio" options={{ headerShown: false }} />
            <Stack.Screen name="nanhe-patrakar-hub" options={{ headerShown: false }} />
            <Stack.Screen name="nanhe-patrakar-reader" options={{ headerShown: false }} />
            <Stack.Screen name="nanhe-patrakar-child-profile" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ headerShown: false }} />
            <Stack.Screen name="payment-success" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
