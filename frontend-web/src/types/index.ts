export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  bio?: string;
  profilePictureUrl?: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  city: string;
  district?: string;
  neighborhood?: string;
  address?: string;
  rentAmount: number;
  propertyType?: string;
  totalRooms?: number;
  bathroomType?: string;
  totalOccupants?: number;
  roommatePreference?: string;
  furnishingStatus?: string;
  images?: string[];
  description?: string;
  availableFrom?: string;
  createdAt: string;
  updatedAt?: string;
  user?: User;
}

export interface FeedItem {
  type: 'listing' | 'seeker';
  id: string;
  slug: string;
  title?: string;
  displayName?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  rentAmount?: number;
  budgetMonthly?: number;
  propertyType?: string;
  totalRooms?: number;
  bathroomType?: string;
  totalOccupants?: number;
  roommatePreference?: string;
  furnishingStatus?: string;
  images?: string[];
  photoUrl?: string;
  age?: number;
  occupation?: string;
  preferredLocation?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
