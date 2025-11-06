import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Listing {
  id: string;
  title: string;
  address: string;
  rentAmount: string;
  propertyType: string;
  totalRooms: number;
  furnishingStatus: string;
  createdAt: string;
  userId: string;
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
