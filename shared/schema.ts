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
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* ---------------------------------------------------------
   🧠 Sessions
--------------------------------------------------------- */
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

/* ---------------------------------------------------------
   👤 Users
--------------------------------------------------------- */
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  emailVerifiedAt: timestamp("email_verified_at"),
  // Legacy-safe placeholders to prevent migration drift
  email_verification_token: varchar("email_verification_token"),
  email_verification_expires: timestamp("email_verification_expires"),
  is_email_verified: boolean("is_email_verified").default(false),

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
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ---------------------------------------------------------
   🏠 Listings
--------------------------------------------------------- */
export const listings = pgTable(
  "listings",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: varchar("slug").unique(),

    // Basic Info
    title: varchar("title").notNull(),
    description: text("description"),
    address: text("address").notNull(),
    city: varchar("city"),
    citySlug: varchar("city_slug"),
    district: varchar("district"),
    districtSlug: varchar("district_slug"),
    neighborhood: varchar("neighborhood"),
    neighborhoodSlug: varchar("neighborhood_slug"),

    // Pricing
    rentAmount: decimal("rent_amount", { precision: 10, scale: 2 }).notNull(),
    deposit: decimal("deposit", { precision: 10, scale: 2 }),
    billsIncluded: boolean("bills_included").default(false),
    excludedBills: text("excluded_bills")
      .array()
      .default(sql`ARRAY[]::text[]`),

    // Property
    propertyType: varchar("property_type"),
    internetIncluded: boolean("internet_included").default(false),
    totalRooms: integer("total_rooms"),
    bathroomType: varchar("bathroom_type"),

    // Furnishing
    furnishingStatus: varchar("furnishing_status"),
    amenities: text("amenities").array(),

    // Preferences
    totalOccupants: integer("total_occupants"),
    roommatePreference: varchar("roommate_preference"),
    smokingPolicy: varchar("smoking_policy"),

    // Availability
    moveInDate: date("move_in_date"),
    minStayMonths: integer("min_stay_months"),

    // Geo
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),

    // Legacy-safe placeholder
    images: text("images").array(),

    // System
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("IDX_listing_user").on(table.userId)],
);

/* ---------------------------------------------------------
   🖼️ Listing Images
--------------------------------------------------------- */
export const listingImages = pgTable("listing_images", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  imagePath: varchar("image_path").notNull(),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ---------------------------------------------------------
   ⚙️ User Preferences
--------------------------------------------------------- */
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
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

/* ---------------------------------------------------------
   💬 Messages
--------------------------------------------------------- */
export const messages = pgTable("messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: varchar("receiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  listingId: varchar("listing_id").references(() => listings.id, {
    onDelete: "cascade",
  }),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ---------------------------------------------------------
   ❤️ Favorites
--------------------------------------------------------- */
export const favorites = pgTable("favorites", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  listingId: varchar("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ---------------------------------------------------------
   👤 Seeker Profiles
--------------------------------------------------------- */
export const seekerProfiles = pgTable("seeker_profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  slug: varchar("slug").unique(),

  // Personal Info
  profilePhotoUrl: varchar("profile_photo_url"),
  fullName: varchar("full_name"),
  age: integer("age"),
  gender: varchar("gender"),
  occupation: varchar("occupation"),

  // Search & Budget
  budgetMonthly: varchar("budget_monthly"),
  about: text("about"),

  // Structured Location Fields
  city: varchar("city"),
  citySlug: varchar("city_slug"),
  district: varchar("district"),
  districtSlug: varchar("district_slug"),
  neighborhood: varchar("neighborhood"),
  neighborhoodSlug: varchar("neighborhood_slug"),
  preferredLocation: text("preferred_location"),

  // Lifestyle
  isSmoker: varchar("is_smoker"),
  hasPets: varchar("has_pets"),

  // Preferences
  smokingPreference: varchar("smoking_preference"),
  petPreference: varchar("pet_preference"),
  cleanlinessLevel: varchar("cleanliness_level"),
  socialLevel: varchar("social_level"),
  workSchedule: varchar("work_schedule"),
  agePreferenceMin: integer("age_preference_min"),
  agePreferenceMax: integer("age_preference_max"),
  genderPreference: varchar("gender_preference"),

  // System
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ---------------------------------------------------------
   📸 Seeker Photos
--------------------------------------------------------- */
export const seekerPhotos = pgTable("seeker_photos", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  seekerId: varchar("seeker_id")
    .notNull()
    .references(() => seekerProfiles.id, { onDelete: "cascade" }),
  imagePath: varchar("image_path").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ---------------------------------------------------------
   🔗 Relations
--------------------------------------------------------- */
export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  preferences: many(userPreferences),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  favorites: many(favorites),
  seekerProfiles: many(seekerProfiles),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, { fields: [listings.userId], references: [users.id] }),
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

export const seekerProfilesRelations = relations(
  seekerProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [seekerProfiles.userId],
      references: [users.id],
    }),
    photos: many(seekerPhotos),
  }),
);

export const seekerPhotosRelations = relations(seekerPhotos, ({ one }) => ({
  seeker: one(seekerProfiles, {
    fields: [seekerPhotos.seekerId],
    references: [seekerProfiles.id],
  }),
}));

/* ---------------------------------------------------------
   🧾 Schemas
--------------------------------------------------------- */
export const insertListingSchema = createInsertSchema(listings)
  .omit({ id: true, slug: true, createdAt: true, updatedAt: true })
  .extend({
    rentAmount: z.union([z.string(), z.number()]).transform((v) => String(v)),
  });

export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    passwordResetToken: true,
    passwordResetExpires: true,
  })
  .extend({
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
  });

// Base schema for seeker profiles (without refinement)
const baseSeekerProfileSchema = createInsertSchema(seekerProfiles)
  .omit({ id: true, slug: true, createdAt: true, updatedAt: true })
  .extend({
    city: z.string().optional(),
    district: z.string().optional(),
    preferredLocation: z.string().optional(),
    budgetMonthly: z
      .union([z.string(), z.number()])
      .transform((v) => String(v))
      .optional(),
  });

// Insert schema with location validation
export const insertSeekerProfileSchema = baseSeekerProfileSchema
  .refine((d) => (d.city && d.district) || d.preferredLocation, {
    message: "Either (city + district) or preferredLocation is required",
  });

// Update schema without refinement (allows partial updates)
export const updateSeekerProfileSchema = baseSeekerProfileSchema.partial();

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

/* ---------------------------------------------------------
   🧩 Types
--------------------------------------------------------- */
export type User = typeof users.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type ListingImage = typeof listingImages.$inferSelect;
export type SeekerProfile = typeof seekerProfiles.$inferSelect;
export type SeekerPhoto = typeof seekerPhotos.$inferSelect;
export type Message = typeof messages.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type InsertSeekerProfile = z.infer<typeof insertSeekerProfileSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
