import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"BUYER" | "AGENT">("BUYER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Name, email, and password are required fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        name,
        email,
        phone: phone || null,
        password,
        role,
      });
      // Auth routing handled in root layout
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-grow justify-center px-6 py-12">
          
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-black text-gray-900 tracking-tight">Create Account</Text>
            <Text className="text-sm font-semibold text-gray-500 mt-2">Get started with Reltiva Ghana</Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            
            {/* Error Message */}
            {error ? (
              <View className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg flex-row items-center gap-2">
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text className="text-red-700 text-xs font-semibold flex-1">{error}</Text>
              </View>
            ) : null}

            {/* Role Switcher */}
            <View>
              <Text className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Join As</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setRole("BUYER")}
                  className={`flex-1 py-3.5 border rounded-xl items-center ${
                    role === "BUYER"
                      ? "border-emerald-600 bg-emerald-50/50"
                      : "border-gray-200 bg-gray-50/20"
                  }`}
                >
                  <Text className={`font-bold text-sm ${role === "BUYER" ? "text-emerald-700" : "text-gray-600"}`}>
                    Buyer / Tenant
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setRole("AGENT")}
                  className={`flex-1 py-3.5 border rounded-xl items-center ${
                    role === "AGENT"
                      ? "border-emerald-600 bg-emerald-50/50"
                      : "border-gray-200 bg-gray-50/20"
                  }`}
                >
                  <Text className={`font-bold text-sm ${role === "AGENT" ? "text-emerald-700" : "text-gray-600"}`}>
                    Listing Agent
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Full Name */}
            <View className="mt-4">
              <Text className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl px-3 bg-gray-50/50">
                <Ionicons name="person-outline" size={20} color="#9ca3af" className="mr-2" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Kofi Mensah"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 py-3.5 text-gray-800 text-sm font-semibold"
                />
              </View>
            </View>

            {/* Email Address */}
            <View className="mt-4">
              <Text className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl px-3 bg-gray-50/50">
                <Ionicons name="mail-outline" size={20} color="#9ca3af" className="mr-2" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 py-3.5 text-gray-800 text-sm font-semibold"
                />
              </View>
            </View>

            {/* Phone Number */}
            <View className="mt-4">
              <Text className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl px-3 bg-gray-50/50">
                <Ionicons name="call-outline" size={20} color="#9ca3af" className="mr-2" />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+233 24 123 4567"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  className="flex-1 py-3.5 text-gray-800 text-sm font-semibold"
                />
              </View>
            </View>

            {/* Password */}
            <View className="mt-4">
              <Text className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl px-3 bg-gray-50/50">
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" className="mr-2" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  autoCapitalize="none"
                  className="flex-1 py-3.5 text-gray-800 text-sm font-semibold"
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="bg-emerald-600 py-4 rounded-xl items-center shadow-md shadow-emerald-600/10 mt-6"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-extrabold text-sm uppercase tracking-wider">Register</Text>
              )}
            </TouchableOpacity>

            {/* Redirect back to Login */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-xs font-semibold text-gray-500">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="text-xs font-bold text-emerald-600">Sign In</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
