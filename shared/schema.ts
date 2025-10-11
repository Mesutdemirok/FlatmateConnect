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
  
  // Basic Information
  address: text("address").notNull(),
  title: varchar("title").notNull(),
  rentAmount: decimal("rent_amount", { precision: 8, scale: 2 }).notNull(), // Monthly rent
  billsIncluded: boolean("bills_included").default(false), // Utilities included
  
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
  
  // Personal Information
  profilePhotoUrl: varchar("profile_photo_url"), // Profile photo
  fullName: varchar("full_name"), // Combined first and last name
  age: integer("age"),
  gender: varchar("gender"), // Kadın/Erkek/Diğer/Belirtmek İstemiyorum
  status: varchar("status"), // Öğrenci/Çalışan/Serbest/Diğer (occupation/status)
  
  // Search Preferences
  budgetMonthly: decimal("budget_monthly", { precision: 8, scale: 2 }), // Monthly budget
  about: text("about"), // Bio/description
  preferredLocation: text("preferred_location"), // Single location preference
  
  // System fields
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
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
  createdAt: true,
  updatedAt: true,
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

export const insertSeekerProfileSchema = createInsertSchema(seekerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

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
