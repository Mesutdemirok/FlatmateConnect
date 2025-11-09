import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Seeker {
  id: string;
  userId: string;
  name: string;
  age?: number;
  budget?: number;
  city?: string;
  description?: string;
  image?: string;
  status?: string;
  createdAt: string;
}

/**
 * 🔍 Fetch all room seekers
 */
export function useSeekers() {
  return useQuery<Seeker[]>({
    queryKey: ["seekers"],
    queryFn: async () => {
      const { data } = await api.get<Seeker[]>("/seekers");
      
      // Normalize image URLs
      return data.map((seeker) => ({
        ...seeker,
        image: seeker.image?.startsWith("http")
          ? seeker.image
          : seeker.image
          ? `https://www.odanet.com.tr${seeker.image}`
          : "https://www.odanet.com.tr/uploads/default-user.jpg",
      }));
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
    queryKey: ["seeker", id],
    queryFn: async () => {
      if (!id) throw new Error("Seeker ID is required");
      const { data } = await api.get<Seeker>(`/seekers/${id}`);
      
      return {
        ...data,
        image: data.image?.startsWith("http")
          ? data.image
          : data.image
          ? `https://www.odanet.com.tr${data.image}`
          : "https://www.odanet.com.tr/uploads/default-user.jpg",
      };
    },
    enabled: !!id && id !== "",
    retry: false,
  });
}
