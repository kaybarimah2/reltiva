import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import api from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "BUYER" | "AGENT" | "ADMIN";
  phone: string | null;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUserLocal: (updatedFields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadStoredToken() {
      try {
        const storedToken = await SecureStore.getItemAsync("auth_token");
        if (storedToken) {
          setToken(storedToken);
          
          // Fetch current profile to verify token and load user details
          const response = await api.get("/api/profile", {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          
          if (response.data) {
            setUser(response.data);
          } else {
            await logout();
          }
        }
      } catch (error) {
        console.error("Auto login error:", error);
        await logout();
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredToken();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { token: jwtToken, user: userData } = res.data;

      await SecureStore.setItemAsync("auth_token", jwtToken);
      setToken(jwtToken);
      setUser(userData);

      return userData;
    } catch (error: any) {
      const message = error.response?.data?.error || "Invalid credentials";
      throw new Error(message);
    }
  };

  const register = async (payload: any): Promise<void> => {
    try {
      await api.post("/api/auth/register", payload);
      // Auto login upon successful registration
      await login(payload.email, payload.password);
    } catch (error: any) {
      const message = error.response?.data?.error || "Registration failed";
      throw new Error(message);
    }
  };

  async function logout() {
    try {
      await SecureStore.deleteItemAsync("auth_token");
      setToken(null);
      setUser(null);
      // Redirect to login screen
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const updateUserLocal = (updatedFields: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedFields });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUserLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
