var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/r2-utils.ts
var r2_utils_exports = {};
__export(r2_utils_exports, {
  deleteFromR2: () => deleteFromR2,
  getR2Url: () => getR2Url,
  uploadToR2: () => uploadToR2
});
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
async function uploadToR2(localPath, r2Key) {
  const key = r2Key || localPath.replace(/^\/+/, "");
  const fileContent = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const contentType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".avif" ? "image/avif" : "application/octet-stream";
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: fileContent,
    ContentType: contentType
  });
  await r2.send(command);
  return `${R2_PUBLIC_URL}/${key}`;
}
async function deleteFromR2(r2Key) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key.replace(/^\/+/, "")
  });
  await r2.send(command);
}
function getR2Url(r2Key) {
  return `${R2_PUBLIC_URL}/${r2Key.replace(/^\/+/, "")}`;
}
var r2, R2_BUCKET, R2_PUBLIC_URL;
var init_r2_utils = __esm({
  "server/r2-utils.ts"() {
    "use strict";
    r2 = new S3Client({
      region: "auto",
      endpoint: process.env.R2_S3_ENDPOINT?.trim(),
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID?.trim(),
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY?.trim()
      }
    });
    R2_BUCKET = process.env.R2_BUCKET_NAME?.trim();
    R2_PUBLIC_URL = process.env.R2_PUBLIC_URL?.trim();
  }
});

// server/index.ts
import express3 from "express";
import cookieParser from "cookie-parser";

