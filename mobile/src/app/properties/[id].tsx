import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking, TextInput, Alert, Dimensions, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [sendingEnquiry, setSendingEnquiry] = useState(false);

  // Fetch property details
  const { data: detailData, isLoading, refetch } = useQuery({
    queryKey: ["property-detail", id],
    queryFn: async () => {
      const res = await api.get(`/api/properties/${id}`);
      return res.data;
    },
  });

  // Toggle save mutation
  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/saved-properties", { propertyId: id });
      return res.data;
    },
    onSuccess: (data) => {
      // Invalidate queries to update saved state and saved feed
      queryClient.invalidateQueries({ queryKey: ["property-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["saved-properties"] });
      
      const savedText = data.saved ? "Property saved!" : "Property removed from saved.";
      Alert.alert("Success", savedText);
    },
  });

  const property = detailData?.property;

  const handleShare = async () => {
    if (!property) return;
    try {
      await Share.share({
        message: `Check out this property on Reltiva: ${property.title} in ${property.neighborhood}, ${property.city} - GHS ${property.price.toLocaleString()}`,
        url: `https://reltiva.com/properties/${property.id}`, // Fallback url
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCall = () => {
    if (!property?.agentPhone) return;
    Linking.openURL(`tel:${property.agentPhone}`).catch(() => {
      Alert.alert("Error", "Could not open dialer app");
    });
  };

  const handleWhatsApp = () => {
    if (!property?.agentPhone) return;
    
    // Clean phone number (remove +, spaces, leading zeros if national format, etc.)
    const cleanPhone = property.agentPhone.replace(/[^0-9]/g, "");
    const message = `Hello, I'm interested in your listing: "${property.title}" listed for GHS ${property.price.toLocaleString()} on Reltiva.`;
    
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`).catch(() => {
      Alert.alert("Error", "Could not open WhatsApp");
    });
  };

  const handleSendEnquiry = async () => {
    if (!enquiryMessage.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    setSendingEnquiry(true);
    try {
      await api.post("/api/enquiries", {
        propertyId: id,
        agentId: property.agentId,
        message: enquiryMessage,
      });

      Alert.alert("Enquiry Sent", "The agent has been notified and will get back to you shortly.");
      setEnquiryMessage("");
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
    } catch (error: any) {
      const errMsg = error.response?.data?.error || "Failed to send enquiry. Please make sure you are logged in.";
      Alert.alert("Error", errMsg);
    } finally {
      setSendingEnquiry(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-gray-900 font-black text-lg mt-4">Listing Not Found</Text>
        <Text className="text-gray-400 text-xs font-semibold text-center mt-2 leading-relaxed">
          The property listing you are trying to view does not exist or has been deleted.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-emerald-600 px-6 py-3 rounded-2xl shadow-sm"
        >
          <Text className="text-white font-extrabold text-xs uppercase tracking-wider">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600"];

  const formatPrice = (price: number) => {
    return `GHS ${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Top Image Carousel */}
        <View className="relative h-72 w-full bg-gray-100">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / width);
              if (slide !== activeImageIndex) {
                setActiveImageIndex(slide);
              }
            }}
            scrollEventThrottle={16}
          >
            {images.map((img: string, idx: number) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={{ width }}
                className="h-full"
                contentFit="cover"
              />
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          {images.length > 1 && (
            <View className="absolute bottom-4 flex-row w-full justify-center gap-1.5">
              {images.map((_: any, idx: number) => (
                <View
                  key={idx}
                  className={`h-1.5 rounded-full ${
                    idx === activeImageIndex ? "w-4 bg-emerald-600" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </View>
          )}

          {/* Absolute Top Floating Buttons */}
          <View className="absolute top-4 left-4 right-4 flex-row justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 bg-black/40 rounded-full items-center justify-center backdrop-blur-md"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleShare}
                className="h-10 w-10 bg-black/40 rounded-full items-center justify-center backdrop-blur-md"
              >
                <Ionicons name="share-social-outline" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleSaveMutation.mutate()}
                className="h-10 w-10 bg-black/40 rounded-full items-center justify-center backdrop-blur-md"
              >
                <Ionicons
                  name={property.isSaved ? "heart" : "heart-outline"}
                  size={20}
                  color={property.isSaved ? "#ef4444" : "white"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content Body */}
        <View className="px-6 pt-6 text-left">
          
          {/* Tag Badges */}
          <View className="flex-row gap-2">
            <View className="bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
              <Text className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                {property.listingType}
              </Text>
            </View>
            <View className="bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
              <Text className="text-[10px] font-black uppercase tracking-wider text-gray-700">
                {property.type}
              </Text>
            </View>
          </View>

          {/* Title & Price */}
          <Text className="text-gray-900 text-xl font-black mt-3 leading-snug">{property.title}</Text>
          <View className="flex-row justify-between items-baseline mt-2">
            <Text className="text-emerald-600 font-black text-2xl">
              {formatPrice(property.price)}
            </Text>
            {property.isNegotiable && (
              <Text className="text-gray-400 text-xs font-semibold">(Negotiable)</Text>
            )}
          </View>

          {/* Location */}
          <View className="flex-row items-center gap-1.5 mt-3">
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text className="text-gray-500 text-xs font-semibold">
              {property.address}, {property.neighborhood}, {property.city} ({property.region})
            </Text>
          </View>

          {/* Room specifications bar */}
          <View className="flex-row justify-between border-y border-gray-100 py-4 my-6">
            <View className="items-center flex-1">
              <Ionicons name="bed-outline" size={20} color="#059669" />
              <Text className="text-gray-950 font-black text-sm mt-1">{property.bedrooms}</Text>
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Bedrooms</Text>
            </View>
            <View className="items-center flex-1 border-x border-gray-100">
              <Ionicons name="water-outline" size={20} color="#059669" />
              <Text className="text-gray-950 font-black text-sm mt-1">{property.bathrooms}</Text>
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Bathrooms</Text>
            </View>
            {property.size ? (
              <View className="items-center flex-1">
                <Ionicons name="resize-outline" size={20} color="#059669" />
                <Text className="text-gray-950 font-black text-sm mt-1">{property.size} sqm</Text>
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Total Size</Text>
              </View>
            ) : (
              <View className="items-center flex-1">
                <Ionicons name="flower-outline" size={20} color="#059669" />
                <Text className="text-gray-950 font-black text-sm mt-1">{property.furnishing}</Text>
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Furnished</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-gray-950 font-black text-base mb-2">Description</Text>
            <Text className="text-gray-600 text-xs font-semibold leading-relaxed">
              {property.description}
            </Text>
          </View>

          {/* Amenities checklist */}
          {property.amenities && property.amenities.length > 0 && (
            <View className="mb-6">
              <Text className="text-gray-950 font-black text-base mb-3">Amenities</Text>
              <View className="flex-row flex-wrap gap-2">
                {property.amenities.map((am: string, index: number) => (
                  <View key={index} className="flex-row items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
                    <Ionicons name="checkmark-circle" size={14} color="#059669" />
                    <Text className="text-gray-700 text-xs font-bold">{am}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Agent Information Card */}
          <View className="bg-emerald-50/50 border border-emerald-100/50 rounded-3xl p-5 mb-8">
            <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-3">Listing Agent</Text>
            
            <View className="flex-row items-center gap-3.5">
              <Image
                source={{ uri: property.agentAvatar }}
                className="h-12 w-12 rounded-full border border-emerald-200 bg-gray-200"
                contentFit="cover"
              />
              <View className="flex-grow text-left">
                <Text className="text-gray-900 font-extrabold text-sm">{property.agentName}</Text>
                <Text className="text-emerald-700 text-xs font-semibold mt-0.5">{property.agentAgency}</Text>
              </View>
              <View className="items-end">
                <View className="flex-row items-center gap-0.5">
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text className="text-gray-800 text-xs font-black">{property.agentRating.toFixed(1)}</Text>
                </View>
                <Text className="text-gray-400 text-[9px] font-bold mt-0.5">{property.agentListingsCount} listings</Text>
              </View>
            </View>

            {/* Quick Contact buttons */}
            <View className="flex-row gap-3 mt-5">
              <TouchableOpacity
                onPress={handleCall}
                className="flex-1 bg-white border border-emerald-100 rounded-2xl py-3 flex-row items-center justify-center gap-2 shadow-sm"
              >
                <Ionicons name="call" size={16} color="#059669" />
                <Text className="text-emerald-700 font-black text-xs">Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleWhatsApp}
                className="flex-1 bg-[#25d366] rounded-2xl py-3 flex-row items-center justify-center gap-2 shadow-sm"
              >
                <Ionicons name="logo-whatsapp" size={16} color="white" />
                <Text className="text-white font-black text-xs">WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Buyer Enquiry Form */}
          <View className="border-t border-gray-100 pt-6">
            <Text className="text-gray-950 font-black text-base mb-1">Send Enquiry</Text>
            <Text className="text-gray-400 text-xs font-semibold mb-4 leading-relaxed">
              Have questions? Send a direct enquiry message to the listing agent.
            </Text>

            <TextInput
              value={enquiryMessage}
              onChangeText={setEnquiryMessage}
              multiline
              numberOfLines={4}
              placeholder="E.g. Hi! I'm interested in viewing this property next Saturday. Is it still available?"
              placeholderTextColor="#9ca3af"
              className="border border-gray-200 rounded-3xl px-4 py-3.5 text-gray-800 text-sm font-semibold bg-gray-50/50 mb-4 h-24"
            />

            <TouchableOpacity
              onPress={handleSendEnquiry}
              disabled={sendingEnquiry}
              className="bg-emerald-600 rounded-2xl py-3.5 items-center shadow-md shadow-emerald-600/20"
            >
              {sendingEnquiry ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-extrabold text-xs uppercase tracking-wider">
                  Submit Enquiry
                </Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
