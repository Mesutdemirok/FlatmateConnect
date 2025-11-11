import { sql } from 'drizzle-orm';
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
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  emailVerifiedAt: timestamp("email_verified_at"), // Google OAuth will set this
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender"),
  occupation: varchar("occupation"),
  bio: text("bio"),
  verificationStatus: varchar("verification_status").default('unverified'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: varchar("slug").unique(),
  
  // Basic Information
  title: varchar("title").notNull(),
  description: text("description"), // Detailed listing description
  address: text("address").notNull(),
  city: varchar("city"), // İstanbul, Ankara, etc.
  citySlug: varchar("city_slug"), // istanbul, ankara, etc.
  district: varchar("district"), // Kadıköy, Beşiktaş, etc.
  districtSlug: varchar("district_slug"), // kadikoy, besiktas, etc.
  neighborhood: varchar("neighborhood"), // Moda, Cihangir, etc.
  neighborhoodSlug: varchar("neighborhood_slug"), // moda, cihangir, etc.
  rentAmount: decimal("rent_amount", { precision: 8, scale: 2 }).notNull(), // Monthly rent
  deposit: decimal("deposit", { precision: 8, scale: 2 }), // Security deposit
  billsIncluded: boolean("bills_included").default(false), // Utilities included
  excludedBills: text("excluded_bills").array().default(sql`ARRAY[]::text[]`), // Bills not included
  
  // Property Details  
  propertyType: varchar("property_type"), // Rezidans/Apartman/Daire/Müstakil Ev/Diğer
  internetIncluded: boolean("internet_included").default(false),
  totalRooms: integer("total_rooms"), // Total rooms in house
  bathroomType: varchar("bathroom_type"), // Ortak/Özel
  
  // Furnishing
  furnishingStatus: varchar("furnishing_status"), // Eşyalı/Eşyasız/Kısmen Eşyalı
  amenities: text("amenities").array(), // Yatak/Dolap/Masa/Sandalye/Klima/TV/Diğer
  
  // Occupancy & Preferences
  totalOccupants: integer("total_occupants"), // How many people live there
  roommatePreference: varchar("roommate_preference"), // Kadın/Erkek/Farketmez
  smokingPolicy: varchar("smoking_policy"), // İçilebilir/İçilemez/Balkon Dahil İçilemez
  
  // Availability & Terms
  moveInDate: date("move_in_date"), // When room becomes available
  minStayMonths: integer("min_stay_months"), // Minimum stay duration in months
  
  // Location coordinates for map
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  
  // Legacy field (kept for compatibility)
  images: text("images").array(), // Old image storage (replaced by listingImages relation)
  
  // System fields
  status: varchar("status").default('active'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const listingImages = pgTable("listing_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id, { onDelete: 'cascade' }),
  imagePath: varchar("image_path").notNull(),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  smokingPreference: varchar("smoking_preference"),
  petPreference: varchar("pet_preference"),
  cleanlinessLevel: varchar("cleanliness_level"),
  socialLevel: varchar("social_level"),
  workSchedule: varchar("work_schedule"),
  agePreferenceMin: integer("age_preference_min"),
  agePreferenceMax: integer("age_preference_max"),
  genderPreference: varchar("gender_preference"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: varchar("receiver_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  listingId: varchar("listing_id").references(() => listings.id, { onDelete: 'cascade' }),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  listingId: varchar("listing_id").notNull().references(() => listings.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const seekerProfiles = pgTable("seeker_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: varchar("slug").unique(),
  
  // Personal Information
  profilePhotoUrl: varchar("profile_photo_url"), // Profile photo
  fullName: varchar("full_name"), // Combined first and last name
  age: integer("age"),
  gender: varchar("gender"), // Kadın/Erkek/Diğer/Belirtmek İstemiyorum
  occupation: varchar("occupation"), // Öğrenci/Çalışan/Serbest/Diğer
  
  // Search Preferences
  budgetMonthly: varchar("budget_monthly"), // Monthly budget (stored as string to avoid validation issues)
  about: text("about"), // Bio/description
  
  // Location Preferences (structured)
  city: varchar("city"), // İstanbul, Ankara, etc.
  citySlug: varchar("city_slug"), // istanbul, ankara, etc.
  district: varchar("district"), // Kadıköy, Beşiktaş, etc.
  districtSlug: varchar("district_slug"), // kadikoy, besiktas, etc.
  neighborhood: varchar("neighborhood"), // Moda, Cihangir, etc. (optional)
  neighborhoodSlug: varchar("neighborhood_slug"), // moda, cihangir, etc. (optional)
  
  // @deprecated - Use city/district/neighborhood instead. Kept for backward compatibility during migration.
  preferredLocation: text("preferred_location"), // Legacy single location preference
  
  // Personal Lifestyle (about the seeker)
  isSmoker: varchar("is_smoker"), // "true" | "false" - Whether the seeker smokes
  hasPets: varchar("has_pets"), // "true" | "false" - Whether the seeker has pets
  
  // Roommate Preferences (what they want in a roommate)
  smokingPreference: varchar("smoking_preference"), // İçebilir | İçemez | Farketmez
  petPreference: varchar("pet_preference"), // Olabilir | Olmamalı | Farketmez
  cleanlinessLevel: varchar("cleanliness_level"), // very-clean | clean | average | relaxed
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const seekerPhotos = pgTable("seeker_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  seekerId: varchar("seeker_id").notNull().references(() => seekerProfiles.id, { onDelete: 'cascade' }),
  imagePath: varchar("image_path").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  preferences: many(userPreferences),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  favorites: many(favorites),
  seekerProfiles: many(seekerProfiles),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id],
  }),
  images: many(listingImages),
  messages: many(messages),
  favorites: many(favorites),
}));

