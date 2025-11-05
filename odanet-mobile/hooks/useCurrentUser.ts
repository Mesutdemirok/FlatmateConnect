import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  phone?: string;
  bio?: string;
  verificationStatus: string;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get<User>("/auth/me");
      return data;
    },
    retry: false,
  });
}
