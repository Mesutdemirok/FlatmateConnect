import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Seeker {
  id: string;
  userId: string;
  slug?: string;
  title: string;
  age?: number;
  gender?: "erkek" | "kadin" | "diger";
  occupation?: string;
  budget?: string;
  preferredAreas?: string[];
  bio?: string;
  moveInDate?: string;
  stayDuration?: string;
  smokingPreference?: string;
  petPreference?: string;
  cleanlinessLevel?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

/**
 * 🔍 Fetch all room seekers
 */
export function useSeekers() {
  return useQuery<Seeker[]>({
    queryKey: ["/api/seekers"],
    queryFn: async () => {
      try {
        console.log("📡 Fetching seekers from /seekers...");
        const { data } = await api.get<Seeker[]>("/seekers");
        
        if (!data || data.length === 0) {
          console.log("⚠️ No seekers returned from API");
          return [];
        }
        
        console.log("✅ Seekers fetched:", data.length, "seekers");
        return data;
      } catch (error: any) {
        console.error("❌ SEEKER FETCH ERROR:", error.response?.data || error.message);
        return [];
      }
    },
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });
}

/**
 * 📍 Fetch a single seeker by ID
 */
export function useSeeker(id: string | undefined) {
  return useQuery<Seeker>({
    queryKey: ["/api/seekers", id],
    queryFn: async () => {
      if (!id) throw new Error("Seeker ID is required");
      const { data } = await api.get<Seeker>(`/seekers/${id}`);
      return data;
    },
    enabled: !!id && id !== "",
    retry: false,
  });
}
