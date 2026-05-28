import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleResetRequest = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      if (res.data.success) {
        setSuccess(true);
      } else {
        throw new Error(res.data.error || "Failed to request reset link");
      }
    } catch (err: any) {
      setError(err.message || err.response?.data?.error || "Failed to send reset link");
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
          
          {success ? (
            <View className="items-center space-y-6">
              <View className="h-20 w-20 bg-emerald-50 rounded-full items-center justify-center mb-2">
                <Ionicons name="checkmark-circle-outline" size={48} color="#059669" />
              </View>
              <Text className="text-2xl font-black text-gray-900 text-center">Check Your Email</Text>
              <Text className="text-sm font-semibold text-gray-500 text-center leading-relaxed">
                If an account exists for <Text className="font-bold text-gray-800">{email}</Text>, we have sent instructions to reset your password.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/login")}
                className="bg-emerald-600 py-3.5 px-8 rounded-xl items-center w-full mt-6 shadow-md shadow-emerald-600/10"
              >
                <Text className="text-white font-extrabold text-sm uppercase tracking-wider">Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* Header */}
              <View className="items-center mb-8">
                <Text className="text-2xl font-black text-gray-900 tracking-tight">Reset Password</Text>
                <Text className="text-sm font-semibold text-gray-500 mt-2 text-center leading-relaxed">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </Text>
              </View>

              {/* Form */}
              <View className="space-y-4">
                
                {/* Error Alert */}
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
                      placeholder="name@example.com"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      className="flex-1 py-3.5 text-gray-800 text-sm font-semibold"
                    />
                  </View>
                </View>

                {/* Submit button */}
                <TouchableOpacity
                  onPress={handleResetRequest}
                  disabled={loading}
                  className="bg-emerald-600 py-4 rounded-xl items-center shadow-md shadow-emerald-600/10 mt-6"
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white font-extrabold text-sm uppercase tracking-wider">Send Reset Link</Text>
                  )}
                </TouchableOpacity>

                {/* Redirect back to Login */}
                <View className="flex-row justify-center items-center mt-6">
                  <TouchableOpacity onPress={() => router.push("/(auth)/login")} className="flex-row items-center gap-1">
                    <Ionicons name="arrow-back" size={16} color="#059669" />
                    <Text className="text-xs font-bold text-emerald-600">Back to Sign In</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
