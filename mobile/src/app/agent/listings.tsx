import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

export default function AgentListingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch properties listed by this agent
  const { data: propertiesData, refetch, isLoading } = useQuery({
    queryKey: ["agent-listings", user?.id],
    queryFn: async () => {
      const res = await api.get(`/api/properties?agentId=${user?.id}`);
      return res.data;
    },
    enabled: !!user?.id,
  });

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/properties/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-listings", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["properties-home"] });
      queryClient.invalidateQueries({ queryKey: ["search-properties"] });
      Alert.alert("Success", "Listing deleted successfully");
    },
    onError: (err: any) => {
      Alert.alert("Error", err.response?.data?.error || "Failed to delete listing");
    },
  });

  // Update listing status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/api/properties/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-listings", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["properties-home"] });
      queryClient.invalidateQueries({ queryKey: ["search-properties"] });
      Alert.alert("Success", "Listing status updated");
    },
    onError: (err: any) => {
      Alert.alert("Error", err.response?.data?.error || "Failed to update status");
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDeletePrompt = (id: string) => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to permanently delete this listing?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteListingMutation.mutate(id) },
      ]
    );
  };

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "AVAILABLE" ? "SOLD" : "AVAILABLE";
    Alert.alert(
      "Update Status",
      `Mark this property as ${nextStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => updateStatusMutation.mutate({ id, status: nextStatus }) },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return `GHS ${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const properties = propertiesData?.properties || [];

  return (
    <View className="flex-1 bg-gray-50">
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : properties.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8 text-center">
          <View className="h-16 w-16 bg-emerald-50 rounded-full items-center justify-center mb-4">
            <Ionicons name="business-outline" size={32} color="#059669" />
          </View>
          <Text className="text-gray-900 font-black text-lg">No Listings Yet</Text>
          <Text className="text-gray-400 text-xs font-semibold text-center mt-2 leading-relaxed">
            You haven&apos;t created any property listings yet. Publish your first property now!
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/agent/new-listing")}
            className="mt-6 bg-emerald-600 px-6 py-3 rounded-2xl shadow-sm"
          >
            <Text className="text-white font-extrabold text-xs uppercase tracking-wider">Create Listing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />
          }
          renderItem={({ item }) => {
            const isSold = item.status === "SOLD";

            return (
              <View className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm mb-4">
                <View className="flex-row h-28 relative">
                  <Image
                    source={{ uri: item.image }}
                    className="h-full w-28"
                    contentFit="cover"
                  />

                  {isSold && (
                    <View className="absolute top-0 left-0 h-full w-28 bg-black/60 items-center justify-center">
                      <Text className="text-white font-black text-xs uppercase tracking-wide">SOLD</Text>
                    </View>
                  )}

                  <View className="flex-1 p-3.5 justify-between text-left">
                    <View>
                      <View className="flex-row justify-between items-start">
                        <Text className="text-gray-900 font-black text-xs leading-tight flex-1 mr-1" numberOfLines={1}>
                          {item.title}
                        </Text>
                        <View className={`border px-1.5 py-0.5 rounded-md ${
                          item.status === "SOLD" ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"
                        }`}>
                          <Text className={`text-[7px] font-black tracking-wide ${
                            item.status === "SOLD" ? "text-red-700" : "text-emerald-700"
                          }`}>
                            {item.status}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-gray-400 text-[10px] font-bold mt-1" numberOfLines={1}>
                        {item.neighborhood}, {item.city}
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center">
                      <Text className="text-emerald-600 font-black text-sm">
                        {formatPrice(item.price)}
                      </Text>
                      
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="eye-outline" size={12} color="#9ca3af" />
                        <Text className="text-gray-500 text-[10px] font-bold">{item.views || 0}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Listing Action buttons */}
                <View className="flex-row border-t border-gray-50 p-2.5 bg-gray-50/50 justify-between items-center px-4">
                  <TouchableOpacity
                    onPress={() => router.push(`/properties/${item.id}`)}
                    className="flex-row items-center gap-1.5"
                  >
                    <Ionicons name="open-outline" size={14} color="#059669" />
                    <Text className="text-emerald-700 font-black text-[10px] uppercase tracking-wide">View Page</Text>
                  </TouchableOpacity>

                  <View className="flex-row gap-4">
                    <TouchableOpacity
                      onPress={() => handleStatusToggle(item.id, item.status)}
                      className="flex-row items-center gap-1.5"
                    >
                      <Ionicons name="swap-horizontal" size={14} color="#3b82f6" />
                      <Text className="text-blue-650 font-black text-[10px] uppercase tracking-wide">
                        Mark {item.status === "AVAILABLE" ? "Sold" : "Available"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDeletePrompt(item.id)}
                      className="flex-row items-center gap-1.5"
                    >
                      <Ionicons name="trash-outline" size={14} color="#ef4444" />
                      <Text className="text-red-750 font-black text-[10px] uppercase tracking-wide">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
