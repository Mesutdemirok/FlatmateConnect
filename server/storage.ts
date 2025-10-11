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
import fs from 'fs';
import path from 'path';

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
  }): Promise<(Listing & { images: ListingImage[], user: User })[]>;
  getListing(id: string): Promise<(Listing & { images: ListingImage[], user: User }) | undefined>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: string, listing: Partial<InsertListing>): Promise<Listing>;
  deleteListing(id: string): Promise<void>;
  getUserListings(userId: string): Promise<(Listing & { images: ListingImage[] })[]>;
  
  // Listing images
  addListingImage(image: InsertListingImage): Promise<ListingImage>;
  getListingImages(listingId: string): Promise<ListingImage[]>;
  deleteListingImage(id: string): Promise<void>;
  setPrimaryImage(listingId: string, imageId: string): Promise<void>;
  
  // User preferences
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  
  // Messages
  getConversations(userId: string): Promise<{ user: User, lastMessage: Message, unreadCount: number }[]>;
  getMessages(userId1: string, userId2: string, listingId?: string): Promise<(Message & { sender: User, receiver: User })[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: string): Promise<void>;
  
  // Favorites
  getFavorites(userId: string): Promise<(Favorite & { listing: Listing & { images: ListingImage[], user: User } })[]>;
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
  }): Promise<(SeekerProfile & { photos: SeekerPhoto[], user: User })[]>;
  getSeekerProfile(id: string): Promise<(SeekerProfile & { photos: SeekerPhoto[], user: User }) | undefined>;
  getUserSeekerProfile(userId: string): Promise<(SeekerProfile & { photos: SeekerPhoto[] }) | undefined>;
  createSeekerProfile(profile: InsertSeekerProfile): Promise<SeekerProfile>;
  updateSeekerProfile(id: string, profile: Partial<InsertSeekerProfile>): Promise<SeekerProfile>;
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
  async getListings(filters?: {
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
  }): Promise<(Listing & { images: ListingImage[], user: User })[]> {
    const conditions = [eq(listings.status, 'active')];

    if (filters) {
      if (filters.location) {
        // Make location search case-insensitive and handle Turkish characters better
        const searchTerm = filters.location.toLowerCase()
          .replace(/ı/g, 'i')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c');
        
        conditions.push(
          or(
            ilike(listings.suburb, `%${filters.location}%`),
            ilike(listings.city, `%${filters.location}%`),
            ilike(listings.postcode, `%${filters.location}%`),
            // Also search with normalized version for better Turkish support
            ilike(listings.suburb, `%${searchTerm}%`),
            ilike(listings.city, `%${searchTerm}%`)
          )!
        );
      }
      
      if (filters.minPrice) {
        conditions.push(gte(listings.rentAmount, filters.minPrice.toString()));
      }
      
      if (filters.maxPrice) {
        conditions.push(lte(listings.rentAmount, filters.maxPrice.toString()));
      }
      
      if (filters.availableFrom) {
        conditions.push(lte(listings.availableFrom, filters.availableFrom));
      }
      
      if (filters.suburb) {
        conditions.push(ilike(listings.suburb, `%${filters.suburb}%`));
      }
      
      if (filters.city) {
        conditions.push(ilike(listings.city, `%${filters.city}%`));
      }
      
      if (filters.furnished !== undefined) {
        conditions.push(eq(listings.furnished, filters.furnished));
      }
      
      if (filters.billsIncluded !== undefined) {
        conditions.push(eq(listings.billsIncluded, filters.billsIncluded));
      }
      
      if (filters.postcode) {
        conditions.push(ilike(listings.postcode, `%${filters.postcode}%`));
      }
      
      if (filters.roomType) {
        conditions.push(eq(listings.roomType, filters.roomType));
      }
      
      if (filters.propertyType) {
        conditions.push(eq(listings.propertyType, filters.propertyType));
      }
      
      if (filters.parkingAvailable !== undefined) {
        conditions.push(eq(listings.parkingAvailable, filters.parkingAvailable));
      }
      
      if (filters.internetIncluded !== undefined) {
        conditions.push(eq(listings.internetIncluded, filters.internetIncluded));
      }
    }

    const results = await db
      .select()
      .from(listings)
      .where(and(...conditions))
      .orderBy(desc(listings.createdAt));
    
    // Fetch images and user data for each listing
    const listingsWithData = await Promise.all(
      results.map(async (listing) => {
        const [images, user] = await Promise.all([
          this.getListingImages(listing.id),
          this.getUser(listing.userId)
        ]);
        return { ...listing, images, user: user! };
      })
    );
    
    return listingsWithData;
  }

  async getListing(id: string): Promise<(Listing & { images: ListingImage[], user: User }) | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    if (!listing) return undefined;

    const [images, user] = await Promise.all([
      this.getListingImages(listing.id),
      this.getUser(listing.userId)
    ]);

    return { ...listing, images, user: user! };
  }

  async createListing(listing: InsertListing): Promise<Listing> {
    const [newListing] = await db.insert(listings).values(listing).returning();
    return newListing;
  }

  async updateListing(id: string, listing: Partial<InsertListing>): Promise<Listing> {
    const [updated] = await db
      .update(listings)
      .set({ ...listing, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return updated;
  }

  async deleteListing(id: string): Promise<void> {
    // First delete all images and their files
    const images = await this.getListingImages(id);
    for (const image of images) {
      const fullPath = path.join(process.cwd(), image.imagePath.replace(/^\//, ''));
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (error) {
        console.error('Failed to delete image file:', error);
      }
    }
    
    // Delete from database (cascade will handle related records)
    await db.delete(listings).where(eq(listings.id, id));
  }

  async getUserListings(userId: string): Promise<(Listing & { images: ListingImage[] })[]> {
    const userListings = await db
      .select()
      .from(listings)
      .where(eq(listings.userId, userId))
      .orderBy(desc(listings.createdAt));

    const listingsWithImages = await Promise.all(
      userListings.map(async (listing) => {
        const images = await this.getListingImages(listing.id);
        return { ...listing, images };
      })
    );

    return listingsWithImages;
  }

  // Listing images
  async addListingImage(image: InsertListingImage): Promise<ListingImage> {
    const [newImage] = await db.insert(listingImages).values(image).returning();
    return newImage;
  }

  async getListingImages(listingId: string): Promise<ListingImage[]> {
    return await db
      .select()
      .from(listingImages)
      .where(eq(listingImages.listingId, listingId))
      .orderBy(desc(listingImages.isPrimary), asc(listingImages.createdAt));
  }

  async deleteListingImage(id: string): Promise<void> {
    // First get the image to delete the file
    const [image] = await db.select().from(listingImages).where(eq(listingImages.id, id));
    
    if (image) {
      // Delete the physical file
      const fullPath = path.join(process.cwd(), image.imagePath.replace(/^\//, ''));
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (error) {
        console.error('Failed to delete image file:', error);
      }
    }
    
    // Delete from database
    await db.delete(listingImages).where(eq(listingImages.id, id));
  }

  async setPrimaryImage(listingId: string, imageId: string): Promise<void> {
    // First set all images for this listing to non-primary
    await db
      .update(listingImages)
      .set({ isPrimary: false })
      .where(eq(listingImages.listingId, listingId));
    
    // Then set the specified image as primary
    await db
      .update(listingImages)
      .set({ isPrimary: true })
      .where(eq(listingImages.id, imageId));
  }

  // User preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences;
  }

  async upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [result] = await db
      .insert(userPreferences)
      .values(preferences)
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...preferences, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  // Messages
  async getConversations(userId: string): Promise<{ user: User, lastMessage: Message, unreadCount: number }[]> {
    // This is a complex query - simplified for now
    const sentMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.senderId, userId));
    
    const receivedMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.receiverId, userId));

    const allMessages = [...sentMessages, ...receivedMessages];
    const conversationMap = new Map<string, { user: User, lastMessage: Message, unreadCount: number }>();

    for (const message of allMessages) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser = await this.getUser(otherUserId);
      
      if (otherUser) {
        const existing = conversationMap.get(otherUserId);
        if (!existing || message.createdAt! > existing.lastMessage.createdAt!) {
          const unreadCount = receivedMessages.filter(m => 
            m.senderId === otherUserId && !m.isRead
          ).length;
          
          conversationMap.set(otherUserId, {
            user: otherUser,
            lastMessage: message,
            unreadCount
          });
        }
      }
    }

    return Array.from(conversationMap.values()).sort(
      (a, b) => b.lastMessage.createdAt!.getTime() - a.lastMessage.createdAt!.getTime()
    );
  }

  async getMessages(userId1: string, userId2: string, listingId?: string): Promise<(Message & { sender: User, receiver: User })[]> {
    const whereConditions = [
      or(
        and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
      )
    ];
    
    if (listingId) {
      whereConditions.push(eq(messages.listingId, listingId));
    }

    const results = await db
      .select()
      .from(messages)
      .where(and(...whereConditions))
      .orderBy(asc(messages.createdAt));

    const messagesWithUsers = await Promise.all(
      results.map(async (message) => {
        const [sender, receiver] = await Promise.all([
          this.getUser(message.senderId),
          this.getUser(message.receiverId)
        ]);
        return { ...message, sender: sender!, receiver: receiver! };
      })
    );

    return messagesWithUsers;
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  // Favorites
  async getFavorites(userId: string): Promise<(Favorite & { listing: Listing & { images: ListingImage[], user: User } })[]> {
    const userFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));

    const favoritesWithListings = await Promise.all(
      userFavorites.map(async (favorite) => {
        const listing = await this.getListing(favorite.listingId);
        return { ...favorite, listing: listing! };
      })
    );

    return favoritesWithListings;
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, listingId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
  }

  async isFavorite(userId: string, listingId: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
    return !!favorite;
  }

  // Seeker profiles
  async getSeekerProfiles(filters?: {
    minBudget?: number;
    maxBudget?: number;
    gender?: string;
    location?: string;
    isFeatured?: boolean;
  }): Promise<(SeekerProfile & { photos: SeekerPhoto[], user: User })[]> {
    const whereConditions = [];
    whereConditions.push(eq(seekerProfiles.isActive, true));

    if (filters?.minBudget) {
      whereConditions.push(gte(seekerProfiles.budgetWeekly, filters.minBudget.toString()));
    }
    if (filters?.maxBudget) {
      whereConditions.push(lte(seekerProfiles.budgetWeekly, filters.maxBudget.toString()));
    }
    if (filters?.gender) {
      whereConditions.push(eq(seekerProfiles.gender, filters.gender));
    }
    if (filters?.isFeatured !== undefined) {
      whereConditions.push(eq(seekerProfiles.isFeatured, filters.isFeatured));
    }

    const profiles = await db
      .select()
      .from(seekerProfiles)
      .where(and(...whereConditions))
      .orderBy(desc(seekerProfiles.createdAt));

    const profilesWithRelations = await Promise.all(
      profiles.map(async (profile) => {
        const [photos, user] = await Promise.all([
          this.getSeekerPhotos(profile.id),
          this.getUser(profile.userId)
        ]);
        return { ...profile, photos, user: user! };
      })
    );

    return profilesWithRelations;
  }

  async getSeekerProfile(id: string): Promise<(SeekerProfile & { photos: SeekerPhoto[], user: User }) | undefined> {
    const [profile] = await db
      .select()
      .from(seekerProfiles)
      .where(eq(seekerProfiles.id, id));

    if (!profile) return undefined;

    const [photos, user] = await Promise.all([
      this.getSeekerPhotos(profile.id),
      this.getUser(profile.userId)
    ]);

    return { ...profile, photos, user: user! };
  }

  async getUserSeekerProfile(userId: string): Promise<(SeekerProfile & { photos: SeekerPhoto[] }) | undefined> {
    const [profile] = await db
      .select()
      .from(seekerProfiles)
      .where(eq(seekerProfiles.userId, userId));

    if (!profile) return undefined;

    const photos = await this.getSeekerPhotos(profile.id);
    return { ...profile, photos };
  }

  async createSeekerProfile(profileData: InsertSeekerProfile): Promise<SeekerProfile> {
    const [profile] = await db
      .insert(seekerProfiles)
      .values(profileData)
      .returning();
    return profile;
  }

  async updateSeekerProfile(id: string, profileData: Partial<InsertSeekerProfile>): Promise<SeekerProfile> {
    const [profile] = await db
      .update(seekerProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(seekerProfiles.id, id))
      .returning();
    return profile;
  }

  async deleteSeekerProfile(id: string): Promise<void> {
    const profile = await this.getSeekerProfile(id);
    if (profile) {
      for (const photo of profile.photos) {
        const photoPath = path.join(process.cwd(), 'uploads', 'seekers', photo.imagePath);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }
    }
    await db.delete(seekerProfiles).where(eq(seekerProfiles.id, id));
  }

  // Seeker photos
  async addSeekerPhoto(photoData: InsertSeekerPhoto): Promise<SeekerPhoto> {
    const [photo] = await db
      .insert(seekerPhotos)
      .values(photoData)
      .returning();
    return photo;
  }

  async getSeekerPhotos(seekerId: string): Promise<SeekerPhoto[]> {
    const photos = await db
      .select()
      .from(seekerPhotos)
      .where(eq(seekerPhotos.seekerId, seekerId))
      .orderBy(asc(seekerPhotos.sortOrder));
    return photos;
  }

  async deleteSeekerPhoto(id: string): Promise<void> {
    const [photo] = await db
      .select()
      .from(seekerPhotos)
      .where(eq(seekerPhotos.id, id));

    if (photo) {
      const photoPath = path.join(process.cwd(), 'uploads', 'seekers', photo.imagePath);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await db.delete(seekerPhotos).where(eq(seekerPhotos.id, id));
  }
}

export const storage = new DatabaseStorage();
