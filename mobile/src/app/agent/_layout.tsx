import React from "react";
import { Stack } from "expo-router";

export default function AgentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: "#059669",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="overview"
        options={{
          title: "Agent Portal",
          headerTitle: "Agent Dashboard",
        }}
      />
      <Stack.Screen
        name="listings"
        options={{
          title: "My Listings",
          headerTitle: "Manage Listings",
        }}
      />
      <Stack.Screen
        name="new-listing"
        options={{
          title: "New Listing",
          headerTitle: "Create Listing",
        }}
      />
    </Stack>
  );
}
