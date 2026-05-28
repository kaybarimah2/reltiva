import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

export default function EnquiriesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch enquiries list
  const { data: enquiriesData, refetch, isLoading } = useQuery({
    queryKey: ["enquiries"],
    queryFn: async () => {
      const res = await api.get("/api/enquiries");
      return res.data;
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const enquiries = enquiriesData?.enquiries || [];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700" };
      case "READ":
        return { bg: "bg-blue-50 border-blue-100", text: "text-blue-700" };
      case "REPLIED":
        return { bg: "bg-gray-100 border-gray-200", text: "text-gray-600" };
      default:
        return { bg: "bg-gray-50 border-gray-100", text: "text-gray-500" };
    }
  };

  const isAgent = user?.role === "AGENT";

  return (
    <View className="flex-1 bg-gray-50">
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : enquiries.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8 text-center">
          <View className="h-16 w-16 bg-emerald-50 rounded-full items-center justify-center mb-4">
            <Ionicons name="mail-outline" size={32} color="#059669" />
          </View>
          <Text className="text-gray-900 font-black text-lg">No Enquiries</Text>
          <Text className="text-gray-400 text-xs font-semibold text-center mt-2 leading-relaxed">
            {isAgent
              ? "You haven't received any enquiries from buyers yet. Make sure your listings are active!"
              : "You haven't sent any enquiries yet. Browse properties and send inquiries to agents."}
          </Text>
          {!isAgent && (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/search")}
              className="mt-6 bg-emerald-600 px-6 py-3 rounded-2xl shadow-sm"
            >
              <Text className="text-white font-extrabold text-xs uppercase tracking-wider">Browse Properties</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={enquiries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />
          }
          renderItem={({ item }) => {
            const statusStyle = getStatusColor(item.status);
            const isExpanded = expandedId === item.id;
            const contactName = isAgent ? item.senderName : item.agentName;
            const contactEmail = isAgent ? item.senderEmail : item.agentEmail;
            const contactPhone = isAgent ? item.senderPhone : item.agentPhone;

            return (
              <TouchableOpacity
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.9}
                className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm mb-4"
              >
                {/* Upper Header Row */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider">
                      {isAgent ? "Received" : "Sent"}
                    </Text>
                    <View className={`border px-2 py-0.5 rounded-full ${statusStyle.bg}`}>
                      <Text className={`text-[8px] font-black tracking-wide ${statusStyle.text}`}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-400 text-[10px] font-bold">
                    {formatRelativeTime(item.createdAt)}
                  </Text>
                </View>

                {/* Property & Contact Details */}
                <View className="flex-row items-center gap-3">
                  <Image
                    source={{ uri: item.propertyImage }}
                    className="h-12 w-12 rounded-xl bg-gray-100"
                    contentFit="cover"
                  />
                  <View className="flex-1 text-left">
                    <Text className="text-gray-900 font-extrabold text-xs" numberOfLines={1}>
                      {item.propertyTitle}
                    </Text>
                    <Text className="text-gray-500 text-[11px] font-semibold mt-0.5">
                      {isAgent ? "Buyer" : "Agent"}: {contactName}
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#9ca3af"
                  />
                </View>

                {/* Message & Action details when expanded */}
                {isExpanded && (
                  <View className="mt-4 pt-4 border-t border-gray-50 text-left">
                    <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      Message
                    </Text>
                    <Text className="text-gray-700 text-xs font-medium leading-relaxed bg-gray-50 rounded-2xl p-3">
                      {item.message}
                    </Text>

                    <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mt-4 mb-1">
                      Contact details
                    </Text>
                    <View className="space-y-1 bg-gray-50 rounded-2xl p-3">
                      <View className="flex-row items-center gap-1.5">
                        <Ionicons name="mail" size={12} color="#6b7280" />
                        <Text className="text-gray-600 text-xs font-semibold">{contactEmail}</Text>
                      </View>
                      {contactPhone ? (
                        <View className="flex-row items-center gap-1.5 mt-1">
                          <Ionicons name="call" size={12} color="#6b7280" />
                          <Text className="text-gray-600 text-xs font-semibold">{contactPhone}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
