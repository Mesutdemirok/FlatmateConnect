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

// ───────────────────────────────
// 🧠 Fetch all listings with fallback
// ───────────────────────────────
export function useListings() {
  return useQuery<Listing[]>({
    queryKey: ["listings"],
    queryFn: async () => {
      try {
        const { data } = await api.get<Listing[]>("/listings");

        // Add fallback image if missing
        const listingsWithImages = data.map((listing) => ({
          ...listing,
          images:
            listing.images && listing.images.length > 0
              ? listing.images
              : [
                  {
                    id: "fallback",
                    listingId: listing.id,
                    imageUrl: "https://odanet.com.tr/uploads/default-room.jpg",
                    order: 0,
                  },
                ],
        }));

        return listingsWithImages;
      } catch (error: any) {
        console.error("❌ Error fetching listings:", error.message);

        // Fallback demo listings for development
        return [
          {
            id: "demo-1",
            userId: "demo-user",
            title: "Kadın ev arkadaşı arıyorum",
            address: "Keçiören, Ankara",
            rentAmount: "5000",
            furnishingStatus: "Eşyalı",
            images: [
              {
                id: "fallback-1",
                listingId: "demo-1",
                imageUrl: "https://odanet.com.tr/uploads/default-room.jpg",
                order: 0,
              },
            ],
            createdAt: new Date().toISOString(),
          },
        ];
      }
    },
  });
}

// ───────────────────────────────
// 📍 Fetch single listing by ID
// ───────────────────────────────
export function useListing(id: string | undefined) {
  return useQuery<Listing>({
    queryKey: ["listing", id],
    queryFn: async () => {
      if (!id) throw new Error("Listing ID is required");

      const { data } = await api.get<Listing>(`/listings/${id}`);

      // Ensure it always has an image
      if (!data.images || data.images.length === 0) {
        data.images = [
          {
            id: "fallback",
            listingId: id,
            imageUrl: "https://odanet.com.tr/uploads/default-room.jpg",
            order: 0,
          },
        ];
      }

      return data;
    },
    enabled: !!id,
  });
}
