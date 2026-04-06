import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { LanguageProvider } from '@/context/language-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const TrackingTransparency = await import('expo-tracking-transparency');
        await TrackingTransparency.requestTrackingPermissionsAsync();
      }
      
      // Artificial delay for premium feel
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 1500);
    })();
  }, []);

  return (
    <LanguageProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0F' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="editor"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </LanguageProvider>
  );
}