// server/routes.ts
import express from "express";
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  favorites: () => favorites,
  favoritesRelations: () => favoritesRelations,
  insertFavoriteSchema: () => insertFavoriteSchema,
  insertListingImageSchema: () => insertListingImageSchema,
  insertListingSchema: () => insertListingSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertSeekerPhotoSchema: () => insertSeekerPhotoSchema,
  insertSeekerProfileSchema: () => insertSeekerProfileSchema,
  insertUserPreferencesSchema: () => insertUserPreferencesSchema,
  insertUserSchema: () => insertUserSchema,
  listingImages: () => listingImages,
  listingImagesRelations: () => listingImagesRelations,
  listings: () => listings,
  listingsRelations: () => listingsRelations,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  seekerPhotos: () => seekerPhotos,
  seekerPhotosRelations: () => seekerPhotosRelations,
  seekerProfiles: () => seekerProfiles,
  seekerProfilesRelations: () => seekerProfilesRelations,
  sessions: () => sessions,
  userPreferences: () => userPreferences,
  userPreferencesRelations: () => userPreferencesRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender"),
  occupation: varchar("occupation"),
  bio: text("bio"),
  verificationStatus: varchar("verification_status").default("unverified"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Basic Information
  address: text("address").notNull(),
  title: varchar("title").notNull(),
  rentAmount: decimal("rent_amount", { precision: 8, scale: 2 }).notNull(),
  // Monthly rent
  billsIncluded: boolean("bills_included").default(false),
  // Utilities included
  excludedBills: text("excluded_bills").array().default(sql`ARRAY[]::text[]`),
  // Bills not included when billsIncluded is false
  // Property Details  
  propertyType: varchar("property_type"),
  // Rezidans/Apartman/Daire/Müstakil Ev/Diğer
  internetIncluded: boolean("internet_included").default(false),
  totalRooms: integer("total_rooms"),
  // Total rooms in house
  bathroomType: varchar("bathroom_type"),
  // Ortak/Özel
  // Furnishing
  furnishingStatus: varchar("furnishing_status"),
  // Eşyalı/Eşyasız/Kısmen Eşyalı
  amenities: text("amenities").array(),
  // Yatak/Dolap/Masa/Sandalye/Klima/TV/Diğer
  // Occupancy & Preferences
  totalOccupants: integer("total_occupants"),
  // How many people live there
  roommatePreference: varchar("roommate_preference"),
  // Kadın/Erkek/Farketmez
  smokingPolicy: varchar("smoking_policy"),
  // İçilebilir/İçilemez/Balkon Dahil İçilemez
  // System fields
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var listingImages = pgTable("listing_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  imagePath: varchar("image_path").notNull(),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  smokingPreference: varchar("smoking_preference"),
  petPreference: varchar("pet_preference"),
  cleanlinessLevel: varchar("cleanliness_level"),
  socialLevel: varchar("social_level"),
  workSchedule: varchar("work_schedule"),
  agePreferenceMin: integer("age_preference_min"),
  agePreferenceMax: integer("age_preference_max"),
  genderPreference: varchar("gender_preference"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: varchar("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listingId: varchar("listing_id").references(() => listings.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listingId: varchar("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow()
});
var seekerProfiles = pgTable("seeker_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Personal Information
  profilePhotoUrl: varchar("profile_photo_url"),
  // Profile photo
  fullName: varchar("full_name"),
  // Combined first and last name
  age: integer("age"),
  gender: varchar("gender"),
  // Kadın/Erkek/Diğer/Belirtmek İstemiyorum
  occupation: varchar("occupation"),
  // Öğrenci/Çalışan/Serbest/Diğer
  // Search Preferences
  budgetMonthly: varchar("budget_monthly"),
  // Monthly budget (stored as string to avoid validation issues)
  about: text("about"),
  // Bio/description
  preferredLocation: text("preferred_location"),
  // Single location preference
  // Lifestyle Preferences (merged from userPreferences)
  smokingPreference: varchar("smoking_preference"),
  petPreference: varchar("pet_preference"),
  cleanlinessLevel: varchar("cleanliness_level"),
  socialLevel: varchar("social_level"),
  workSchedule: varchar("work_schedule"),
  agePreferenceMin: integer("age_preference_min"),
  agePreferenceMax: integer("age_preference_max"),
  genderPreference: varchar("gender_preference"),
  // System fields
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var seekerPhotos = pgTable("seeker_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  seekerId: varchar("seeker_id").notNull().references(() => seekerProfiles.id, { onDelete: "cascade" }),
  imagePath: varchar("image_path").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  preferences: many(userPreferences),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  favorites: many(favorites),
  seekerProfiles: many(seekerProfiles)
}));
var listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id]
  }),
  images: many(listingImages),
  messages: many(messages),
  favorites: many(favorites)
}));
var listingImagesRelations = relations(listingImages, ({ one }) => ({
  listing: one(listings, {
    fields: [listingImages.listingId],
    references: [listings.id]
  })
}));
var userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id]
  })
}));
var messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender"
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver"
  }),
  listing: one(listings, {
    fields: [messages.listingId],
    references: [listings.id]
  })
}));
var favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id]
  }),
  listing: one(listings, {
    fields: [favorites.listingId],
    references: [listings.id]
  })
}));
var seekerProfilesRelations = relations(seekerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [seekerProfiles.userId],
    references: [users.id]
  }),
  photos: many(seekerPhotos)
}));
var seekerPhotosRelations = relations(seekerPhotos, ({ one }) => ({
  seeker: one(seekerProfiles, {
    fields: [seekerPhotos.seekerId],
    references: [seekerProfiles.id]
  })
}));
var insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  rentAmount: z.union([z.string(), z.number()]).transform((val) => String(val))
});
var insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});
var insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true
});
var insertListingImageSchema = createInsertSchema(listingImages).omit({
  id: true,
  createdAt: true
});
var insertSeekerProfileSchema = createInsertSchema(seekerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  budgetMonthly: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  age: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional()
});
var insertSeekerPhotoSchema = createInsertSchema(seekerPhotos).omit({
  id: true,
  createdAt: true
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordResetToken: true,
  passwordResetExpires: true
}).extend({
  password: z.string().min(8, "\u015Eifre en az 8 karakter olmal\u0131d\u0131r")
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
var connectionString = process.env.DATABASE_URL;
if (connectionString?.startsWith("DATABASE_URL=")) {
  connectionString = connectionString.replace(/^DATABASE_URL=/, "");
}
if (!connectionString || connectionString.includes("PGUSER") || connectionString.includes("PGHOST")) {
  const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;
  if (!PGUSER || !PGPASSWORD || !PGHOST || !PGPORT || !PGDATABASE) {
    throw new Error("Database connection not configured. Missing PG* environment variables.");
  }
  connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
}
var pool = new Pool({ connectionString });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, or, ilike, gte, lte, desc, asc } from "drizzle-orm";
import fs2 from "fs";
import path2 from "path";
import { S3Client as S3Client2 } from "@aws-sdk/client-s3";
var r22 = new S3Client2({
  region: "auto",
  endpoint: process.env.R2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});
var R2_BUCKET2 = process.env.R2_BUCKET_NAME;
var LOCAL_UPLOADS = path2.join(process.cwd(), "uploads");
function normalizeR2Url(url) {
  const customDomain = process.env.R2_PUBLIC_URL || "";
  if (customDomain && url.includes(".r2.dev")) {
    const r2Pattern = /https?:\/\/pub-[a-zA-Z0-9]+\.r2\.dev/;
    return url.replace(r2Pattern, customDomain);
  }
  return url;
}
function getImageUrl(relativePath) {
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
    return normalizeR2Url(relativePath);
  }
  const publicUrl = process.env.R2_PUBLIC_URL;
  const isProduction = process.env.NODE_ENV?.trim().toLowerCase() === "production";
  if (isProduction && publicUrl) {
    return `${publicUrl}/${relativePath.replace(/^\/+/, "")}`;
  }
  return relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
}
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Listing operations
  async getListings(filters) {
    const conditions = [eq(listings.status, "active")];
    if (filters) {
      if (filters.location)
        conditions.push(ilike(listings.address, `%${filters.location}%`));
      if (filters.minPrice)
        conditions.push(gte(listings.rentAmount, filters.minPrice.toString()));
      if (filters.maxPrice)
        conditions.push(lte(listings.rentAmount, filters.maxPrice.toString()));
      if (filters.billsIncluded !== void 0)
        conditions.push(eq(listings.billsIncluded, filters.billsIncluded));
      if (filters.propertyType)
        conditions.push(eq(listings.propertyType, filters.propertyType));
      if (filters.internetIncluded !== void 0)
        conditions.push(
          eq(listings.internetIncluded, filters.internetIncluded)
        );
    }
    const results = await db.select().from(listings).where(and(...conditions)).orderBy(desc(listings.createdAt));
    const listingsWithData = await Promise.all(
      results.map(async (listing) => {
        const [images, user] = await Promise.all([
          this.getListingImages(listing.id),
          this.getUser(listing.userId)
        ]);
        return { ...listing, images, user };
      })
    );
    return listingsWithData;
  }
  async getListing(id) {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    if (!listing) return void 0;
    const [images, user] = await Promise.all([
      this.getListingImages(listing.id),
      this.getUser(listing.userId)
    ]);
    return { ...listing, images, user };
  }
  async createListing(listing) {
    const [newListing] = await db.insert(listings).values(listing).returning();
    return newListing;
  }
  async updateListing(id, listing) {
    const [updated] = await db.update(listings).set({ ...listing, updatedAt: /* @__PURE__ */ new Date() }).where(eq(listings.id, id)).returning();
    return updated;
  }
  async deleteListing(id) {
    const images = await this.getListingImages(id);
    for (const image of images) {
      const fullPath = path2.join(
        process.cwd(),
        image.imagePath.replace(/^\//, "")
      );
      if (fs2.existsSync(fullPath)) fs2.unlinkSync(fullPath);
    }
    await db.delete(listings).where(eq(listings.id, id));
  }
  async getUserListings(userId) {
    const userListings = await db.select().from(listings).where(eq(listings.userId, userId)).orderBy(desc(listings.createdAt));
    return Promise.all(
      userListings.map(async (listing) => ({
        ...listing,
        images: await this.getListingImages(listing.id)
      }))
    );
  }
  // Listing images
  async addListingImage(image) {
    const [newImage] = await db.insert(listingImages).values(image).returning();
    return newImage;
  }
  async getListingImages(listingId) {
    const images = await db.select().from(listingImages).where(eq(listingImages.listingId, listingId)).orderBy(desc(listingImages.isPrimary), asc(listingImages.createdAt));
    return images.map((img) => ({
      ...img,
      imagePath: getImageUrl(img.imagePath)
    }));
  }
  async deleteListingImage(id) {
    const [image] = await db.select().from(listingImages).where(eq(listingImages.id, id));
    if (image) {
      const fullPath = path2.join(
        process.cwd(),
        image.imagePath.replace(/^\//, "")
      );
      if (fs2.existsSync(fullPath)) fs2.unlinkSync(fullPath);
    }
    await db.delete(listingImages).where(eq(listingImages.id, id));
  }
  async setPrimaryImage(listingId, imageId) {
    await db.update(listingImages).set({ isPrimary: false }).where(eq(listingImages.listingId, listingId));
    await db.update(listingImages).set({ isPrimary: true }).where(eq(listingImages.id, imageId));
  }
  // User preferences
  async getUserPreferences(userId) {
    const [preferences] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return preferences;
  }
  async upsertUserPreferences(preferences) {
    const [result] = await db.insert(userPreferences).values(preferences).onConflictDoUpdate({
      target: userPreferences.userId,
      set: { ...preferences, updatedAt: /* @__PURE__ */ new Date() }
    }).returning();
    return result;
  }
  // Messages
  async getConversations(userId) {
    const sentMessages = await db.select().from(messages).where(eq(messages.senderId, userId));
    const receivedMessages = await db.select().from(messages).where(eq(messages.receiverId, userId));
    const allMessages = [...sentMessages, ...receivedMessages];
    const conversationMap = /* @__PURE__ */ new Map();
    for (const message of allMessages) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser = await this.getUser(otherUserId);
      if (otherUser) {
        const existing = conversationMap.get(otherUserId);
        if (!existing || message.createdAt > existing.lastMessage.createdAt) {
          const unreadCount = receivedMessages.filter(
            (m) => m.senderId === otherUserId && !m.isRead
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
      (a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
    );
  }
  async getMessages(userId1, userId2, listingId) {
    const whereConditions = [
      or(
        and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
      )
    ];
    if (listingId) {
      whereConditions.push(eq(messages.listingId, listingId));
    }
    const results = await db.select().from(messages).where(and(...whereConditions)).orderBy(asc(messages.createdAt));
    const messagesWithUsers = await Promise.all(
      results.map(async (message) => {
        const [sender, receiver] = await Promise.all([
          this.getUser(message.senderId),
          this.getUser(message.receiverId)
        ]);
        return { ...message, sender, receiver };
      })
    );
    return messagesWithUsers;
  }
  async sendMessage(message) {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
  async markMessageAsRead(messageId) {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, messageId));
  }
  // Favorites
  async getFavorites(userId) {
    const userFavorites = await db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
    const favoritesWithListings = await Promise.all(
      userFavorites.map(async (favorite) => {
        const listing = await this.getListing(favorite.listingId);
        return { ...favorite, listing };
      })
    );
    return favoritesWithListings;
  }
  async addFavorite(favorite) {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }
  async removeFavorite(userId, listingId) {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
  }
  async isFavorite(userId, listingId) {
    const [favorite] = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
    return !!favorite;
  }
  // Seeker profiles
  async getSeekerProfiles(filters) {
    const whereConditions = [];
    if (filters?.isActive !== void 0) {
      whereConditions.push(eq(seekerProfiles.isActive, filters.isActive));
    } else {
      whereConditions.push(eq(seekerProfiles.isActive, true));
    }
    if (filters?.minBudget) {
      whereConditions.push(gte(seekerProfiles.budgetMonthly, filters.minBudget.toString()));
    }
    if (filters?.maxBudget) {
      whereConditions.push(lte(seekerProfiles.budgetMonthly, filters.maxBudget.toString()));
    }
    if (filters?.gender) {
      whereConditions.push(eq(seekerProfiles.gender, filters.gender));
    }
    if (filters?.location) {
      whereConditions.push(ilike(seekerProfiles.preferredLocation, `%${filters.location}%`));
    }
    if (filters?.isFeatured !== void 0) {
      whereConditions.push(eq(seekerProfiles.isFeatured, filters.isFeatured));
    }
    if (filters?.isPublished !== void 0) {
      whereConditions.push(eq(seekerProfiles.isPublished, filters.isPublished));
    }
    const profiles = await db.select().from(seekerProfiles).where(and(...whereConditions)).orderBy(desc(seekerProfiles.createdAt));
    const profilesWithRelations = await Promise.all(
      profiles.map(async (profile) => {
        const [photos, user] = await Promise.all([
          this.getSeekerPhotos(profile.id),
          this.getUser(profile.userId)
        ]);
        return { ...profile, photos, user };
      })
    );
    return profilesWithRelations;
  }
  async getSeekerProfile(id) {
    const [profile] = await db.select().from(seekerProfiles).where(eq(seekerProfiles.id, id));
    if (!profile) return void 0;
    const [photos, user] = await Promise.all([
      this.getSeekerPhotos(profile.id),
      this.getUser(profile.userId)
    ]);
    return { ...profile, photos, user };
  }
  async getUserSeekerProfile(userId) {
    const [profile] = await db.select().from(seekerProfiles).where(eq(seekerProfiles.userId, userId));
    if (!profile) return void 0;
    const photos = await this.getSeekerPhotos(profile.id);
    return { ...profile, photos };
  }
  async createSeekerProfile(profileData) {
    const [profile] = await db.insert(seekerProfiles).values(profileData).returning();
    return profile;
  }
  async updateSeekerProfile(id, profileData) {
    const [profile] = await db.update(seekerProfiles).set({ ...profileData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(seekerProfiles.id, id)).returning();
    return profile;
  }
  async deleteSeekerProfile(id) {
    const profile = await this.getSeekerProfile(id);
    if (profile) {
      for (const photo of profile.photos) {
        const photoPath = path2.join(process.cwd(), "uploads", "seekers", photo.imagePath);
        if (fs2.existsSync(photoPath)) {
          fs2.unlinkSync(photoPath);
        }
      }
    }
    await db.delete(seekerProfiles).where(eq(seekerProfiles.id, id));
  }
  // Seeker photos
  async addSeekerPhoto(photoData) {
    const [photo] = await db.insert(seekerPhotos).values(photoData).returning();
    return photo;
  }
  async getSeekerPhotos(seekerId) {
    return await db.select().from(seekerPhotos).where(eq(seekerPhotos.seekerId, seekerId)).orderBy(asc(seekerPhotos.createdAt));
  }
  async deleteSeekerPhoto(id) {
    const [photo] = await db.select().from(seekerPhotos).where(eq(seekerPhotos.id, id));
    if (photo) {
      try {
        const { deleteFromR2: deleteFromR22 } = await Promise.resolve().then(() => (init_r2_utils(), r2_utils_exports));
        let r2Key;
        if (photo.imagePath.startsWith("http")) {
          const url = new URL(photo.imagePath);
          r2Key = url.pathname.substring(1);
        } else {
          r2Key = photo.imagePath.replace(/^\/+/, "");
        }
        if (r2Key) {
          await deleteFromR22(r2Key);
          console.log(`\u2705 Deleted from R2: ${r2Key}`);
        }
      } catch (r2Error) {
        console.error(`\u274C R2 deletion failed for ${photo.imagePath}:`, r2Error);
      }
      const localPhotoPath = photo.imagePath.includes("uploads/seekers/") ? path2.join(process.cwd(), photo.imagePath.split("uploads/seekers/")[1] ? `uploads/seekers/${photo.imagePath.split("uploads/seekers/")[1]}` : photo.imagePath) : path2.join(process.cwd(), "uploads", "seekers", photo.imagePath);
      if (fs2.existsSync(localPhotoPath)) {
        fs2.unlinkSync(localPhotoPath);
        console.log(`\u2705 Deleted local file: ${localPhotoPath}`);
      }
    }
    await db.delete(seekerPhotos).where(eq(seekerPhotos.id, id));
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
var JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
var TOKEN_EXPIRY = "7d";
var BCRYPT_ROUNDS = 10;
function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}
async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
var jwtAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : cookieToken;
    if (!token) {
      return res.status(401).json({ message: "Yetkisiz eri\u015Fim" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({ message: "Ge\xE7ersiz veya s\xFCresi dolmu\u015F token" });
  }
};

// server/i18n.ts
var turkishErrors = {
  // Authentication errors
  unauthorized: "Bu i\u015Flem i\xE7in yetkiniz bulunmuyor",
  invalid_credentials: "Ge\xE7ersiz giri\u015F bilgileri",
  session_expired: "Oturumunuzin s\xFCresi dolmu\u015F",
  // Validation errors
  required_field: "Bu alan zorunludur",
  invalid_email: "Ge\xE7erli bir e-posta adresi giriniz",
  invalid_phone: "Ge\xE7erli bir telefon numaras\u0131 giriniz",
  invalid_date: "Ge\xE7erli bir tarih giriniz",
  invalid_number: "Ge\xE7erli bir say\u0131 giriniz",
  min_length: "En az {{count}} karakter olmal\u0131d\u0131r",
  max_length: "En fazla {{count}} karakter olmal\u0131d\u0131r",
  // Database errors
  database_error: "Veritaban\u0131 hatas\u0131 olu\u015Ftu",
  not_found: "Kay\u0131t bulunamad\u0131",
  duplicate_entry: "Bu kay\u0131t zaten mevcut",
  // Listing errors
  listing_not_found: "\u0130lan bulunamad\u0131",
  listing_creation_failed: "\u0130lan olu\u015Fturulamad\u0131",
  listing_update_failed: "\u0130lan g\xFCncellenemedi",
  listing_delete_failed: "\u0130lan silinemedi",
  // User errors
  user_not_found: "Kullan\u0131c\u0131 bulunamad\u0131",
  profile_update_failed: "Profil g\xFCncellenemedi",
  // Message errors
  message_send_failed: "Mesaj g\xF6nderilemedi",
  conversation_not_found: "Konu\u015Fma bulunamad\u0131",
  // File upload errors  
  file_too_large: "Dosya \xE7ok b\xFCy\xFCk",
  invalid_file_type: "Ge\xE7ersiz dosya t\xFCr\xFC",
  upload_failed: "Y\xFCkleme ba\u015Far\u0131s\u0131z",
  // General errors
  internal_server_error: "Sunucu hatas\u0131 olu\u015Ftu",
  bad_request: "Ge\xE7ersiz istek"
};
function getErrorMessage(key, lang = "tr", params) {
  const messages2 = lang === "tr" ? turkishErrors : turkishErrors;
  let message = messages2[key] || turkishErrors.internal_server_error;
  if (params) {
    Object.keys(params).forEach((param) => {
      message = message.replace(new RegExp(`{{${param}}}`, "g"), params[param]);
    });
  }
  return message;
}
function detectLanguage(req) {
  const acceptLanguage = req.headers["accept-language"];
  if (acceptLanguage && acceptLanguage.includes("en")) {
    return "en";
  }
  return "tr";
}

// server/routes.ts
import multer from "multer";
import path3 from "path";
import fs3 from "fs";
var uploadDir = "uploads/listings";
if (!fs3.existsSync(uploadDir)) {
  fs3.mkdirSync(uploadDir, { recursive: true });
}
var upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path3.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      const lang = detectLanguage(req);
      cb(new Error(getErrorMessage("invalid_file_type", lang)));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  }
});
var seekerUploadDir = "uploads/seekers";
if (!fs3.existsSync(seekerUploadDir)) {
  fs3.mkdirSync(seekerUploadDir, { recursive: true });
}
var seekerUpload = multer({
  storage: multer.diskStorage({
    destination: seekerUploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "seeker-" + uniqueSuffix + path3.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      const lang = detectLanguage(req);
      cb(new Error(getErrorMessage("invalid_file_type", lang)));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  }
});
async function registerRoutes(app2) {
  app2.use("/uploads", express.static("uploads"));
  app2.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      version: "1.0.0",
      env: process.env.NODE_ENV || "development",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const lang = detectLanguage(req);
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Bu e-posta adresi zaten kullan\u0131l\u0131yor" });
      }
      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      const token = generateToken(user.id, user.email);
      const { password, passwordResetToken, passwordResetExpires, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Error registering user:", error);
      const lang = detectLanguage(req);
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Ge\xE7ersiz kay\u0131t bilgileri", error: error.message });
      } else {
        res.status(500).json({ message: "Kay\u0131t i\u015Flemi ba\u015Far\u0131s\u0131z oldu" });
      }
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const lang = detectLanguage(req);
      if (!email || !password) {
        return res.status(400).json({ message: "E-posta ve \u015Fifre gereklidir" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Ge\xE7ersiz e-posta veya \u015Fifre" });
      }
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Ge\xE7ersiz e-posta veya \u015Fifre" });
      }
      const token = generateToken(user.id, user.email);
      const { password: _, passwordResetToken, passwordResetExpires, ...userWithoutPassword } = user;
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1e3
      });
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Error logging in:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: "Giri\u015F i\u015Flemi ba\u015Far\u0131s\u0131z oldu" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "\xC7\u0131k\u0131\u015F yap\u0131ld\u0131" });
  });
  app2.get("/api/auth/me", jwtAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage("user_not_found", lang) });
      }
      const { password, passwordResetToken, passwordResetExpires, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("user_not_found", lang) });
    }
  });
  app2.get("/api/listings", async (req, res) => {
    try {
      const filters = {
        location: req.query.location,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : void 0,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : void 0,
        availableFrom: req.query.availableFrom,
        suburb: req.query.suburb,
        city: req.query.city,
        postcode: req.query.postcode,
        roomType: req.query.roomType,
        propertyType: req.query.propertyType,
        furnished: req.query.furnished === "true" ? true : req.query.furnished === "false" ? false : void 0,
        billsIncluded: req.query.billsIncluded === "true" ? true : req.query.billsIncluded === "false" ? false : void 0,
        parkingAvailable: req.query.parkingAvailable === "true" ? true : req.query.parkingAvailable === "false" ? false : void 0,
        internetIncluded: req.query.internetIncluded === "true" ? true : req.query.internetIncluded === "false" ? false : void 0
      };
      const listings2 = await storage.getListings(filters);
      res.json(listings2);
    } catch (error) {
      console.error("Error fetching listings:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage("listing_not_found", lang) });
      }
      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.post("/api/listings", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const listingData = insertListingSchema.parse({
        ...req.body,
        userId
      });
      const listing = await storage.createListing(listingData);
      res.status(201).json(listing);
    } catch (error) {
      console.error("Error creating listing:", error);
      const lang = detectLanguage(req);
      if (error.name === "ZodError") {
        res.status(400).json({ message: getErrorMessage("bad_request", lang), error: error.message });
      } else {
        res.status(400).json({ message: getErrorMessage("listing_creation_failed", lang), error: error.message });
      }
    }
  });
  app2.put("/api/listings/:id", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const listing = await storage.getListing(req.params.id);
      if (!listing || listing.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage("listing_not_found", lang) });
      }
      const updates = insertListingSchema.partial().parse(req.body);
      const updated = await storage.updateListing(req.params.id, updates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating listing:", error);
      const lang = detectLanguage(req);
      if (error.name === "ZodError") {
        res.status(400).json({ message: getErrorMessage("bad_request", lang), error: error.message });
      } else {
        res.status(400).json({ message: getErrorMessage("listing_update_failed", lang), error: error.message });
      }
    }
  });
  app2.delete("/api/listings/:id", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const listing = await storage.getListing(req.params.id);
      if (!listing || listing.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage("listing_not_found", lang) });
      }
      await storage.deleteListing(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting listing:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("listing_delete_failed", lang) });
    }
  });
  app2.get("/api/my-listings", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const listings2 = await storage.getUserListings(userId);
      res.json(listings2);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.post("/api/listings/:id/images", jwtAuth, upload.array("images", 10), async (req, res) => {
    try {
      const userId = req.userId;
      const listing = await storage.getListing(req.params.id);
      if (!listing || listing.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage("listing_not_found", lang) });
      }
      const files = req.files;
      const images = [];
      const { uploadToR2: uploadToR22 } = await Promise.resolve().then(() => (init_r2_utils(), r2_utils_exports));
      const R2_PUBLIC_URL2 = process.env.R2_PUBLIC_URL || process.env.VITE_R2_PUBLIC_URL;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const r2Key = `uploads/listings/${file.filename}`;
        let fullImageUrl = `/${r2Key}`;
        try {
          await uploadToR22(file.path, r2Key);
          if (R2_PUBLIC_URL2) {
            fullImageUrl = `${R2_PUBLIC_URL2}/${r2Key}`;
          }
          console.log(`\u2705 Uploaded to R2: ${fullImageUrl}`);
        } catch (r2Error) {
          console.error(`\u274C R2 upload failed for ${r2Key}:`, r2Error);
        }
        const image = await storage.addListingImage({
          listingId: req.params.id,
          imagePath: fullImageUrl,
          isPrimary: i === 0
          // First image is primary
        });
        images.push(image);
      }
      res.json(images);
    } catch (error) {
      console.error("Error uploading images:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("upload_failed", lang) });
    }
  });
  app2.delete("/api/listings/:listingId/images/:imageId", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const listing = await storage.getListing(req.params.listingId);
      if (!listing || listing.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage("listing_not_found", lang) });
      }
      await storage.deleteListingImage(req.params.imageId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting image:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.put("/api/listings/:listingId/images/:imageId/primary", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const listing = await storage.getListing(req.params.listingId);
      if (!listing || listing.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage("listing_not_found", lang) });
      }
      await storage.setPrimaryImage(req.params.listingId, req.params.imageId);
      res.status(204).send();
    } catch (error) {
      console.error("Error setting primary image:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.get("/api/listings/:id/images", async (req, res) => {
    try {
      const images = await storage.getListingImages(req.params.id);
      res.json(images);
    } catch (error) {
      console.error("Error fetching listing images:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.get("/api/preferences", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.put("/api/preferences", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const preferencesData = insertUserPreferencesSchema.parse({
        ...req.body,
        userId
      });
      const preferences = await storage.upsertUserPreferences(preferencesData);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      const lang = detectLanguage(req);
      if (error.name === "ZodError") {
        res.status(400).json({ message: getErrorMessage("bad_request", lang), error: error.message });
      } else {
        res.status(400).json({ message: getErrorMessage("profile_update_failed", lang), error: error.message });
      }
    }
  });
  app2.get("/api/conversations", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("conversation_not_found", lang) });
    }
  });
  app2.get("/api/messages/:otherUserId", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const { otherUserId } = req.params;
      const { listingId } = req.query;
      const messages2 = await storage.getMessages(userId, otherUserId, listingId);
      res.json(messages2);
    } catch (error) {
      console.error("Error fetching messages:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.post("/api/messages", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId
      });
      const message = await storage.sendMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      const lang = detectLanguage(req);
      if (error.name === "ZodError") {
        res.status(400).json({ message: getErrorMessage("bad_request", lang), error: error.message });
      } else {
        res.status(400).json({ message: getErrorMessage("message_send_failed", lang), error: error.message });
      }
    }
  });
  app2.put("/api/messages/:id/read", jwtAuth, async (req, res) => {
    try {
      await storage.markMessageAsRead(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking message as read:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.get("/api/favorites", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const favorites2 = await storage.getFavorites(userId);
      res.json(favorites2);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.post("/api/favorites", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        userId
      });
      const favorite = await storage.addFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      const lang = detectLanguage(req);
      if (error.name === "ZodError") {
        res.status(400).json({ message: getErrorMessage("bad_request", lang), error: error.message });
      } else {
        res.status(400).json({ message: getErrorMessage("database_error", lang), error: error.message });
      }
    }
  });
  app2.delete("/api/favorites/:listingId", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      await storage.removeFavorite(userId, req.params.listingId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.get("/api/favorites/:listingId/check", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const isFavorite = await storage.isFavorite(userId, req.params.listingId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.get("/api/seekers", async (req, res) => {
    try {
      const filters = {
        minBudget: req.query.minBudget ? Number(req.query.minBudget) : void 0,
        maxBudget: req.query.maxBudget ? Number(req.query.maxBudget) : void 0,
        gender: req.query.gender,
        location: req.query.location,
        isFeatured: req.query.featured === "true" ? true : void 0
      };
      const seekers = await storage.getSeekerProfiles(filters);
      res.json(seekers);
    } catch (error) {
      console.error("Error fetching seekers:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.get("/api/seekers/featured", async (req, res) => {
    try {
      const count = req.query.count ? Number(req.query.count) : 4;
      const seekers = await storage.getSeekerProfiles({ isFeatured: true });
      res.json(seekers.slice(0, count));
    } catch (error) {
      console.error("Error fetching featured seekers:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.get("/api/seekers/public", async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 4;
      const seekers = await storage.getSeekerProfiles({
        isPublished: true,
        isActive: true
      });
      res.json(seekers.slice(0, limit));
    } catch (error) {
      console.error("Error fetching public seekers:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.get("/api/seekers/:id", async (req, res) => {
    try {
      const seeker = await storage.getSeekerProfile(req.params.id);
      if (!seeker) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: "Oda arayan profil bulunamad\u0131" });
      }
      res.json(seeker);
    } catch (error) {
      console.error("Error fetching seeker:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.get("/api/seekers/user/:userId", async (req, res) => {
    try {
      const seeker = await storage.getUserSeekerProfile(req.params.userId);
      if (!seeker) {
        return res.status(404).json({ message: "Profil bulunamad\u0131" });
      }
      res.json(seeker);
    } catch (error) {
      console.error("Error fetching user seeker profile:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.post("/api/seekers", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const seekerData = insertSeekerProfileSchema.parse({
        ...req.body,
        userId,
        isPublished: true
        // Auto-publish new seeker profiles
      });
      const seeker = await storage.createSeekerProfile(seekerData);
      res.status(201).json(seeker);
    } catch (error) {
      console.error("Error creating seeker profile:", error);
      const lang = detectLanguage(req);
      if (error.name === "ZodError") {
        res.status(400).json({ message: getErrorMessage("bad_request", lang), error: error.message });
      } else {
        res.status(400).json({ message: "Profil olu\u015Fturulamad\u0131", error: error.message });
      }
    }
  });
  app2.put("/api/seekers/:id", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const seeker = await storage.getSeekerProfile(req.params.id);
      if (!seeker || seeker.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: "Profil bulunamad\u0131 veya yetkiniz yok" });
      }
      const updatedSeeker = await storage.updateSeekerProfile(req.params.id, req.body);
      res.json(updatedSeeker);
    } catch (error) {
      console.error("Error updating seeker profile:", error);
      const lang = detectLanguage(req);
      res.status(400).json({ message: "Profil g\xFCncellenemedi", error: error.message });
    }
  });
  app2.delete("/api/seekers/:id", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const seeker = await storage.getSeekerProfile(req.params.id);
      if (!seeker || seeker.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: "Profil bulunamad\u0131 veya yetkiniz yok" });
      }
      await storage.deleteSeekerProfile(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting seeker profile:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  app2.post("/api/seekers/:id/photos", jwtAuth, seekerUpload.array("photos", 5), async (req, res) => {
    try {
      const userId = req.userId;
      const seeker = await storage.getSeekerProfile(req.params.id);
      if (!seeker || seeker.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: "Profil bulunamad\u0131 veya yetkiniz yok" });
      }
      const files = req.files;
      const existingPhotos = await storage.getSeekerPhotos(req.params.id);
      const { uploadToR2: uploadToR22 } = await Promise.resolve().then(() => (init_r2_utils(), r2_utils_exports));
      const R2_PUBLIC_URL2 = process.env.R2_PUBLIC_URL || process.env.VITE_R2_PUBLIC_URL;
      const photoPromises = files.map(async (file, index2) => {
        const r2Key = `uploads/seekers/${file.filename}`;
        let fullImageUrl = `/${r2Key}`;
        try {
          await uploadToR22(file.path, r2Key);
          if (R2_PUBLIC_URL2) {
            fullImageUrl = `${R2_PUBLIC_URL2}/${r2Key}`;
          }
          console.log(`\u2705 Uploaded to R2: ${fullImageUrl}`);
        } catch (r2Error) {
          console.error(`\u274C R2 upload failed for ${r2Key}:`, r2Error);
        }
        return storage.addSeekerPhoto({
          seekerId: req.params.id,
          imagePath: fullImageUrl,
          sortOrder: existingPhotos.length + index2
        });
      });
      const photos = await Promise.all(photoPromises);
      if (files.length > 0 && !seeker.profilePhotoUrl) {
        const firstPhotoUrl = R2_PUBLIC_URL2 ? `${R2_PUBLIC_URL2}/uploads/seekers/${files[0].filename}` : `/uploads/seekers/${files[0].filename}`;
        await storage.updateSeekerProfile(req.params.id, {
          profilePhotoUrl: firstPhotoUrl
        });
      }
      res.status(201).json(photos);
    } catch (error) {
      console.error("Error adding seeker photos:", error);
      const lang = detectLanguage(req);
      res.status(400).json({ message: "Foto\u011Fraflar eklenemedi", error: error.message });
    }
  });
  app2.delete("/api/seekers/:seekerId/photos/:photoId", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const seeker = await storage.getSeekerProfile(req.params.seekerId);
      if (!seeker || seeker.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: "Profil bulunamad\u0131 veya yetkiniz yok" });
      }
      await storage.deleteSeekerPhoto(req.params.photoId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting seeker photo:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage("database_error", lang) });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs4 from "fs";
