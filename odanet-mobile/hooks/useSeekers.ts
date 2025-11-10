import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { getApiUrl } from "../config";

/**
 * 🧭 useSeekers Hook
 * Fetches all active and published room seekers from Odanet API.
 * Compatible with both web + mobile unified feeds.
 */
export function useSeekers() {
  return useQuery({
    queryKey: ["seekers"],
    queryFn: async () => {
      try {
        // 1️⃣ Construct full API URL
        const url = getApiUrl("/seekers/public");
        console.log("📡 Fetching seekers from:", url);

        // 2️⃣ Fetch using shared Axios instance
        const response = await api.get(url, { timeout: 10000 });

        // 3️⃣ Normalize data structure (handles both object + array API responses)
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.seekers || [];

        // 4️⃣ Filter to only published + active seekers
        const filtered = data.filter((s: any) => s.isActive && s.isPublished);

        console.log(`✅ Seekers fetched: ${filtered.length} profiles`);
        return filtered;
      } catch (error: any) {
        console.error("❌ Seekers fetch failed:", error.message || error);
        if (error.message?.includes("Network Error")) {
          console.warn(
            "🌐 Network issue — API might be unreachable via Expo tunnel.",
          );
        }
        return [];
      }
    },

    // Cache and retry policies
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Retry once on failure
    refetchOnWindowFocus: false,
  });
}
