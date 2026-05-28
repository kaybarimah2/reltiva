import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

const REGIONS = ["Greater Accra", "Ashanti", "Western", "Central", "Eastern", "Volta", "Northern"];
const TYPES = ["APARTMENT", "HOUSE", "LAND", "COMMERCIAL"];
const AMENITIES = ["Wifi", "Parking", "Pool", "Security", "Furnished", "Air Conditioning", "Gym"];

const PHOTO_CATALOG = [
  { label: "Luxury Villa", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600" },
  { label: "Modern Condo", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600" },
  { label: "Cozy Penthouse", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600" },
  { label: "Suburban Bungalow", url: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600" },
];

export default function NewListingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);

  // Step 1: Basic details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [listingType, setListingType] = useState<"SALE" | "RENT">("SALE");
  const [propertyType, setPropertyType] = useState("HOUSE");

  // Step 2: Specs
  const [bedrooms, setBedrooms] = useState("0");
  const [bathrooms, setBathrooms] = useState("0");
  const [toilets, setToilets] = useState("0");
  const [size, setSize] = useState("");

  // Step 3: Location
  const [region, setRegion] = useState("Greater Accra");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");

  // Step 4: Amenities & Images
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([PHOTO_CATALOG[0].url]);
  const [customImageUrl, setCustomImageUrl] = useState("");

  const toggleAmenity = (name: string) => {
    setSelectedAmenities(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const selectCatalogImage = (url: string) => {
    setSelectedImages(prev =>
      prev.includes(url) ? prev.filter(img => img !== url) : [...prev, url]
    );
  };

  const addCustomImage = () => {
    if (!customImageUrl.trim()) return;
    if (!customImageUrl.startsWith("http://") && !customImageUrl.startsWith("https://")) {
      Alert.alert("Invalid URL", "Please enter a valid HTTP/HTTPS image URL");
      return;
    }
    setSelectedImages(prev => [...prev, customImageUrl.trim()]);
    setCustomImageUrl("");
  };

  const createListingMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/api/properties", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties-home"] });
      queryClient.invalidateQueries({ queryKey: ["search-properties"] });
      queryClient.invalidateQueries({ queryKey: ["agent-listings"] });
      queryClient.invalidateQueries({ queryKey: ["agent-overview-stats"] });
      Alert.alert("Success", "Listing published successfully!");
      router.replace("/agent/listings");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Failed to create listing";
      Alert.alert("Error", msg);
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !price.trim() || !city.trim() || !neighborhood.trim() || !address.trim()) {
      Alert.alert("Missing Fields", "Please make sure you have filled out all required inputs.");
      return;
    }

    const payload = {
      title,
      description,
      price: parseFloat(price),
      currency: "GHS",
      type: propertyType,
      listingType,
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseFloat(bathrooms) || 0,
      toilets: parseInt(toilets) || 0,
      size: size ? parseFloat(size) : null,
      region,
      city,
      neighborhood,
      address,
      amenities: selectedAmenities,
      images: selectedImages,
    };

    createListingMutation.mutate(payload);
  };

  const nextStep = () => {
    if (step === 1) {
      if (!title.trim() || !description.trim() || !price.trim()) {
        Alert.alert("Required Fields", "Please complete Title, Description, and Price.");
        return;
      }
    }
    if (step === 3) {
      if (!city.trim() || !neighborhood.trim() || !address.trim()) {
        Alert.alert("Required Fields", "Please complete City, Neighborhood, and Address.");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView className="flex-1 px-6 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Step Indicator */}
        <View className="flex-row justify-between items-center mb-8 px-2">
          {[1, 2, 3, 4].map((num) => (
            <View key={num} className="flex-row items-center flex-1">
              <View className={`h-8 w-8 rounded-full items-center justify-center border ${
                step >= num
                  ? "bg-emerald-600 border-emerald-600"
                  : "bg-white border-gray-200"
              }`}>
                {step > num ? (
                  <Ionicons name="checkmark" size={16} color="white" />
                ) : (
                  <Text className={`text-xs font-bold ${step >= num ? "text-white" : "text-gray-400"}`}>
                    {num}
                  </Text>
                )}
              </View>
              {num < 4 && (
                <View className={`flex-1 h-0.5 mx-2 ${step > num ? "bg-emerald-600" : "bg-gray-250"}`} />
              )}
            </View>
          ))}
        </View>

        {/* Step 1: Basic Details */}
        {step === 1 && (
          <View className="space-y-4">
            <Text className="text-gray-900 text-lg font-black mb-1 text-left">Property Details</Text>
            <Text className="text-gray-400 text-xs font-semibold mb-6 leading-relaxed text-left">
              Set the title, description, budget, and categorization of your listing.
            </Text>

            <View className="text-left">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                Listing Title *
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="E.g. Modern 3 Bedroom House in East Legon"
                placeholderTextColor="#9ca3af"
                className="border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-white"
              />
            </View>

            <View className="text-left mt-4">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                Description *
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholder="Details about construction, key highlights, local areas..."
                placeholderTextColor="#9ca3af"
                className="border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-white h-24"
              />
            </View>

            <View className="text-left mt-4">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                Price (GHS) *
              </Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="E.g. 350000"
                placeholderTextColor="#9ca3af"
                className="border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-white"
              />
            </View>

            <View className="flex-row gap-3 mt-4 text-left">
              <View className="flex-1">
                <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                  Listing Type
                </Text>
                <View className="flex-row border border-gray-200 rounded-2xl overflow-hidden bg-white">
                  <TouchableOpacity
                    onPress={() => setListingType("SALE")}
                    className={`flex-1 py-3 items-center ${listingType === "SALE" ? "bg-emerald-50" : ""}`}
                  >
                    <Text className={`text-xs font-bold ${listingType === "SALE" ? "text-emerald-700" : "text-gray-500"}`}>
                      SALE
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setListingType("RENT")}
                    className={`flex-1 py-3 items-center border-l border-gray-200 ${listingType === "RENT" ? "bg-emerald-50" : ""}`}
                  >
                    <Text className={`text-xs font-bold ${listingType === "RENT" ? "text-emerald-700" : "text-gray-500"}`}>
                      RENT
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View className="text-left mt-4">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                Property Type
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setPropertyType(t)}
                    className={`px-4 py-2.5 border rounded-full ${
                      propertyType === t
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${propertyType === t ? "text-emerald-700" : "text-gray-500"}`}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Step 2: Specs */}
        {step === 2 && (
          <View className="space-y-4">
            <Text className="text-gray-900 text-lg font-black mb-1 text-left">Rooms & Specifications</Text>
            <Text className="text-gray-400 text-xs font-semibold mb-6 leading-relaxed text-left">
              Specify layout counts. For Land, rooms can remain zero.
            </Text>

            <View className="text-left">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                Bedrooms Count
              </Text>
              <TextInput
                value={bedrooms}
                onChangeText={setBedrooms}
                keyboardType="numeric"
                className="border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-white"
              />
            </View>

            <View className="text-left mt-4">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                Bathrooms Count
              </Text>
              <TextInput
                value={bathrooms}
                onChangeText={setBathrooms}
                keyboardType="numeric"
                className="border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-white"
              />
            </View>

            <View className="text-left mt-4">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                Toilets Count
              </Text>
              <TextInput
                value={toilets}
                onChangeText={setToilets}
                keyboardType="numeric"
                className="border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-white"
              />
            </View>

            <View className="text-left mt-4">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                Property Size (sqm) - Optional
              </Text>
              <TextInput
                value={size}
                onChangeText={setSize}
                keyboardType="numeric"
                placeholder="E.g. 150"
                placeholderTextColor="#9ca3af"
                className="border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-white"
              />
            </View>
          </View>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <View className="space-y-4">
            <Text className="text-gray-900 text-lg font-black mb-1 text-left">Location Address</Text>
            <Text className="text-gray-400 text-xs font-semibold mb-6 leading-relaxed text-left">
              Help buyers locate your property by region, city, and street name.
            </Text>

            <View className="text-left">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                Region *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRegion(r)}
                    className={`px-3.5 py-2 border rounded-full ${
                      region === r
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${region === r ? "text-emerald-700" : "text-gray-500"}`}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="text-left mt-4">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                City / Town *
              </Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="E.g. Accra"
                placeholderTextColor="#9ca3af"
                className="border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-white"
              />
            </View>

            <View className="text-left mt-4">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                Neighborhood *
              </Text>
              <TextInput
                value={neighborhood}
                onChangeText={setNeighborhood}
                placeholder="E.g. East Legon"
                placeholderTextColor="#9ca3af"
                className="border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-white"
              />
            </View>

            <View className="text-left mt-4">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                Street Address *
              </Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="E.g. 14 Boundary Road"
                placeholderTextColor="#9ca3af"
                className="border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-white"
              />
            </View>
          </View>
        )}

        {/* Step 4: Amenities & Images */}
        {step === 4 && (
          <View className="space-y-4">
            <Text className="text-gray-900 text-lg font-black mb-1 text-left">Amenities & Photos</Text>
            <Text className="text-gray-400 text-xs font-semibold mb-6 leading-relaxed text-left">
              Select available amenities and pick high quality listing photos.
            </Text>

            {/* Amenities Grid */}
            <View className="text-left">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-3">
                Select Amenities
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {AMENITIES.map((am) => {
                  const isSelected = selectedAmenities.includes(am);
                  return (
                    <TouchableOpacity
                      key={am}
                      onPress={() => toggleAmenity(am)}
                      className={`px-3.5 py-2 border rounded-full flex-row items-center gap-1.5 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <Ionicons
                        name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                        size={14}
                        color={isSelected ? "#059669" : "#9ca3af"}
                      />
                      <Text className={`text-xs font-bold ${isSelected ? "text-emerald-700" : "text-gray-500"}`}>
                        {am}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Images Catalog Selection */}
            <View className="text-left mt-6">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-3">
                Choose Listing Photos ({selectedImages.length} selected)
              </Text>
              <View className="flex-row gap-3 mb-4">
                {PHOTO_CATALOG.map((cat, idx) => {
                  const isSelected = selectedImages.includes(cat.url);
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => selectCatalogImage(cat.url)}
                      className="relative rounded-2xl overflow-hidden border border-gray-200"
                    >
                      <Image
                        source={{ uri: cat.url }}
                        className="h-16 w-16 bg-gray-155"
                        contentFit="cover"
                      />
                      {isSelected && (
                        <View className="absolute inset-0 bg-emerald-600/40 items-center justify-center">
                          <Ionicons name="checkmark-circle" size={20} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Custom Image URL input */}
            <View className="text-left mt-2">
              <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                Or Paste Image Link
              </Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={customImageUrl}
                  onChangeText={setCustomImageUrl}
                  placeholder="https://example.com/property.jpg"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 text-gray-800 text-xs font-semibold bg-white"
                />
                <TouchableOpacity
                  onPress={addCustomImage}
                  className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 justify-center"
                >
                  <Text className="text-emerald-700 font-extrabold text-xs">Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Action Button Navigation Rows */}
        <View className="flex-row gap-4 mt-10">
          {step > 1 && (
            <TouchableOpacity
              onPress={prevStep}
              className="flex-1 border border-emerald-600 rounded-2xl py-3.5 items-center bg-white"
            >
              <Text className="text-emerald-700 font-extrabold text-xs uppercase tracking-wider">
                Back
              </Text>
            </TouchableOpacity>
          )}

          {step < 4 ? (
            <TouchableOpacity
              onPress={nextStep}
              className="flex-1 bg-emerald-600 rounded-2xl py-3.5 items-center shadow-md shadow-emerald-600/20"
            >
              <Text className="text-white font-extrabold text-xs uppercase tracking-wider">
                Continue
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={createListingMutation.isPending}
              className="flex-1 bg-emerald-600 rounded-2xl py-3.5 items-center shadow-md shadow-emerald-600/20"
            >
              {createListingMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-extrabold text-xs uppercase tracking-wider">
                  Publish Listing
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
