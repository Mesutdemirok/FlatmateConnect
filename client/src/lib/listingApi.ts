import type { Listing, ListingImage, User } from "@shared/schema";

export interface ListingWithRelations extends Listing {
  images: ListingImage[];
  user: User;
}

export interface FavoriteStatus {
  isFavorite: boolean;
}
