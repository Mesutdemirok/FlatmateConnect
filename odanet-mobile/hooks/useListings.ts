import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

/**
 * Listing and Image Interfaces
 */
export interface ListingImage {
  id: string;
  listingId: string;
  imageUrl: string;
  order: number;
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
      const { data } = await api.get<Listing[]>("/listings");
      
      // Normalize image URLs
      return data.map((listing) => ({
        ...listing,
        images: listing.images?.map((img) => ({
          ...img,
          imageUrl: img.imageUrl.startsWith("http")
            ? img.imageUrl
            : `https://www.odanet.com.tr${img.imageUrl}`,
        })),
      }));
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
      
      return {
        ...data,
        images: data.images?.map((img) => ({
          ...img,
          imageUrl: img.imageUrl.startsWith("http")
            ? img.imageUrl
            : `https://www.odanet.com.tr${img.imageUrl}`,
        })),
      };
    },
    enabled: !!id && id !== "",
    retry: false,
  });
}
