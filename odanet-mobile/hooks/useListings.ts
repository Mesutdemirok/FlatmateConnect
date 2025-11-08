import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

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

export function useListings() {
  return useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data } = await api.get<Listing[]>("/listings");
      return data;
    },
  });
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      if (!id) throw new Error("Listing ID is required");
      const { data } = await api.get<Listing>(`/listings/${id}`);
      return data;
    },
    enabled: !!id && id !== "",
  });
}
