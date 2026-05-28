import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";

export default function AgentOverviewScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch agent dashboard statistics
  const { data: stats, refetch, isLoading } = useQuery({
    queryKey: ["agent-overview-stats"],
    queryFn: async () => {
      const res = await api.get("/api/agent/overview");
      return res.data;
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan?.toUpperCase()) {
      case "PRO":
        return { bg: "bg-purple-50 border-purple-100", text: "text-purple-700" };
      case "BASIC":
        return { bg: "bg-blue-50 border-blue-100", text: "text-blue-700" };
      default:
        return { bg: "bg-gray-100 border-gray-200", text: "text-gray-600" };
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  const badgeStyle = getPlanBadgeColor(stats?.subscriptionPlan);

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />
      }
    >
      <View className="p-6">
        
        {/* Subscription Plan Overview Panel */}
        <View className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm mb-6 flex-row justify-between items-center text-left">
          <View className="text-left">
            <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider">Subscription Status</Text>
            <View className="flex-row items-center gap-2 mt-1.5">
              <Text className="text-gray-900 text-lg font-black">{stats?.subscriptionPlan} PLAN</Text>
              <View className={`border px-2.5 py-0.5 rounded-full ${badgeStyle.bg}`}>
                <Text className={`text-[8px] font-black uppercase tracking-wide ${badgeStyle.text}`}>
                  Active
                </Text>
              </View>
            </View>
            {stats?.subscriptionEndDate && (
              <Text className="text-gray-400 text-[10px] font-semibold mt-1">
                Renews on: {stats.subscriptionEndDate}
              </Text>
            )}
          </View>
          <Ionicons name="ribbon-outline" size={32} color="#059669" />
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-4 mb-8">
          {/* Card 1: Listings */}
          <View className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex-1 min-w-[45%] text-left">
            <View className="h-9 w-9 bg-emerald-50 rounded-xl items-center justify-center mb-3">
              <Ionicons name="home" size={18} color="#059669" />
            </View>
            <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider">My Listings</Text>
            <Text className="text-gray-900 text-2xl font-black mt-1">{stats?.totalListings || 0}</Text>
          </View>

          {/* Card 2: Combined Views */}
          <View className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex-1 min-w-[45%] text-left">
            <View className="h-9 w-9 bg-emerald-50 rounded-xl items-center justify-center mb-3">
              <Ionicons name="eye" size={18} color="#059669" />
            </View>
            <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider">Total Views</Text>
            <Text className="text-gray-900 text-2xl font-black mt-1">{stats?.combinedViews || 0}</Text>
          </View>

          {/* Card 3: Enquiries */}
          <View className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex-1 min-w-[45%] text-left">
            <View className="h-9 w-9 bg-emerald-50 rounded-xl items-center justify-center mb-3">
              <Ionicons name="mail" size={18} color="#059669" />
            </View>
            <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider">Enquiries</Text>
            <Text className="text-gray-900 text-2xl font-black mt-1">{stats?.totalEnquiries || 0}</Text>
          </View>

          {/* Card 4: Saves */}
          <View className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex-1 min-w-[45%] text-left">
            <View className="h-9 w-9 bg-emerald-50 rounded-xl items-center justify-center mb-3">
              <Ionicons name="heart" size={18} color="#059669" />
            </View>
            <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider">Listing Saves</Text>
            <Text className="text-gray-900 text-2xl font-black mt-1">{stats?.savedCount || 0}</Text>
          </View>
        </View>

        {/* Quick Management Shortcuts */}
        <Text className="text-gray-950 font-black text-base mb-4 text-left">Quick Actions</Text>
        <View className="space-y-4">
          
          <TouchableOpacity
            onPress={() => router.push("/agent/new-listing")}
            className="bg-emerald-600 rounded-3xl p-5 flex-row items-center justify-between shadow-md shadow-emerald-600/20"
          >
            <View className="flex-row items-center gap-3.5">
              <View className="h-10 w-10 bg-emerald-500 rounded-2xl items-center justify-center">
                <Ionicons name="add-circle" size={20} color="white" />
              </View>
              <View className="text-left">
                <Text className="text-white font-extrabold text-sm">Create New Listing</Text>
                <Text className="text-emerald-100 text-xs font-semibold mt-0.5">Publish property to marketplace</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/agent/listings")}
            className="bg-white border border-gray-100 rounded-3xl p-5 flex-row items-center justify-between shadow-sm mt-4"
          >
            <View className="flex-row items-center gap-3.5">
              <View className="h-10 w-10 bg-emerald-50 rounded-2xl items-center justify-center">
                <Ionicons name="list" size={20} color="#059669" />
              </View>
              <View className="text-left">
                <Text className="text-gray-900 font-extrabold text-sm">Manage Listings</Text>
                <Text className="text-gray-400 text-xs font-semibold mt-0.5">Edit status, check views, delete ads</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#059669" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/enquiries")}
            className="bg-white border border-gray-100 rounded-3xl p-5 flex-row items-center justify-between shadow-sm mt-4"
          >
            <View className="flex-row items-center gap-3.5">
              <View className="h-10 w-10 bg-emerald-50 rounded-2xl items-center justify-center">
                <Ionicons name="chatbubbles" size={20} color="#059669" />
              </View>
              <View className="text-left">
                <Text className="text-gray-900 font-extrabold text-sm">Inbox Enquiries</Text>
                <Text className="text-gray-400 text-xs font-semibold mt-0.5">Reply to buyer messages and leads</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#059669" />
          </TouchableOpacity>

        </View>

      </View>
    </ScrollView>
  );
}
