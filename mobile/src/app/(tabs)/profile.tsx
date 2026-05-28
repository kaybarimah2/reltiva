import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

export default function ProfileScreen() {
  const { logout, updateUserLocal } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Profile Edit fields state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Agent Profile Edit fields
  const [bio, setBio] = useState("");
  const [agency, setAgency] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [yearsExp, setYearsExp] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  // Fetch full profile (with relations)
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await api.get("/api/profile");
      const user = res.data;
      
      // Initialize edit fields
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      if (user.role === "AGENT" && user.profile) {
        setBio(user.profile.bio || "");
        setAgency(user.profile.agency || "");
        setLicenseNumber(user.profile.licenseNumber || "");
        setYearsExp(String(user.profile.yearsExp || ""));
      }
      return user;
    },
  });

  // Profile Update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.patch("/api/profile", payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate query to get updated data
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      // Also update local AuthContext details
      updateUserLocal({
        name: variables.name,
        email: variables.email,
        phone: variables.phone,
      });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || "Failed to update profile";
      Alert.alert("Error", message);
    },
  });

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "Name and Email are required");
      return;
    }

    const payload: any = { name, email, phone };
    if (profileData?.role === "AGENT") {
      payload.bio = bio;
      payload.agency = agency;
      payload.licenseNumber = licenseNumber;
      payload.yearsExp = yearsExp ? parseInt(yearsExp) : undefined;
    }

    updateProfileMutation.mutate(payload);
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of Reltiva?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: logout },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  const isAgent = profileData?.role === "AGENT";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Profile Summary banner */}
        <View className="bg-emerald-600 px-6 pt-10 pb-16 rounded-b-[40px] items-center shadow-lg shadow-emerald-800/10 relative">
          <Image
            source={{ uri: profileData?.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150" }}
            className="h-24 w-24 rounded-full border-4 border-white shadow-md bg-gray-100"
            contentFit="cover"
          />
          <Text className="text-white text-xl font-black mt-4">{profileData?.name}</Text>
          <Text className="text-emerald-100 text-xs font-semibold mt-1">{profileData?.email}</Text>
          
          <View className="absolute top-4 right-4 bg-emerald-500 px-3 py-1 rounded-full border border-emerald-400">
            <Text className="text-white text-[9px] font-black uppercase tracking-wider">
              {profileData?.role}
            </Text>
          </View>
        </View>

        {/* Info & Edit Card */}
        <View className="px-6 -mt-8">
          <View className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-gray-900 text-base font-black">
                {isEditing ? "Edit Profile Info" : "Profile Details"}
              </Text>
              
              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                className="h-9 w-9 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100"
              >
                <Ionicons
                  name={isEditing ? "close-outline" : "create-outline"}
                  size={18}
                  color="#059669"
                />
              </TouchableOpacity>
            </View>

            {/* Editing Inputs Form */}
            <View className="space-y-4">
              <View className="text-left">
                <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                  Full Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  editable={isEditing}
                  placeholder="E.g. Kofi Mensah"
                  placeholderTextColor="#9ca3af"
                  className={`border rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-gray-50/50 ${
                    isEditing ? "border-emerald-600 bg-white" : "border-gray-200"
                  }`}
                />
              </View>

              <View className="text-left mt-4">
                <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                  Email Address
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  editable={isEditing}
                  keyboardType="email-address"
                  placeholder="E.g. kofi@reltiva.com"
                  placeholderTextColor="#9ca3af"
                  className={`border rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-gray-50/50 ${
                    isEditing ? "border-emerald-600 bg-white" : "border-gray-200"
                  }`}
                />
              </View>

              <View className="text-left mt-4">
                <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                  Phone Number
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  editable={isEditing}
                  keyboardType="phone-pad"
                  placeholder="E.g. +233 24 123 4567"
                  placeholderTextColor="#9ca3af"
                  className={`border rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-gray-50/50 ${
                    isEditing ? "border-emerald-600 bg-white" : "border-gray-200"
                  }`}
                />
              </View>

              {/* Agent Specific Fields */}
              {isAgent && (
                <>
                  <View className="text-left mt-4">
                    <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                      Bio
                    </Text>
                    <TextInput
                      value={bio}
                      onChangeText={setBio}
                      editable={isEditing}
                      multiline
                      numberOfLines={3}
                      placeholder="About yourself and properties specialization..."
                      placeholderTextColor="#9ca3af"
                      className={`border rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-gray-50/50 ${
                        isEditing ? "border-emerald-600 bg-white" : "border-gray-200"
                      }`}
                    />
                  </View>

                  <View className="text-left mt-4">
                    <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                      Agency Name
                    </Text>
                    <TextInput
                      value={agency}
                      onChangeText={setAgency}
                      editable={isEditing}
                      placeholder="E.g. Accra Luxury Homes"
                      placeholderTextColor="#9ca3af"
                      className={`border rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-gray-50/50 ${
                        isEditing ? "border-emerald-600 bg-white" : "border-gray-200"
                      }`}
                    />
                  </View>

                  <View className="flex-row gap-3 mt-4">
                    <View className="flex-1 text-left">
                      <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                        License Number
                      </Text>
                      <TextInput
                        value={licenseNumber}
                        onChangeText={setLicenseNumber}
                        editable={isEditing}
                        placeholder="E.g. RE-9824"
                        placeholderTextColor="#9ca3af"
                        className={`border rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-gray-50/50 ${
                          isEditing ? "border-emerald-600 bg-white" : "border-gray-200"
                        }`}
                      />
                    </View>
                    <View className="flex-1 text-left">
                      <Text className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                        Years Experience
                      </Text>
                      <TextInput
                        value={yearsExp}
                        onChangeText={setYearsExp}
                        editable={isEditing}
                        keyboardType="numeric"
                        placeholder="E.g. 5"
                        placeholderTextColor="#9ca3af"
                        className={`border rounded-2xl px-4 py-3 text-gray-800 text-sm font-semibold bg-gray-50/50 ${
                          isEditing ? "border-emerald-600 bg-white" : "border-gray-200"
                        }`}
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Save Button when Editing */}
              {isEditing && (
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="bg-emerald-600 rounded-2xl py-3.5 mt-6 items-center shadow-md shadow-emerald-600/20"
                >
                  {updateProfileMutation.isPending ? (
                    <ActivityIndicator size="small" color="#white" />
                  ) : (
                    <Text className="text-white font-extrabold text-sm uppercase tracking-wider">
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Dashboard Shortcut Buttons for Agents */}
        {isAgent && !isEditing && (
          <View className="px-6 mt-6">
            <TouchableOpacity
              onPress={() => router.push("/agent/overview")}
              className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3.5">
                <View className="h-10 w-10 bg-emerald-600 rounded-2xl items-center justify-center">
                  <Ionicons name="speedometer-outline" size={20} color="white" />
                </View>
                <View className="text-left">
                  <Text className="text-gray-900 font-extrabold text-sm">Agent Portal</Text>
                  <Text className="text-emerald-700 text-xs font-semibold mt-0.5">Manage listings, views, and enquiries</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#059669" />
            </TouchableOpacity>
          </View>
        )}

        {/* Log Out button block */}
        <View className="px-6 mt-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 border border-red-100 rounded-3xl p-5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3.5">
              <View className="h-10 w-10 bg-red-100 rounded-2xl items-center justify-center">
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              </View>
              <Text className="text-red-700 font-extrabold text-sm">Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
