import {Platform} from 'react-native';
import {
  OneSignal,
  NotificationClickEvent,
  NotificationWillDisplayEvent,
  InAppMessageClickEvent,
} from 'react-native-onesignal';
import {ONESIGNAL_APP_ID} from '@env';

/**
 * Initialize OneSignal with app ID
 * Note: On Android, OneSignal is initialized natively in MainApplication.kt
 * This function handles iOS initialization and permission requests
 */
export const initializeOneSignal = () => {
  if (!ONESIGNAL_APP_ID) {
    console.warn('OneSignal App ID is not configured');
    return;
  }

  // Initialize OneSignal (iOS only, Android is initialized natively)
  // if (Platform.OS === 'ios') {
  OneSignal.initialize(ONESIGNAL_APP_ID);
  // }

  // Request notification permissions (iOS)
  OneSignal.Notifications.requestPermission(true);

  console.log('✅ OneSignal initialized successfully');
};

/**
 * Set up OneSignal notification listeners
 * Note: This should be called after OneSignal is fully initialized
 */
export const setupOneSignalListeners = () => {
  try {
    // Notification received listener (foreground)
    OneSignal.Notifications.addEventListener(
      'foregroundWillDisplay',
      (event: NotificationWillDisplayEvent) => {
        console.log('📩 Notification received in foreground:', event);

        // Get the notification data
        const notification = event.getNotification();
        console.log('Notification data:', notification);

        // IMPORTANT: Call complete() to display the notification
        // If you don't call this, the notification won't show
        event.getNotification().display();
      },
    );

    // Notification clicked listener (works for both foreground and background)
    OneSignal.Notifications.addEventListener(
      'click',
      (event: NotificationClickEvent) => {
        console.log('🔔 Notification clicked:', event);

        const notification = event.notification;
        const actionId = event.result?.actionId;

        console.log('Notification data:', notification);
        console.log('Action ID:', actionId);

        // Handle navigation based on notification data
        handleNotificationClick(notification);
      },
    );

    // In-app message clicked listener
    OneSignal.InAppMessages.addEventListener(
      'click',
      (event: InAppMessageClickEvent) => {
        console.log('💬 In-app message clicked:', event);
      },
    );

    console.log('✅ OneSignal listeners set up successfully');
  } catch (error) {
    console.error('❌ Failed to set up OneSignal listeners:', error);
  }
};

/**
 * Handle notification click and navigate accordingly
 */
const handleNotificationClick = (notification: any) => {
  // Extract custom data from notification
  const additionalData = notification.additionalData;

  if (!additionalData) {
    return;
  }

  // Example: Navigate based on notification type
  // You'll need to implement navigation logic based on your app structure
  console.log('Handling notification with data:', additionalData);

  // Example navigation patterns:
  // if (additionalData.screen === 'booking') {
  //   navigationRef.navigate('BookingDetails', { id: additionalData.bookingId });
  // }
};

/**
 * Set external user ID for OneSignal
 * Call this after user logs in
 */
export const setOneSignalUserId = (userId: string) => {
  if (!userId) {
    console.warn('User ID is empty');
    return;
  }

  OneSignal.login(userId);
  console.log('✅ OneSignal user ID set:', userId);
};

/**
 * Remove external user ID
 * Call this when user logs out
 */
export const removeOneSignalUserId = () => {
  OneSignal.logout();
  console.log('✅ OneSignal user logged out');
};

/**
 * Add tags to user for segmentation
 */
export const setOneSignalTags = (tags: Record<string, string>) => {
  OneSignal.User.addTags(tags);
  console.log('✅ OneSignal tags set:', tags);
};

/**
 * Remove tags from user
 */
export const removeOneSignalTags = (tagKeys: string[]) => {
  OneSignal.User.removeTags(tagKeys);
  console.log('✅ OneSignal tags removed:', tagKeys);
};

/**
 * Get OneSignal player ID (device ID)
 */
export const getOneSignalPlayerId = async (): Promise<string | null> => {
  return await OneSignal.User.pushSubscription.getIdAsync();
};

/**
 * Get OneSignal user ID
 */
export const getOneSignalUserId = async (): Promise<string | null> => {
  return await OneSignal.User.getOnesignalId();
};

/**
 * Check if user has granted notification permissions
 */
export const hasNotificationPermission = async (): Promise<boolean> => {
  return await OneSignal.Notifications.getPermissionAsync();
};

/**
 * Prompt user for notification permissions
 */
export const promptForPushNotifications = async (): Promise<boolean> => {
  const permission = await OneSignal.Notifications.requestPermission(true);
  return permission;
};
