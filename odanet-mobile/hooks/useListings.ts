import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

/**
 * Listing and Image Interfaces
 */
export interface ListingImage {
  id: string;
  listingId: string;
  imagePath: string;
  isPrimary?: boolean;
  createdAt?: string;
}

export interface Listing {
  id: string;
  userId: string;
  slug?: string;
  title: string;
  address: string;
  rentAmount: string;
  billsIncluded?: boolean;
  excludedBills?: string[];
  propertyType?: string;
  internetIncluded?: boolean;
  totalRooms?: number;
  bathroomType?: string;
  furnishingStatus?: string;
  amenities?: string[];
  totalOccupants?: number;
  roommatePreference?: string;
  smokingPolicy?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  images?: ListingImage[];
}

/**
 * 🏠 Fetch all listings
 */
export function useListings() {
  return useQuery<Listing[]>({
    queryKey: ["listings"],
    queryFn: async () => {
      try {
        console.log("📡 Fetching listings from /listings...");
        const { data } = await api.get<Listing[]>("/listings");
        console.log("✅ Listings fetched:", data?.length || 0, "listings");
        
        if (!data || data.length === 0) {
          console.log("⚠️ No listings returned from API");
          return [];
        }
        
        // Images already come with full CDN URLs from the API
        console.log("✅ First listing:", data[0]?.title);
        console.log("✅ First image:", data[0]?.images?.[0]?.imagePath);
        return data;
      } catch (error: any) {
        console.error("❌ LISTING FETCH ERROR:", error.response?.data || error.message);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });
}

/**
 * 📍 Fetch a single listing by ID
 */
export function useListing(id: string | undefined) {
  return useQuery<Listing>({
    queryKey: ["listing", id],
    queryFn: async () => {
      if (!id) throw new Error("Listing ID is required");
      const { data } = await api.get<Listing>(`/listings/${id}`);
      
      // Images already come with full CDN URLs from the API
      return data;
    },
    enabled: !!id && id !== "",
    retry: false,
  });
}
