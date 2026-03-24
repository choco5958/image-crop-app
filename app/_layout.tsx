import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { LanguageProvider } from '@/context/language-context';

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const TrackingTransparency = await import('expo-tracking-transparency');
        await TrackingTransparency.requestTrackingPermissionsAsync();
      }
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
