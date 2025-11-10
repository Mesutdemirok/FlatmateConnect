import axios, { AxiosError } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { getApiUrl } from "../../config";

/**
 * 🔧 Base API URL Configuration
 * Uses centralized config.ts for consistency across platforms
 */
const apiUrl = Constants?.expoConfig?.extra?.apiBaseUrl || getApiUrl("");

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

console.log("🚀 Odanet API Connected:", api.defaults.baseURL);

/**
 * 🛡️ Request Interceptor — Attaches Authorization header if token exists.
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("⚠️ Failed to retrieve auth token:", error);
    }
    return config;
  },
  (error) => {
    console.error("❌ Request config error:", error);
    return Promise.reject(error);
  },
);

/**
 * ⚙️ Response Interceptor — Handles expired sessions and network issues.
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle unauthorized (401)
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync("auth_token");
        console.log("🚫 Token expired or invalid — cleared from storage.");
      } catch (e) {
        console.error("Error clearing token:", e);
      }
    }

    // Handle timeouts or server unavailability
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      console.error("⏳ Request timed out. Check your network connection.");
    }

    if (!error.response) {
      console.error("🌐 Network Error: Could not reach the API server.");
    }

    return Promise.reject(error);
  },
);

export default api;
