import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import * as SecureStore from "expo-secure-store";

export interface User {
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

// Get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) return null;
      
      const { data } = await api.get<User>("/auth/me");
      return data;
    },
    retry: false,
  });
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post("/auth/login", credentials);
      if (data.token) {
        await SecureStore.setItemAsync("auth_token", data.token);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

// Register mutation
export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const { data } = await api.post("/auth/register", userData);
      if (data.token) {
        await SecureStore.setItemAsync("auth_token", data.token);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
      await SecureStore.deleteItemAsync("auth_token");
    },
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      queryClient.clear();
    },
  });
}
