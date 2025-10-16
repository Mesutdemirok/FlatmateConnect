import {
  users,
  listings,
  listingImages,
  userPreferences,
  messages,
  favorites,
  seekerProfiles,
  seekerPhotos,
  type User,
  type UpsertUser,
  type Listing,
  type InsertListing,
  type ListingImage,
  type InsertListingImage,
  type UserPreferences,
  type InsertUserPreferences,
  type Message,
  type InsertMessage,
  type Favorite,
  type InsertFavorite,
  type SeekerProfile,
  type InsertSeekerProfile,
  type SeekerPhoto,
  type InsertSeekerPhoto,
} from "@shared/schema";

import { db } from "./db";
import { eq, and, or, ilike, gte, lte, desc, asc } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { log } from "./vite";

// ⚙️ Cloudflare R2 Setup
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME!;
const LOCAL_UPLOADS = path.join(process.cwd(), "uploads");

// Helper: get image URL for production or local
function getImageUrl(relativePath: string): string {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (process.env.NODE_ENV === "production" && publicUrl) {
    // Use R2 bucket public URL
    return `${publicUrl}/${relativePath.replace(/^\/+/, "")}`;
  } else {
    // Use local /uploads path
    return `/uploads/${relativePath.replace(/^\/+/, "")}`;
  }
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Listing operations
  getListings(filters?: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    availableFrom?: string;
    suburb?: string;
    city?: string;
    postcode?: string;
    roomType?: string;
    propertyType?: string;
    furnished?: boolean;
    billsIncluded?: boolean;
    parkingAvailable?: boolean;
    internetIncluded?: boolean;
  }): Promise<(Listing & { images: ListingImage[]; user: User })[]>;
  getListing(
    id: string,
  ): Promise<(Listing & { images: ListingImage[]; user: User }) | undefined>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: string, listing: Partial<InsertListing>): Promise<Listing>;
  deleteListing(id: string): Promise<void>;
  getUserListings(
    userId: string,
  ): Promise<(Listing & { images: ListingImage[] })[]>;

  // Listing images
  addListingImage(image: InsertListingImage): Promise<ListingImage>;
  getListingImages(listingId: string): Promise<ListingImage[]>;
  deleteListingImage(id: string): Promise<void>;
  setPrimaryImage(listingId: string, imageId: string): Promise<void>;

  // User preferences
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(
    preferences: InsertUserPreferences,
  ): Promise<UserPreferences>;

  // Messages
  getConversations(
    userId: string,
  ): Promise<{ user: User; lastMessage: Message; unreadCount: number }[]>;
  getMessages(
    userId1: string,
    userId2: string,
    listingId?: string,
  ): Promise<(Message & { sender: User; receiver: User })[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: string): Promise<void>;

  // Favorites
  getFavorites(
    userId: string,
  ): Promise<
    (Favorite & { listing: Listing & { images: ListingImage[]; user: User } })[]
  >;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, listingId: string): Promise<void>;
  isFavorite(userId: string, listingId: string): Promise<boolean>;

  // Seeker profiles
  getSeekerProfiles(filters?: {
    minBudget?: number;
    maxBudget?: number;
    gender?: string;
    location?: string;
    isFeatured?: boolean;
    isPublished?: boolean;
    isActive?: boolean;
  }): Promise<(SeekerProfile & { photos: SeekerPhoto[]; user: User })[]>;
  getSeekerProfile(
    id: string,
  ): Promise<
    (SeekerProfile & { photos: SeekerPhoto[]; user: User }) | undefined
  >;
  getUserSeekerProfile(
    userId: string,
  ): Promise<(SeekerProfile & { photos: SeekerPhoto[] }) | undefined>;
  createSeekerProfile(profile: InsertSeekerProfile): Promise<SeekerProfile>;
  updateSeekerProfile(
    id: string,
    profile: Partial<InsertSeekerProfile>,
  ): Promise<SeekerProfile>;
  deleteSeekerProfile(id: string): Promise<void>;

  // Seeker photos
  addSeekerPhoto(photo: InsertSeekerPhoto): Promise<SeekerPhoto>;
  getSeekerPhotos(seekerId: string): Promise<SeekerPhoto[]>;
  deleteSeekerPhoto(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Listing operations
  async getListings(
    filters?: any,
  ): Promise<(Listing & { images: ListingImage[]; user: User })[]> {
    const conditions = [eq(listings.status, "active")];

    if (filters) {
      if (filters.location)
        conditions.push(ilike(listings.address, `%${filters.location}%`));
      if (filters.minPrice)
        conditions.push(gte(listings.rentAmount, filters.minPrice.toString()));
      if (filters.maxPrice)
        conditions.push(lte(listings.rentAmount, filters.maxPrice.toString()));
      if (filters.billsIncluded !== undefined)
        conditions.push(eq(listings.billsIncluded, filters.billsIncluded));
      if (filters.propertyType)
        conditions.push(eq(listings.propertyType, filters.propertyType));
      if (filters.internetIncluded !== undefined)
        conditions.push(
          eq(listings.internetIncluded, filters.internetIncluded),
        );
    }

    const results = await db
      .select()
      .from(listings)
      .where(and(...conditions))
      .orderBy(desc(listings.createdAt));

    const listingsWithData = await Promise.all(
      results.map(async (listing) => {
        const [images, user] = await Promise.all([
          this.getListingImages(listing.id),
          this.getUser(listing.userId),
        ]);
        return { ...listing, images, user: user! };
      }),
    );

    return listingsWithData;
  }

  async getListing(id: string) {
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, id));
    if (!listing) return undefined;
    const [images, user] = await Promise.all([
      this.getListingImages(listing.id),
      this.getUser(listing.userId),
    ]);
    return { ...listing, images, user: user! };
  }

  async createListing(listing: InsertListing) {
    const [newListing] = await db.insert(listings).values(listing).returning();
    return newListing;
  }

  async updateListing(id: string, listing: Partial<InsertListing>) {
    const [updated] = await db
      .update(listings)
      .set({ ...listing, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return updated;
  }

  async deleteListing(id: string) {
    const images = await this.getListingImages(id);
    for (const image of images) {
      const fullPath = path.join(
        process.cwd(),
        image.imagePath.replace(/^\//, ""),
      );
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    await db.delete(listings).where(eq(listings.id, id));
  }

  async getUserListings(userId: string) {
    const userListings = await db
      .select()
      .from(listings)
      .where(eq(listings.userId, userId))
      .orderBy(desc(listings.createdAt));

    return Promise.all(
      userListings.map(async (listing) => ({
        ...listing,
        images: await this.getListingImages(listing.id),
      })),
    );
  }

  // Listing images
  async addListingImage(image: InsertListingImage) {
    const [newImage] = await db.insert(listingImages).values(image).returning();
    return newImage;
  }

  async getListingImages(listingId: string) {
    const images = await db
      .select()
      .from(listingImages)
      .where(eq(listingImages.listingId, listingId))
      .orderBy(desc(listingImages.isPrimary), asc(listingImages.createdAt));

    // Rewrite image paths to absolute URLs (R2 or local)
    return images.map((img) => ({
      ...img,
      imagePath: getImageUrl(img.imagePath),
    }));
  }

  async deleteListingImage(id: string) {
    const [image] = await db
      .select()
      .from(listingImages)
      .where(eq(listingImages.id, id));

    if (image) {
      const fullPath = path.join(
        process.cwd(),
        image.imagePath.replace(/^\//, ""),
      );
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await db.delete(listingImages).where(eq(listingImages.id, id));
  }

  async setPrimaryImage(listingId: string, imageId: string) {
    await db
      .update(listingImages)
      .set({ isPrimary: false })
      .where(eq(listingImages.listingId, listingId));

    await db
      .update(listingImages)
      .set({ isPrimary: true })
      .where(eq(listingImages.id, imageId));
  }

  // (Other sections below remain exactly the same — no Cloudflare impact)
  // User Preferences, Messages, Favorites, Seeker Profiles, and Photos...
  // ✅ You can keep all those unchanged.
}

export const storage = new DatabaseStorage();
