import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      // Auth routing handled in root layout
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
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
          
          {/* Logo & Header */}
          <View className="items-center mb-10">
            <View className="h-16 w-16 bg-emerald-50 rounded-2xl items-center justify-center mb-4">
              <Ionicons name="home" size={32} color="#059669" />
            </View>
            <Text className="text-3xl font-black text-gray-900 tracking-tight">RELTIVA</Text>
            <Text className="text-sm font-semibold text-gray-500 mt-2">Find affordable homes in Ghana</Text>
          </View>

          {/* Form Card */}
          <View className="space-y-4">
            
            {/* Error Message */}
            {error ? (
              <View className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg flex-row items-center gap-2">
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text className="text-red-700 text-xs font-semibold flex-1">{error}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View>
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

            {/* Password Input */}
            <View className="mt-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                  <Text className="text-xs font-bold text-emerald-600">Forgot Password?</Text>
                </TouchableOpacity>
              </View>
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
              onPress={handleLogin}
              disabled={loading}
              className="bg-emerald-600 py-4 rounded-xl items-center shadow-md shadow-emerald-600/10 mt-6"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-extrabold text-sm uppercase tracking-wider">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Redirect */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-xs font-semibold text-gray-500">Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text className="text-xs font-bold text-emerald-600">Register</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
