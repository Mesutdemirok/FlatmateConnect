import { SeekerProfile, SeekerPhoto } from "@/../../shared/schema";

export interface SeekerProfileWithRelations extends SeekerProfile {
  photos: SeekerPhoto[];
  user?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    name?: string;
    profileImageUrl?: string | null;
  };
}

export async function fetchFeaturedSeekers(count: number = 4): Promise<SeekerProfileWithRelations[]> {
  const response = await fetch(`/api/seekers/featured?count=${count}`);
  if (!response.ok) {
    throw new Error('Failed to fetch featured seekers');
  }
  return response.json();
}

export async function fetchSeekers(filters?: {
  minBudget?: number;
  maxBudget?: number;
  gender?: string;
  location?: string;
}): Promise<SeekerProfileWithRelations[]> {
  const params = new URLSearchParams();
  if (filters?.minBudget) params.append('minBudget', filters.minBudget.toString());
  if (filters?.maxBudget) params.append('maxBudget', filters.maxBudget.toString());
  if (filters?.gender) params.append('gender', filters.gender);
  if (filters?.location) params.append('location', filters.location);

  const response = await fetch(`/api/seekers?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch seekers');
  }
  return response.json();
}

export async function fetchSeeker(id: string): Promise<SeekerProfileWithRelations> {
  const response = await fetch(`/api/seekers/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch seeker');
  }
  return response.json();
}
