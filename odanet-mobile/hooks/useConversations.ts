import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  };
}

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data } = await api.get<Conversation[]>("/conversations");
      return data;
    },
    retry: false,
  });
}
