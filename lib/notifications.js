import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'

// How notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices')
    return null
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  // Ask for permission if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied')
    return null
  }

  // Get push token
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'voltride-app',
    })
    console.log('Push token:', token.data)
    return token.data
  } catch (err) {
    console.log('Error getting push token:', err)
    return null
  }
}

// Send a local notification (for testing)
export async function sendLocalNotification(title, body, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // immediately
  })
}

// Notification helpers for specific events
export const notify = {
  driverMatched: (driverName, eta) =>
    sendLocalNotification(
      '⚡ Driver Matched!',
      `${driverName} is on the way — ${eta} min away`,
      { type: 'driver_matched' }
    ),

  driverArriving: (driverName) =>
    sendLocalNotification(
      '🚗 Driver Arriving',
      `${driverName} is arriving at your pickup location`,
      { type: 'driver_arriving' }
    ),

  rideComplete: (amount) =>
    sendLocalNotification(
      '✅ Ride Complete',
      `Your ride is complete. Total: $${amount}`,
      { type: 'ride_complete' }
    ),

  rideScheduled: (date, time) =>
    sendLocalNotification(
      '📅 Ride Scheduled',
      `Your ride is confirmed for ${date} at ${time}`,
      { type: 'ride_scheduled' }
    ),

  promoCredit: (amount) =>
    sendLocalNotification(
      '🎁 Credit Added',
      `$${amount} has been added to your VoltRide wallet`,
      { type: 'promo' }
    ),
}

