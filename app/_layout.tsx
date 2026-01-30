// Forced refresh: 2026-01-29
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  requestPermission,
  setBackgroundMessageHandler,
  subscribeToTopic
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';

export const unstable_settings = {
  initialRouteName: '(tabs)',
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

// Helper for scheduling local notification from FCM message
async function scheduleLocalNotification(remoteMessage: any) {
  if (remoteMessage.notification) {
    const imageUrl = remoteMessage.notification.android?.imageUrl || remoteMessage.data?.imageUrl;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        data: remoteMessage.data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        channelId: 'janhimachal_alerts', // Changed from default
        ...(imageUrl ? {
          attachments: [{ url: imageUrl }],
          launchImageDisplay: true
        } : {}),
      } as any,
      trigger: null,
    }).catch(err => console.log('❌ Error scheduling notification:', err));
  }
}

// Handle background messages
setBackgroundMessageHandler(getMessaging(), async (remoteMessage: any) => {
  console.log('📬 Message handled in the background!', remoteMessage);
  await scheduleLocalNotification(remoteMessage);
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: undefined | (() => void);
    let responseListener: any;

    // Handle Local Notification Click (Foreground)
    responseListener = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data;
      if (data?.id) {
        console.log('📬 Local Notification Clicked:', data);
        router.push(`/post/${data.id}`);
      }
    });

    // Request notification permission and setup FCM
    async function setupFirebaseMessaging() {
      try {
        // Set up Android Channel
        if (Platform.OS === 'android') {
          console.log('🛠 Setting up notification channel...');
          await Notifications.setNotificationChannelAsync('janhimachal_alerts', {
            name: 'Jan Himachal Alerts',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            enableVibrate: true,
            showBadge: true,
            bypassDnd: true,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          });
          const channels = await Notifications.getNotificationChannelsAsync();
          console.log('📋 Available channels:', channels.map(c => c.id));
        }

        // Request permission (iOS & Android 13+)
        const msg = getMessaging();

        // Check Expo Permissions too
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        const authStatus = await requestPermission(msg);
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL ||
          finalStatus === 'granted';

        if (enabled) {
          console.log('✅ Notification permission granted (FCM:', authStatus, 'Expo:', finalStatus, ')');
        } else {
          console.log('❌ Notification permission denied');
          return;
        }

        // Get FCM Token
        const token = await getToken(msg);
        console.log('🔥 ================================');
        console.log('🔥 FCM TOKEN:');
        console.log('🔥', token);
        console.log('🔥 ================================');

        // Subscribe to 'news' topic
        await subscribeToTopic(msg, 'news');
        console.log('✅ Subscribed to topic: news');

        // Listen to foreground messages
        unsubscribe = onMessage(msg, async (remoteMessage: any) => {
          console.log('📬 Foreground notification received:', remoteMessage);
          await scheduleLocalNotification(remoteMessage);
        });

        // Listen to background/quit state messages (Deep Linking)
        onNotificationOpenedApp(msg, (remoteMessage: any) => {
          console.log('📬 Notification opened from background:', remoteMessage);
          if (remoteMessage.data?.id) {
            router.push(`/post/${remoteMessage.data.id}`);
          }
        });

        // Check if app was opened from a notification (quit state)
        getInitialNotification(msg)
          .then((remoteMessage: any) => {
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
      if (responseListener) responseListener.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="nanhe-patrakar-guide" options={{ headerShown: false }} />
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