export const listingImagesRelations = relations(listingImages, ({ one }) => ({
  listing: one(listings, {
    fields: [listingImages.listingId],
    references: [listings.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  listing: one(listings, {
    fields: [messages.listingId],
    references: [listings.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [favorites.listingId],
    references: [listings.id],
  }),
}));

export const seekerProfilesRelations = relations(seekerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [seekerProfiles.userId],
    references: [users.id],
  }),
  photos: many(seekerPhotos),
}));

export const seekerPhotosRelations = relations(seekerPhotos, ({ one }) => ({
  seeker: one(seekerProfiles, {
    fields: [seekerPhotos.seekerId],
    references: [seekerProfiles.id],
  }),
}));

// Schemas
export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  rentAmount: z.union([z.string(), z.number()]).transform(val => String(val)),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertListingImageSchema = createInsertSchema(listingImages).omit({
  id: true,
  createdAt: true,
});

// Base schema without refinement - used for updates
const baseSeekerProfileSchema = createInsertSchema(seekerProfiles).omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Structured location fields
  city: z.string().optional(),
  citySlug: z.string().optional(),
  district: z.string().optional(),
  districtSlug: z.string().optional(),
  neighborhood: z.string().optional(),
  neighborhoodSlug: z.string().optional(),
  // Legacy field - maintained for backward compatibility
  preferredLocation: z.string().regex(/^[\s\S]*$/).optional(),
  budgetMonthly: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  age: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
});

// Create schema with location validation - used for creation
export const insertSeekerProfileSchema = baseSeekerProfileSchema.refine(
  data => (data.city && data.district) || data.preferredLocation,
  { message: "Either (city + district) or preferredLocation is required" }
);

// Update schema without refinement - allows partial updates
export const updateSeekerProfileSchema = baseSeekerProfileSchema;

export const insertSeekerPhotoSchema = createInsertSchema(seekerPhotos).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordResetToken: true,
  passwordResetExpires: true,
}).extend({
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;
export type ListingImage = typeof listingImages.$inferSelect;
export type InsertListingImage = z.infer<typeof insertListingImageSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type SeekerProfile = typeof seekerProfiles.$inferSelect;
export type InsertSeekerProfile = z.infer<typeof insertSeekerProfileSchema>;
export type SeekerPhoto = typeof seekerPhotos.$inferSelect;
export type InsertSeekerPhoto = z.infer<typeof insertSeekerPhotoSchema>;
