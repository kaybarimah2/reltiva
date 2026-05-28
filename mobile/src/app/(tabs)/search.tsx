import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

const REGIONS = ["Greater Accra", "Ashanti", "Western", "Central", "Eastern", "Volta", "Northern"];
const TYPES = ["APARTMENT", "HOUSE", "LAND", "COMMERCIAL"];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Search/Filter states
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Pre-populate filter if redirected from home quick links
  useEffect(() => {
    if (params.type) {
      Promise.resolve().then(() => {
        setSelectedType(params.type as string);
      });
    }
  }, [params.type]);

  // React Query fetch properties based on current filters
  const { data: propertiesData, refetch, isLoading } = useQuery({
    queryKey: ["search-properties", selectedType, selectedRegion, minPrice, maxPrice, sortBy],
    queryFn: async () => {
      // Build query string params
      const qParams: Record<string, string> = {};
      if (selectedType) qParams.type = selectedType;
      if (selectedRegion) qParams.region = selectedRegion;
      if (minPrice) qParams.minPrice = minPrice;
      if (maxPrice) qParams.maxPrice = maxPrice;
      qParams.sort = sortBy;
      
      const queryString = new URLSearchParams(qParams).toString();
      const res = await api.get(`/api/properties?${queryString}`);
      return res.data;
    },
  });

  // Handle local text search filtering on top of DB queries
  const properties = propertiesData?.properties || [];
  const filteredProperties = properties.filter((p: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(s) ||
      p.neighborhood.toLowerCase().includes(s) ||
      p.city.toLowerCase().includes(s)
    );
  });

  const handleClearFilters = () => {
    setSelectedType(null);
    setSelectedRegion(null);
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
  };

  const formatPrice = (price: number) => {
    return `GHS ${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <View className="flex-1 bg-gray-50">
      
      {/* Top Search Input & Filter Button */}
      <View className="bg-white border-b border-gray-100 p-4 flex-row items-center gap-3">
        <View className="flex-grow flex-row items-center border border-gray-200 rounded-xl px-3 bg-gray-50/50">
          <Ionicons name="search" size={18} color="#9ca3af" className="mr-2" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search city, neighborhood..."
            placeholderTextColor="#9ca3af"
            className="flex-1 py-2 text-gray-800 text-sm font-semibold"
          />
        </View>

        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          className="h-10 w-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100"
        >
          <Ionicons name="options-outline" size={20} color="#059669" />
        </TouchableOpacity>
      </View>

      {/* List Feed */}
      {isLoading ? (
        <View className="flex-grow justify-center items-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : filteredProperties.length === 0 ? (
        <View className="flex-grow justify-center items-center px-10 text-center">
          <Ionicons name="search-outline" size={48} color="#d1d5db" />
          <Text className="text-gray-900 font-black text-base mt-4">No Properties Found</Text>
          <Text className="text-gray-400 text-xs font-semibold text-center mt-2 leading-relaxed">
            We couldn&apos;t find any properties matching your current filters. Try relaxing your budget or clearing filters.
          </Text>
          <TouchableOpacity
            onPress={handleClearFilters}
            className="mt-6 bg-emerald-600 px-6 py-3 rounded-xl shadow-sm"
          >
            <Text className="text-white font-extrabold text-xs uppercase tracking-wider">Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/properties/${item.id}`)}
              className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm mb-4"
            >
              <Image
                source={{ uri: item.images?.[0]?.url || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400" }}
                className="h-44 w-full"
                contentFit="cover"
              />

              <View className="p-4 space-y-2 text-left">
                <View className="flex-row justify-between items-start">
                  <Text className="text-gray-900 font-extrabold text-sm flex-1 leading-tight mr-2" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                    {item.type}
                  </Text>
                </View>

                <Text className="text-gray-400 text-xs font-bold leading-none">
                  {item.neighborhood}, {item.city} ({item.region})
                </Text>

                <View className="flex-row justify-between items-center pt-3 border-t border-gray-50 mt-1">
                  <Text className="text-emerald-600 font-black text-base">
                    {formatPrice(item.price)}
                  </Text>
                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="bed" size={14} color="#6b7280" />
                      <Text className="text-gray-500 text-xs font-bold">{item.bedrooms}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="water" size={14} color="#6b7280" />
                      <Text className="text-gray-500 text-xs font-bold">{item.bathrooms}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Filter Modal Sheet */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row justify-between items-center border-b border-gray-100 px-6 py-4">
            <TouchableOpacity onPress={handleClearFilters}>
              <Text className="text-gray-400 font-bold text-xs">Reset</Text>
            </TouchableOpacity>
            <Text className="text-gray-900 font-black text-base">Filter Search</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Text className="text-emerald-600 font-extrabold text-xs">Apply</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 py-4 space-y-6">
            
            {/* Property Types */}
            <View>
              <Text className="text-xs font-black text-gray-800 uppercase tracking-wider mb-3">Property Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setSelectedType(selectedType === t ? null : t)}
                    className={`px-4 py-2 border rounded-full ${
                      selectedType === t
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${selectedType === t ? "text-emerald-700" : "text-gray-500"}`}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Regions in Ghana */}
            <View className="mt-6">
              <Text className="text-xs font-black text-gray-800 uppercase tracking-wider mb-3">Region</Text>
              <View className="flex-row flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setSelectedRegion(selectedRegion === r ? null : r)}
                    className={`px-4 py-2 border rounded-full ${
                      selectedRegion === r
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${selectedRegion === r ? "text-emerald-700" : "text-gray-500"}`}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Ranges */}
            <View className="mt-6">
              <Text className="text-xs font-black text-gray-800 uppercase tracking-wider mb-3">Price Range (GHS)</Text>
              <View className="flex-row items-center gap-3">
                <TextInput
                  value={minPrice}
                  onChangeText={setMinPrice}
                  placeholder="Min Price"
                  keyboardType="numeric"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-gray-800 text-sm font-semibold bg-gray-50/50"
                />
                <Text className="text-gray-400 text-sm font-bold">to</Text>
                <TextInput
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholder="Max Price"
                  keyboardType="numeric"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-gray-800 text-sm font-semibold bg-gray-50/50"
                />
              </View>
            </View>

            {/* Sort Options */}
            <View className="mt-6 mb-10">
              <Text className="text-xs font-black text-gray-800 uppercase tracking-wider mb-3">Sort Results By</Text>
              <View className="space-y-2">
                {[
                  { label: "Newest Listings", value: "newest" },
                  { label: "Price: Low to High", value: "price-asc" },
                  { label: "Price: High to Low", value: "price-desc" },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setSortBy(opt.value)}
                    className="flex-row justify-between items-center py-3 border-b border-gray-50"
                  >
                    <Text className={`text-sm font-semibold ${sortBy === opt.value ? "text-emerald-600 font-extrabold" : "text-gray-600"}`}>
                      {opt.label}
                    </Text>
                    {sortBy === opt.value && (
                      <Ionicons name="checkmark" size={18} color="#059669" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}
