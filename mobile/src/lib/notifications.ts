import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import api from "./api";

// Configure notifications display
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "web") {
    return null;
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }
    
    // Get Expo Push Token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: undefined, // Will be fetched from app.json credentials automatically
      });
      token = tokenData.data;

      // Save token to backend profile if logged in
      if (token) {
        await savePushTokenToBackend(token);
      }
    } catch (error) {
      console.error("Error fetching Expo Push Token:", error);
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}

async function savePushTokenToBackend(token: string) {
  try {
    // Send push token to the backend endpoint if it exists
    await api.post("/api/alerts/push-token", { token }).catch(() => {
      // Endpoint may not be active or user might not be logged in yet
      // We ignore since they will re-register on login session
    });
  } catch (error) {
    console.error("Failed to save push token on backend:", error);
  }
}
