import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/lib/notifications";

// Setup React Query client
const queryClient = new QueryClient();

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Authentication state auto-routing controller
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Unauthenticated -> Force login screen
      router.replace("/(auth)/login");
    } else if (user && (inAuthGroup || segments.length === 0 || segments[0] === "index")) {
      // Authenticated -> Force tabs dashboard
      router.replace("/(tabs)/home");
    }
  }, [user, isLoading, segments, router]);

  // Register push notifications when user is logged in
  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync();
    }
  }, [user]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="properties/[id]" 
        options={{ 
          headerShown: true, 
          title: "Property Details", 
          headerTintColor: "#059669",
          headerTitleStyle: { fontWeight: "bold" }
        }} 
      />
      <Stack.Screen name="agent" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </QueryClientProvider>
  );
}
