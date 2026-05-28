import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

export default function SavedScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch saved properties with details
  const { data: savedData, refetch, isLoading } = useQuery({
    queryKey: ["saved-properties"],
    queryFn: async () => {
      const res = await api.get("/api/saved-properties?details=true");
      return res.data;
    },
  });

  // Toggle save mutation
  const toggleSaveMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const res = await api.post("/api/saved-properties", { propertyId });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate saved properties query to refresh list
      queryClient.invalidateQueries({ queryKey: ["saved-properties"] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const properties = savedData?.properties || [];

  const formatPrice = (price: number) => {
    return `GHS ${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const handleRemoveSave = (id: string) => {
    toggleSaveMutation.mutate(id);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : properties.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8 text-center">
          <View className="h-16 w-16 bg-emerald-50 rounded-full items-center justify-center mb-4">
            <Ionicons name="heart-outline" size={32} color="#059669" />
          </View>
          <Text className="text-gray-900 font-black text-lg">No Saved Homes</Text>
          <Text className="text-gray-400 text-xs font-semibold text-center mt-2 leading-relaxed">
            Tap the heart icon on any listing details page to save it here for quick access later.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/search")}
            className="mt-6 bg-emerald-600 px-6 py-3 rounded-2xl shadow-sm"
          >
            <Text className="text-white font-extrabold text-xs uppercase tracking-wider">Explore Listings</Text>
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
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/properties/${item.id}`)}
              className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm mb-4 flex-row h-28 relative"
            >
              <Image
                source={{ uri: item.image }}
                className="h-full w-28"
                contentFit="cover"
              />

              <View className="flex-1 p-3.5 justify-between text-left pr-10">
                <View>
                  <Text className="text-gray-900 font-black text-xs leading-tight" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="text-gray-400 text-[10px] font-bold mt-1" numberOfLines={1}>
                    {item.neighborhood}, {item.city}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-emerald-600 font-black text-sm">
                    {formatPrice(item.price)}
                  </Text>

                  <View className="flex-row items-center gap-2">
                    <View className="flex-row items-center gap-0.5">
                      <Ionicons name="bed" size={12} color="#9ca3af" />
                      <Text className="text-gray-500 text-[10px] font-bold">{item.bedrooms}</Text>
                    </View>
                    <View className="flex-row items-center gap-0.5">
                      <Ionicons name="water" size={12} color="#9ca3af" />
                      <Text className="text-gray-500 text-[10px] font-bold">{item.bathrooms}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Delete / Remove Save Button */}
              <TouchableOpacity
                onPress={() => handleRemoveSave(item.id)}
                className="absolute top-2.5 right-2.5 h-8 w-8 bg-red-50 rounded-full items-center justify-center"
              >
                <Ionicons name="heart" size={18} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
