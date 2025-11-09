import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import * as SecureStore from "expo-secure-store";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync("auth_token");
        if (token) {
          api.defaults.headers.Authorization = `Bearer ${token}`;
          const { data } = await api.get<User>("/auth/me");
          setUser(data);
        }
      } catch (err: any) {
        console.log("Error loading user:", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // Login
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", credentials);
      if (data.token) {
        await SecureStore.setItemAsync("auth_token", data.token);
        api.defaults.headers.Authorization = `Bearer ${data.token}`;
        const me = await api.get<User>("/auth/me");
        setUser(me.data);
      }
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/register", userData);
      if (data.token) {
        await SecureStore.setItemAsync("auth_token", data.token);
        api.defaults.headers.Authorization = `Bearer ${data.token}`;
        const me = await api.get<User>("/auth/me");
        setUser(me.data);
      }
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    } catch (err) {
      console.error("Registration failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore if API fails
    }
    await SecureStore.deleteItemAsync("auth_token");
    setUser(null);
    queryClient.clear();
  };

  return { user, isLoading, login, register, logout };
}