import path5 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path4 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path4.resolve(import.meta.dirname, "client", "src"),
      "@shared": path4.resolve(import.meta.dirname, "shared"),
      "@assets": path4.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path4.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path4.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path5.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs4.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path5.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs4.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(path5.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import path6 from "path";
import fs5 from "fs";
import { Client as AppStorage } from "@replit/object-storage";
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use(cookieParser());
var LOCAL_UPLOAD_DIR = path6.join(process.cwd(), "uploads");
fs5.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
var mimeMap = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".json": "application/json"
};
app.get(
  "/uploads/health.txt",
  (_req, res) => res.type("text/plain").send("ok")
);
app.use(
  "/uploads",
  express3.static(LOCAL_UPLOAD_DIR, {
    immutable: true,
    maxAge: "1y",
    setHeaders(res, filePath) {
      const ext = path6.extname(filePath).toLowerCase();
      if (mimeMap[ext]) {
        res.setHeader("Content-Type", mimeMap[ext]);
      }
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  })
);
var OBJECT_STORAGE_ENABLED = process.env.ENABLE_REPLIT_OBJECT_STORAGE === "true";
var bucket = null;
if (OBJECT_STORAGE_ENABLED) {
  try {
    bucket = new AppStorage();
    log("\u2705 Replit Object Storage initialized");
  } catch (err) {
    log(`\u26A0\uFE0F Object Storage initialization failed: ${err.message}`);
    bucket = null;
  }
} else {
  log("\u26A0\uFE0F Replit Object Storage disabled - using Cloudflare R2 and local storage");
}
app.get("/uploads/:folder/:filename", async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const key = `${folder}/${filename}`;
    log(`\u{1F50E} Fetching from storage: ${key}`);
    const localPath = path6.join(LOCAL_UPLOAD_DIR, folder, filename);
    if (fs5.existsSync(localPath)) {
      const ext = path6.extname(filename).toLowerCase();
      const contentType = mimeMap[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return fs5.createReadStream(localPath).pipe(res);
    }
    if (OBJECT_STORAGE_ENABLED && bucket) {
      const result = await bucket.downloadAsBytes(key);
      if (!result.ok || !result.value) {
        log(`\u26A0\uFE0F Not found in Object Storage: ${key}`);
        return res.status(404).send("Not found");
      }
      let fileData;
      if (Buffer.isBuffer(result.value)) {
        fileData = result.value;
      } else if (Array.isArray(result.value)) {
        fileData = Buffer.from(result.value);
      } else {
        fileData = Buffer.from(result.value);
      }
      const ext = path6.extname(filename).toLowerCase();
      const contentType = mimeMap[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Content-Length", fileData.length);
      return res.end(fileData);
    }
    log(`\u26A0\uFE0F Not found locally and object storage disabled: ${key}`);
    return res.status(404).send("Not found");
  } catch (err) {
    log(`\u274C Error serving upload: ${err.message}`);
    res.status(500).type("text/plain").send(`Internal error: ${err.message || "Unknown error"}`);
  }
});
app.use((req, res, next) => {
  const start = Date.now();
  const path7 = req.path;
  let capturedJsonResponse;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    if (path7.startsWith("/api")) {
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path7} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  const isDevelopment = process.env.NODE_ENV?.trim().toLowerCase() !== "production";
  if (isDevelopment) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    { port, host: "0.0.0.0", reusePort: true },
    () => log(`\u2705 Server running on port ${port}`)
  );
})();
