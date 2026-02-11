import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps } from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Configure foreground display behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // @ts-ignore - Some versions of expo-notifications might not have these yet, but lint requires them
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotifications = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if firebase is initialized using modular getApps()
    if (getApps().length === 0) {
      console.log('Firebase not initialized yet. Native build might be missing configuration.');
      return;
    }

    const requestUserPermission = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', authStatus);
          await subscribeToTopics();
          getFcmToken();
        }

        // Request Expo Notification permissions for foreground alerts
        await Notifications.requestPermissionsAsync();
      } catch (error) {
        console.log('Permission error:', error);
      }
    };

    const subscribeToTopics = async () => {
      try {
        await messaging().subscribeToTopic('news');
        console.log('Subscribed to news topic!');
      } catch (error) {
        console.log('Topic subscription error:', error);
      }
    };

    const getFcmToken = async () => {
      try {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          console.log('Your Firebase Token is:', fcmToken);
          await AsyncStorage.setItem('fcmToken', fcmToken);
        } else {
          console.log('Failed to get FCM token');
        }
      } catch (error) {
        console.log('Token error:', error);
      }
    };

    const handleNotificationOpen = (data: any) => {
      if (data?.type === 'news' && data?.id) {
        router.push(`/post/${data.id}` as any);
      }
    };

    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      requestUserPermission();
    }

    // Handle foreground messages via Firebase and show via Expo
    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', remoteMessage);
      
      // Display local notification via Expo
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || 'New Notification',
          body: remoteMessage.notification?.body || 'You have a new message',
          data: remoteMessage.data,
        },
        trigger: null, // show immediately
      });
    });

    // Handle background click (FCM native handler)
    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      handleNotificationOpen(remoteMessage.data);
    });

    // Handle app open from quit state (FCM native handler)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          handleNotificationOpen(remoteMessage.data);
        }
      });

    // Handle deep-linking via expo-notifications (foreground interaction)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      console.log('Notification response received:', data);
      handleNotificationOpen(data);
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
      responseListener.remove();
    };
  }, []);
};
