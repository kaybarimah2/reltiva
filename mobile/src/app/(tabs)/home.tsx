import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, TextInput, RefreshControl, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");

const CATEGORIES = [
  { label: "Apartment", icon: "business", value: "APARTMENT" },
  { label: "House", icon: "home", value: "HOUSE" },
  { label: "Land", icon: "leaf", value: "LAND" },
  { label: "Commercial", icon: "briefcase", value: "COMMERCIAL" },
];

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch properties using React Query
  const { data: propertiesData, refetch, isLoading } = useQuery({
    queryKey: ["properties-home"],
    queryFn: async () => {
      const res = await api.get("/api/properties");
      return res.data;
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const properties = propertiesData?.properties || [];
  const featuredProperties = properties.filter((p: any) => p.featured === true).slice(0, 5);
  const recentProperties = properties.slice(0, 6);

  const formatPrice = (price: number) => {
    return `GHS ${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />
      }
    >
      <View className="pb-10">
        
        {/* Search Header Banner */}
        <View className="bg-emerald-600 px-6 pt-4 pb-8 rounded-b-[36px] shadow-lg shadow-emerald-800/10">
          <Text className="text-white text-lg font-bold">Find your next home in</Text>
          <Text className="text-white text-3xl font-black mt-1">Ghana 🇬🇭</Text>
          
          {/* Fake Search Input (Tapping redirects to Search Tab) */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/search")}
            className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 mt-6 shadow-sm"
          >
            <Ionicons name="search" size={20} color="#9ca3af" className="mr-2" />
            <Text className="text-gray-400 text-sm font-semibold flex-1">Search location, neighborhood...</Text>
            <Ionicons name="options-outline" size={20} color="#059669" />
          </TouchableOpacity>
        </View>

        {/* Quick Links Categories Grid */}
        <View className="px-6 mt-8">
          <Text className="text-gray-900 text-base font-black mb-4">Property Categories</Text>
          <View className="flex-row justify-between">
            {CATEGORIES.map((cat, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => router.push({ pathname: "/(tabs)/search", params: { type: cat.value } })}
                className="items-center"
              >
                <View className="h-14 w-14 bg-white border border-gray-100 rounded-2xl items-center justify-center shadow-sm mb-2">
                  <Ionicons name={cat.icon as any} size={22} color="#059669" />
                </View>
                <Text className="text-gray-700 text-xs font-bold">{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Horizontal Featured Listings */}
        {featuredProperties.length > 0 && (
          <View className="mt-8">
            <View className="flex-row justify-between items-center px-6 mb-4">
              <Text className="text-gray-900 text-base font-black">Featured Listings</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
                <Text className="text-emerald-600 text-xs font-bold">See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
            >
              {featuredProperties.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(`/properties/${item.id}`)}
                  className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm mr-4 w-[280px]"
                >
                  <Image
                    source={{ uri: item.images?.[0]?.url || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400" }}
                    className="h-40 w-full"
                    contentFit="cover"
                  />
                  
                  {/* Absolute Badge */}
                  <View className="absolute top-3 left-3 bg-emerald-600 px-3 py-1 rounded-full shadow">
                    <Text className="text-white text-[9px] font-black uppercase tracking-wider">
                      {item.listingType}
                    </Text>
                  </View>

                  <View className="p-4 space-y-2 text-left">
                    <Text className="text-gray-900 font-extrabold text-sm leading-tight" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text className="text-gray-400 text-xs font-bold leading-none" numberOfLines={1}>
                      {item.neighborhood}, {item.city}
                    </Text>
                    <View className="flex-row justify-between items-center pt-2 border-t border-gray-50">
                      <Text className="text-emerald-600 font-black text-base">
                        {formatPrice(item.price)}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="bed" size={14} color="#6b7280" />
                        <Text className="text-gray-500 text-xs font-bold">{item.bedrooms}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Vertical Feed of Recent Properties */}
        <View className="px-6 mt-8">
          <Text className="text-gray-900 text-base font-black mb-4">Recently Listed</Text>
          
          {isLoading ? (
            <View className="items-center py-10">
              <Text className="text-gray-400 text-xs font-semibold">Loading listings...</Text>
            </View>
          ) : recentProperties.length === 0 ? (
            <View className="items-center py-10 bg-white border border-gray-100 rounded-3xl p-6">
              <Ionicons name="folder-open-outline" size={32} color="#9ca3af" />
              <Text className="text-gray-400 text-xs font-semibold mt-2">No listings available at the moment</Text>
            </View>
          ) : (
            <View className="space-y-4">
              {recentProperties.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(`/properties/${item.id}`)}
                  className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex-row h-28"
                >
                  <Image
                    source={{ uri: item.images?.[0]?.url || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400" }}
                    className="h-full w-28"
                    contentFit="cover"
                  />
                  
                  <View className="flex-1 p-3.5 justify-between text-left">
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
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

      </View>
    </ScrollView>
  );
}
