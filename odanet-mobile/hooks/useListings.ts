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
      try {
        const { data } = await api.get<Listing[]>("/listings");

        // 🔄 Add fallback image if missing
        return data.map((listing) => ({
          ...listing,
          images:
            listing.images && listing.images.length > 0
              ? listing.images
              : [
                  {
                    id: "fallback-" + listing.id,
                    listingId: listing.id,
                    imageUrl:
                      "https://www.odanet.com.tr/uploads/default-room.jpg",
                    order: 0,
                  },
                ],
        }));
      } catch (err: any) {
        console.error("❌ Failed to fetch listings:", err.message);

        // 🧩 Offline or API-fail fallback (for testing in Expo)
        return [
          {
            id: "demo-1",
            userId: "demo",
            title: "Kadın ev arkadaşı arıyorum",
            address: "Keçiören, Ankara",
            rentAmount: "5000",
            furnishingStatus: "Eşyalı",
            createdAt: new Date().toISOString(),
            images: [
              {
                id: "demo-img-1",
                listingId: "demo-1",
                imageUrl: "https://www.odanet.com.tr/uploads/default-room.jpg",
                order: 0,
              },
            ],
          },
        ];
      }
    },
    staleTime: 1000 * 60 * 3, // Cache for 3 minutes
    retry: 1, // Only retry once if offline
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

      // Add fallback image if missing
      if (!data.images || data.images.length === 0) {
        data.images = [
          {
            id: "fallback-" + id,
            listingId: id,
            imageUrl: "https://www.odanet.com.tr/uploads/default-room.jpg",
            order: 0,
          },
        ];
      }

      return data;
    },
    enabled: !!id && id !== "",
    retry: false,
  });
}
