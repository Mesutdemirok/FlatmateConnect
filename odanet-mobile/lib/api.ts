import axios from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const apiUrl = Constants.expoConfig?.extra?.apiUrl || "https://www.odanet.com.tr/api";

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token
      try {
        await SecureStore.deleteItemAsync("auth_token");
        console.log("Unauthorized: Token cleared. Please login again.");
      } catch (e) {
        console.error("Error clearing auth token:", e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
