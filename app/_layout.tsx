import messaging from '@react-native-firebase/messaging';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Configure notification behavior to show notifications even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: undefined | (() => void);

    // Handle Local Notification Click (Foreground)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.id) {
        console.log('📬 Local Notification Clicked:', data);
        router.push(`/post/${data.id}`);
      }
    });

    // ... [rest of the setupFirebaseMessaging logic] ...
    // Note: I need to duplicate the logic here or just replace the parts I need?
    // replace_file_content replaces the whole block.
    // I will include the existing logic inside.

    // Request notification permission and setup FCM
    async function setupFirebaseMessaging() {
      try {
        // Set up Android Channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        // Request permission (iOS & Android 13+)
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('✅ Notification permission granted');
        } else {
          console.log('❌ Notification permission denied');
          return;
        }

        // Get FCM Token
        const token = await messaging().getToken();
        console.log('🔥 ================================');
        console.log('🔥 FCM TOKEN:');
        console.log('🔥', token);
        console.log('🔥 ================================');

        // Subscribe to 'news' topic
        await messaging().subscribeToTopic('news');
        console.log('✅ Subscribed to topic: news');

        // Listen to foreground messages
        unsubscribe = messaging().onMessage(async (remoteMessage) => {
          console.log('📬 Foreground notification received:', remoteMessage);

          // Schedule local notification to show in the status bar
          if (remoteMessage.notification) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: remoteMessage.notification.title,
                body: remoteMessage.notification.body,
                data: remoteMessage.data,
              },
              trigger: null, // Show immediately
            });
          }
        });

        // Listen to background/quit state messages (Deep Linking)
        messaging().onNotificationOpenedApp((remoteMessage) => {
          console.log('📬 Notification opened from background:', remoteMessage);
          if (remoteMessage.data?.id) {
            router.push(`/post/${remoteMessage.data.id}`);
          }
        });

        // Check if app was opened from a notification (quit state)
        messaging()
          .getInitialNotification()
          .then((remoteMessage) => {
            if (remoteMessage?.data?.id) {
              console.log('📬 Notification opened from quit state:', remoteMessage);
              // Small delay to ensure navigation is ready
              setTimeout(() => {
                router.push(`/post/${remoteMessage.data!.id}`);
              }, 500);
            }
          });

      } catch (error) {
        console.log('❌ Error setting up Firebase Messaging:', error);
      }
    }

    setupFirebaseMessaging();

    return () => {
      if (unsubscribe) unsubscribe();
      responseListener.remove();
    };
  }, []);

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
            <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="story-viewer" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
