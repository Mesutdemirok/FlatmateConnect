import axios, { AxiosError } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { getApiUrl } from "../config"; // ✅ Correct relative import

/**
 * 🔧 Base API URL Configuration
 * Dynamically selects the proper API base for:
 * - Production (https://www.odanet.com.tr/api)
 * - Development (http://localhost:5000/api)
 * - Expo (via EXPO_PUBLIC_API_URL)
 */
const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants?.expoConfig?.extra?.apiBaseUrl ||
  getApiUrl("") ||
  "https://www.odanet.com.tr/api"; // ✅ Default fallback

export const API_BASE = apiUrl; // ✅ Exported constant for fetch calls

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
 * 🛡️ Request Interceptor — Adds Authorization if token exists
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
 * ⚙️ Response Interceptor — Handles expired sessions and offline errors
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // 🔐 Handle unauthorized (401)
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync("auth_token");
        console.log("🚫 Token expired or invalid — cleared from storage.");
      } catch (e) {
        console.error("Error clearing token:", e);
      }
    }

    // ⏳ Handle timeout or network issues
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      console.error("⏳ Request timed out. Check your network connection.");
    }

    // 🌐 Offline or unreachable API
    if (!error.response) {
      console.error("🌐 Network Error: Could not reach the API server.");
    }

    return Promise.reject(error);
  },
);

export default api;
