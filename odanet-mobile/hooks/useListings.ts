import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface ListingFilter {
  cityId?: number;
  minPrice?: number;
  maxPrice?: number;
  furnished?: boolean;
  genderPref?: "any" | "male" | "female";
  availableFrom?: string;
  q?: string;
  page?: number;
  sort?: "new" | "price_asc" | "price_desc";
}

export function useListings(filter: ListingFilter = {}) {
  return useQuery({
    queryKey: ["listings", filter],
    queryFn: async () => {
      const { data } = await api.get("/listings", { params: filter });
      return data;
    },
    staleTime: 30 * 1000,
  });
}
