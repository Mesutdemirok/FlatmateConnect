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
  uploadBufferToR2: () => uploadBufferToR2,
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
async function uploadBufferToR2(r2Key, buffer, options) {
  const key = r2Key.replace(/^\/+/, "");
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: options?.contentType || "application/octet-stream",
    CacheControl: options?.cacheControl || "public, max-age=31536000, immutable"
  });
  await r2.send(command);
  return key;
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

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default;
var init_vite_config = __esm({
  async "vite.config.ts"() {
    "use strict";
    vite_config_default = defineConfig({
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
          "@": path3.resolve(import.meta.dirname, "client", "src"),
          "@shared": path3.resolve(import.meta.dirname, "shared"),
          "@assets": path3.resolve(import.meta.dirname, "attached_assets")
        }
      },
      root: path3.resolve(import.meta.dirname, "client"),
      build: {
        outDir: path3.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true
      },
      server: {
        fs: {
          strict: true,
          deny: ["**/.*"]
        }
      }
    });
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  log: () => log,
  serveStatic: () => serveStatic,
  setupVite: () => setupVite
});
import express2 from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
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
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
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
  const distPath = path4.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}
var viteLogger;
var init_vite = __esm({
  async "server/vite.ts"() {
    "use strict";
    await init_vite_config();
    viteLogger = createLogger();
  }
});

// server/index.ts
import express4 from "express";
import cookieParser2 from "cookie-parser";
import cors from "cors";
import path6 from "path";

// server/routes.ts
import express3 from "express";
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
  emailVerifiedAt: timestamp("email_verified_at"),
  // Google OAuth will set this
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
  slug: varchar("slug").unique(),
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
  slug: varchar("slug").unique(),
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
  // Personal Lifestyle (about the seeker)
  isSmoker: varchar("is_smoker"),
  // "true" | "false" - Whether the seeker smokes
  hasPets: varchar("has_pets"),
  // "true" | "false" - Whether the seeker has pets
  // Roommate Preferences (what they want in a roommate)
  smokingPreference: varchar("smoking_preference"),
  // İçebilir | İçemez | Farketmez
  petPreference: varchar("pet_preference"),
  // Olabilir | Olmamalı | Farketmez
  cleanlinessLevel: varchar("cleanliness_level"),
  // very-clean | clean | average | relaxed
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
  slug: true,
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
  slug: true,
  createdAt: true,
  updatedAt: true
}).extend({
  preferredLocation: z.string().regex(/^[\s\S]*$/).optional(),
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
if (!connectionString) {
  throw new Error(
    "\u274C Missing DATABASE_URL environment variable. Please set it in your environment settings."
  );
}
var pool = new Pool({ connectionString });
var db = drizzle({ client: pool, schema: schema_exports });
var dbHost = connectionString.split("@")[1]?.split("/")[0] || "unknown";
var isProductionDB = dbHost.includes("ep-green-term-af4ptxe0");
var isDevelopmentDB = dbHost.includes("ep-odd-scene-af56kk3x");
if (isProductionDB) {
  console.log("\u2705 Connected to Production Neon DB");
  console.log(`\u{1F4CD} Database: ${dbHost}`);
} else if (isDevelopmentDB) {
  console.log("\u2705 Connected to Development Neon DB");
  console.log(`\u{1F4CD} Database: ${dbHost}`);
} else {
  console.log("\u2705 Connected to database:", dbHost);
}

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
  async updateUser(id, data) {
    const [user] = await db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
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
  async getListingBySlug(slug) {
    let [listing] = await db.select().from(listings).where(eq(listings.slug, slug));
    if (!listing) {
      [listing] = await db.select().from(listings).where(eq(listings.id, slug));
    }
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
  async getSeekerProfileBySlug(slug) {
    let [profile] = await db.select().from(seekerProfiles).where(eq(seekerProfiles.slug, slug));
    if (!profile) {
      [profile] = await db.select().from(seekerProfiles).where(eq(seekerProfiles.id, slug));
    }
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
    const cookieToken = req.cookies?.auth_token || req.cookies?.token;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : cookieToken;
    console.log("\u{1F510} JWT Auth Check:", {
      hasAuthHeader: !!authHeader,
      hasAuthTokenCookie: !!req.cookies?.auth_token,
      hasTokenCookie: !!req.cookies?.token,
      tokenFound: !!token,
      path: req.path
    });
    if (!token) {
      console.log("\u274C No JWT token found in Authorization header or cookies");
      return res.status(401).json({ message: "Yetkisiz eri\u015Fim" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    console.log("\u2705 JWT verified successfully for user:", decoded.userId);
    next();
  } catch (error) {
    console.error("\u274C JWT verification error:", error);
    return res.status(401).json({ message: "Ge\xE7ersiz veya s\xFCresi dolmu\u015F token" });
  }
};

// server/routes.ts
import multer from "multer";
import path5 from "path";
import fs4 from "fs";

// shared/slug.ts
import slugify from "slugify";
import { customAlphabet } from "nanoid";
var nano = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);
function makeSlug(parts) {
  const base = parts.filter(Boolean).map(
    (p) => slugify(String(p), {
      lower: true,
      strict: true,
      // remove punctuation
      locale: "tr",
      trim: true
    })
  ).filter(Boolean).join("-").replace(/-+/g, "-");
  return `${base}-${nano()}`;
}

// server/routes/oauth.ts
import express from "express";
import * as client from "openid-client";
import jwt2 from "jsonwebtoken";
import { eq as eq2 } from "drizzle-orm";
import cookieParser from "cookie-parser";
var router = express.Router();
router.use(cookieParser());
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
var FRONTEND_URL = process.env.FRONTEND_URL;
var JWT_SECRET2 = process.env.JWT_SECRET;
console.log("\u{1F50D} OAuth Environment Variables:");
console.log(
  "   GOOGLE_CLIENT_ID:",
  GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.slice(0, 20)}...` : "NOT SET"
);
console.log("   GOOGLE_REDIRECT_URI:", GOOGLE_REDIRECT_URI || "NOT SET");
console.log("   FRONTEND_URL:", FRONTEND_URL || "NOT SET");
console.log("   JWT_SECRET:", JWT_SECRET2 ? "SET (hidden)" : "NOT SET");
function getCookieOptions(req, shortLived = false) {
  const isProductionDomain = req.get("host")?.includes("odanet.com.tr");
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: isProductionDomain ? ".odanet.com.tr" : void 0,
    path: "/",
    maxAge: shortLived ? 10 * 60 * 1e3 : 7 * 24 * 60 * 60 * 1e3
    // 10dk veya 7gün
  };
}
router.get("/oauth/google/redirect", async (req, res) => {
  try {
    const config = await client.discovery(
      new URL("https://accounts.google.com"),
      GOOGLE_CLIENT_ID,
      { client_secret: GOOGLE_CLIENT_SECRET }
    );
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();
    res.cookie("code_verifier", codeVerifier, getCookieOptions(req, true));
    res.cookie("oauth_state", state, getCookieOptions(req, true));
    console.log("\u{1F36A} OAuth \xE7erezleri ayarland\u0131 (.odanet.com.tr, SameSite=None)");
    const authUrl = client.buildAuthorizationUrl(config, {
      redirect_uri: GOOGLE_REDIRECT_URI,
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state
    });
    console.log("\u{1F504} Google OAuth'a y\xF6nlendiriliyor...");
    res.redirect(authUrl.href);
  } catch (error) {
    console.error("\u274C OAuth y\xF6nlendirme hatas\u0131:", error);
    res.status(500).json({ message: "Google OAuth ba\u015Flat\u0131lamad\u0131" });
  }
});
router.get("/oauth/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    const codeVerifier = req.cookies?.code_verifier;
    const storedState = req.cookies?.oauth_state;
    console.log("\u{1F510} Google OAuth geri d\xF6n\xFC\u015F\xFC al\u0131nd\u0131");
    console.log("   Gelen state:", state);
    console.log("   Kaydedilen state:", storedState);
    if (!code || typeof code !== "string") {
      console.error("\u274C Google'dan code de\u011Feri gelmedi");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_code`);
    }
    if (!codeVerifier) {
      console.error("\u274C code_verifier \xE7erezi bulunamad\u0131");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_code_verifier`);
    }
    if (!storedState || state !== storedState) {
      console.error("\u274C OAuth state uyu\u015Fmazl\u0131\u011F\u0131");
      res.clearCookie("oauth_state", getCookieOptions(req, true));
      res.clearCookie("code_verifier", getCookieOptions(req, true));
      return res.redirect(`${FRONTEND_URL}/auth?error=state_mismatch`);
    }
    const config = await client.discovery(
      new URL("https://accounts.google.com"),
      GOOGLE_CLIENT_ID,
      { client_secret: GOOGLE_CLIENT_SECRET }
    );
    console.log("\u2705 Google yap\u0131land\u0131rmas\u0131 bulundu");
    const tokens = await client.authorizationCodeGrant(
      config,
      new URL(GOOGLE_REDIRECT_URI),
      {
        pkceCodeVerifier: codeVerifier,
        expectedState: storedState,
        idTokenExpected: true
      }
    );
    console.log("\u2705 Tokenlar al\u0131nd\u0131, kullan\u0131c\u0131 bilgisi getiriliyor...");
    const userinfo = await client.fetchUserInfo(
      config,
      tokens.access_token,
      "sub"
    );
    console.log("\u2705 Google kullan\u0131c\u0131 bilgisi:", {
      email: userinfo.email,
      verified: userinfo.email_verified
    });
    if (!userinfo.email) {
      console.error("\u274C Kullan\u0131c\u0131 e-posta bilgisi yok");
      return res.redirect(`${FRONTEND_URL}/auth?error=no_email`);
    }
    let user = await db.query.users.findFirst({
      where: eq2(users.email, userinfo.email)
    });
    if (!user) {
      console.log("\u2795 Yeni kullan\u0131c\u0131 olu\u015Fturuluyor (Google hesab\u0131ndan)");
      const [newUser] = await db.insert(users).values({
        email: userinfo.email,
        firstName: userinfo.given_name || null,
        lastName: userinfo.family_name || null,
        profileImageUrl: userinfo.picture || null,
        emailVerifiedAt: userinfo.email_verified ? /* @__PURE__ */ new Date() : null
      }).returning();
      user = newUser;
    }
    const token = jwt2.sign({ userId: user.id, email: user.email }, JWT_SECRET2, {
      expiresIn: "7d"
    });
    res.cookie("auth_token", token, getCookieOptions(req));
    console.log("\u{1F36A} auth_token ayarland\u0131 (.odanet.com.tr)");
    res.clearCookie("code_verifier", getCookieOptions(req, true));
    res.clearCookie("oauth_state", getCookieOptions(req, true));
    console.log("\u2705 OAuth ba\u015Far\u0131l\u0131 \u2014 frontend'e y\xF6nlendiriliyor");
    res.redirect(`${FRONTEND_URL}/auth/callback`);
  } catch (error) {
    console.error("\u274C OAuth callback hatas\u0131:", error?.message || error);
    res.redirect(`${FRONTEND_URL}/auth?error=oauth_failed`);
  }
});
var oauth_default = router;

// server/routes/uploads.ts
init_r2_utils();
import { Router } from "express";
import Busboy from "busboy";
import sharp from "sharp";
var router2 = Router();
function badRequest(res, message, extra = {}) {
  res.type("application/json");
  return res.status(400).json({ success: false, message, ...extra });
}
function serverError(res, err, fallback = "Sunucu hatas\u0131.") {
  const msg = err instanceof Error ? err.message : String(err);
  res.type("application/json");
  return res.status(500).json({ success: false, message: fallback, error: msg });
}
function sanityCheckMultipart(req, res) {
  const ct = req.headers["content-type"] || "";
  if (typeof ct !== "string" || !ct.startsWith("multipart/form-data")) {
    badRequest(res, "Ge\xE7ersiz i\xE7erik t\xFCr\xFC. multipart/form-data bekleniyor.");
    return false;
  }
  return true;
}
function makeBusboy(req, res) {
  try {
    return Busboy({ headers: req.headers });
  } catch (e) {
    serverError(res, e, "Y\xFCkleme ba\u015Flat\u0131lamad\u0131.");
    return null;
  }
}
var ALLOWED_MIME = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  ""
  // some browsers omit HEIC mime
]);
var ALLOWED_EXT = /* @__PURE__ */ new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);
var MAX_MB = 10;
var MAX_BYTES = MAX_MB * 1024 * 1024;
router2.post("/seeker-photo", jwtAuth, (req, res) => {
  res.type("application/json");
  if (!sanityCheckMultipart(req, res)) return;
  const bb = makeBusboy(req, res);
  if (!bb) return;
  let hasFile = false;
  let sent = false;
  bb.on("file", (_field, file, info) => {
    hasFile = true;
    const { mimeType, filename } = info;
    const ext = (filename.split(".").pop() || "").toLowerCase();
    const valid = ALLOWED_MIME.has((mimeType || "").toLowerCase()) || ALLOWED_EXT.has(ext);
    if (!valid) {
      file.resume();
      if (!sent) {
        sent = true;
        return badRequest(
          res,
          `Desteklenmeyen dosya format\u0131 (${mimeType || ext}). JPEG/PNG/WebP/HEIC kullan\u0131n.`
        );
      }
      return;
    }
    const chunks = [];
    let total = 0;
    file.on("data", (chunk) => {
      total += chunk.length;
      if (total > MAX_BYTES) file.resume();
      else chunks.push(chunk);
    });
    file.on("end", async () => {
      if (sent) return;
      if (total > MAX_BYTES) {
        sent = true;
        return badRequest(res, `Dosya \xE7ok b\xFCy\xFCk. Maksimum ${MAX_MB}MB y\xFCkleyebilirsiniz.`);
      }
      try {
        const input = Buffer.concat(chunks);
        const processed = await sharp(input).rotate().resize({ width: 1600, withoutEnlargement: true, fit: "inside" }).jpeg({ quality: 82, progressive: true }).toBuffer();
        const key = `seekers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        await uploadBufferToR2(key, processed, {
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000, immutable"
        });
        sent = true;
        return res.status(201).json({
          success: true,
          imagePath: key,
          url: getR2Url(key),
          message: "Foto\u011Fraf ba\u015Far\u0131yla y\xFCklendi."
        });
      } catch (e) {
        if (!sent) {
          sent = true;
          return serverError(res, e, "Foto\u011Fraf i\u015Flenirken hata olu\u015Ftu.");
        }
      }
    });
    file.on("error", (e) => {
      if (!sent) {
        sent = true;
        return serverError(res, e, "Dosya y\xFCklenirken hata olu\u015Ftu.");
      }
    });
  });
  bb.on("finish", () => {
    if (!hasFile && !sent) {
      sent = true;
      return badRequest(res, "Foto\u011Fraf se\xE7ilmedi.");
    }
  });
  bb.on("error", (e) => {
    if (!sent) {
      sent = true;
      return serverError(res, e, "Dosya y\xFCklemesi ba\u015Far\u0131s\u0131z oldu.");
    }
  });
  req.pipe(bb);
});
router2.post("/profile-photo", jwtAuth, (req, res) => {
  res.type("application/json");
  if (!sanityCheckMultipart(req, res)) return;
  const bb = makeBusboy(req, res);
  if (!bb) return;
  let hasFile = false;
  let sent = false;
  bb.on("file", (_field, file, info) => {
    hasFile = true;
    const { mimeType, filename } = info;
    const ext = (filename.split(".").pop() || "").toLowerCase();
    const valid = ALLOWED_MIME.has((mimeType || "").toLowerCase()) || ALLOWED_EXT.has(ext);
    if (!valid) {
      file.resume();
      if (!sent) {
        sent = true;
        return badRequest(res, "Desteklenmeyen dosya format\u0131. JPEG/PNG/WebP/HEIC kullan\u0131n.");
      }
      return;
    }
    const chunks = [];
    let total = 0;
    file.on("data", (chunk) => {
      total += chunk.length;
      if (total > MAX_BYTES) file.resume();
      else chunks.push(chunk);
    });
    file.on("end", async () => {
      if (sent) return;
      if (total > MAX_BYTES) {
        sent = true;
        return badRequest(res, `Dosya \xE7ok b\xFCy\xFCk. Maksimum ${MAX_MB}MB y\xFCkleyebilirsiniz.`);
      }
      try {
        const input = Buffer.concat(chunks);
        const processed = await sharp(input).rotate().resize({ width: 800, height: 800, fit: "cover" }).jpeg({ quality: 85, progressive: true }).toBuffer();
        const key = `profiles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        await uploadBufferToR2(key, processed, {
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000, immutable"
        });
        sent = true;
        return res.status(201).json({
          success: true,
          imagePath: key,
          url: getR2Url(key),
          message: "Profil foto\u011Fraf\u0131 ba\u015Far\u0131yla y\xFCklendi."
        });
      } catch (e) {
        if (!sent) {
          sent = true;
          return serverError(res, e, "Foto\u011Fraf i\u015Flenirken hata olu\u015Ftu.");
        }
      }
    });
    file.on("error", (e) => {
      if (!sent) {
        sent = true;
        return serverError(res, e, "Dosya y\xFCklenirken hata olu\u015Ftu.");
      }
    });
  });
  bb.on("finish", () => {
    if (!hasFile && !sent) {
      sent = true;
      return badRequest(res, "Foto\u011Fraf se\xE7ilmedi.");
    }
  });
  bb.on("error", (e) => {
    if (!sent) {
      sent = true;
      return serverError(res, e, "Dosya y\xFCklemesi ba\u015Far\u0131s\u0131z oldu.");
    }
  });
  req.pipe(bb);
});
router2.post("/listings/:id/images", jwtAuth, async (req, res) => {
  res.type("application/json");
  const listingId = req.params.id;
  const userId = req.userId;
  try {
    const listing = await storage.getListing(listingId);
    if (!listing) return badRequest(res, "\u0130lan bulunamad\u0131");
    if (listing.userId !== userId)
      return res.status(403).json({
        success: false,
        message: "Bu ilana resim y\xFCkleme yetkiniz yok."
      });
  } catch (e) {
    return serverError(res, e, "\u0130lan do\u011Frulanamad\u0131.");
  }
  if (!sanityCheckMultipart(req, res)) return;
  const bb = makeBusboy(req, res);
  if (!bb) return;
  const uploaded = [];
  let filesProcessing = 0;
  let filesFinished = 0;
  let sent = false;
  const maybeFlush = () => {
    if (!sent && filesProcessing > 0 && filesFinished === filesProcessing) {
      sent = true;
      return res.status(201).json({
        success: true,
        images: uploaded,
        count: uploaded.length
      });
    }
  };
  bb.on("file", async (_field, file, info) => {
    filesProcessing++;
    const { mimeType, filename } = info;
    const ext = (filename.split(".").pop() || "").toLowerCase();
    const valid = ALLOWED_MIME.has((mimeType || "").toLowerCase()) || ALLOWED_EXT.has(ext);
    if (!valid) {
      file.resume();
      filesFinished++;
      return maybeFlush();
    }
    const chunks = [];
    let total = 0;
    file.on("data", (chunk) => {
      total += chunk.length;
      if (total > MAX_BYTES) file.resume();
      else chunks.push(chunk);
    });
    file.on("end", async () => {
      try {
        if (total > MAX_BYTES) {
          filesFinished++;
          return maybeFlush();
        }
        const input = Buffer.concat(chunks);
        const processed = await sharp(input).rotate().resize({ width: 1600, withoutEnlargement: true, fit: "inside" }).jpeg({ quality: 82, progressive: true }).toBuffer();
        const key = `listings/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        await uploadBufferToR2(key, processed, {
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000, immutable"
        });
        try {
          await storage.addListingImage({
            listingId,
            imagePath: key,
            isPrimary: uploaded.length === 0
          });
        } catch (dbErr) {
          console.error("DB save error (listing image):", dbErr);
        }
        uploaded.push({ imagePath: key, url: getR2Url(key) });
        filesFinished++;
        return maybeFlush();
      } catch (e) {
        console.error("Image processing error:", e);
        filesFinished++;
        return maybeFlush();
      }
    });
    file.on("error", (e) => {
      console.error("File stream error:", e);
      filesFinished++;
      return maybeFlush();
    });
  });
  bb.on("finish", () => {
    if (!sent && filesProcessing === 0) {
      sent = true;
      return badRequest(res, "Resim se\xE7ilmedi.");
    }
  });
  bb.on("error", (e) => {
    if (!sent) {
      sent = true;
      return serverError(res, e, "Dosya y\xFCklemesi ba\u015Far\u0131s\u0131z oldu.");
    }
  });
  req.pipe(bb);
});
router2.use((err, _req, res, _next) => {
  const code = err?.status || 500;
  res.type("application/json");
  res.status(code).json({
    success: false,
    message: "\u0130stek i\u015Flenemedi.",
    error: err?.message || String(err)
  });
});
var uploads_default = router2;

// server/routes.ts
var uploadDir = "uploads/listings";
fs4.mkdirSync(uploadDir, { recursive: true });
var seekerUploadDir = "uploads/seekers";
fs4.mkdirSync(seekerUploadDir, { recursive: true });
var upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + unique + path5.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Ge\xE7ersiz dosya t\xFCr\xFC"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});
var seekerUpload = multer({
  storage: multer.diskStorage({
    destination: seekerUploadDir,
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "seeker-" + unique + path5.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Ge\xE7ersiz dosya t\xFCr\xFC"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});
function getCookieOptions2(req) {
  const isProductionDomain = req.get("host")?.includes("odanet.com.tr");
  return {
    httpOnly: true,
    secure: true,
    // Always secure (HTTPS enforced via trust proxy)
    sameSite: "none",
    // Required for OAuth cross-site cookies
    domain: isProductionDomain ? ".odanet.com.tr" : void 0,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1e3
    // 7 days
  };
}
async function registerRoutes(app2) {
  app2.use("/uploads", express3.static("uploads"));
  app2.use("/api", oauth_default);
  app2.use("/api/uploads", uploads_default);
  app2.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      env: process.env.NODE_ENV || "development",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(userData.email);
      if (existing)
        return res.status(400).json({ message: "Bu e-posta zaten kay\u0131tl\u0131" });
      const hashed = await hashPassword(userData.password);
      const user = await storage.createUser({ ...userData, password: hashed });
      const token = generateToken(user.id, user.email);
      res.cookie("auth_token", token, getCookieOptions2(req));
      const { password, ...safeUser } = user;
      res.status(201).json({ user: safeUser, token });
    } catch (err) {
      console.error("\u274C Register Error:", err);
      res.status(500).json({ message: "Kay\u0131t ba\u015Far\u0131s\u0131z" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "E-posta ve \u015Fifre gerekli" });
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password)
        return res.status(401).json({ message: "Ge\xE7ersiz bilgiler" });
      const match = await comparePassword(password, user.password);
      if (!match) return res.status(401).json({ message: "Ge\xE7ersiz bilgiler" });
      const token = generateToken(user.id, user.email);
      res.cookie("auth_token", token, getCookieOptions2(req));
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } catch (err) {
      console.error("\u274C Login Error:", err);
      res.status(500).json({ message: "Giri\u015F ba\u015Far\u0131s\u0131z" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    const options = getCookieOptions2(req);
    res.clearCookie("auth_token", { ...options, path: "/" });
    console.log("\u{1F6AA} Kullan\u0131c\u0131 \xE7\u0131k\u0131\u015F yapt\u0131, \xE7erez silindi");
    res.json({ message: "\xC7\u0131k\u0131\u015F yap\u0131ld\u0131" });
  });
  app2.get("/api/auth/me", jwtAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user)
        return res.status(404).json({ message: "Kullan\u0131c\u0131 bulunamad\u0131" });
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      res.status(500).json({ message: "Kullan\u0131c\u0131 bilgisi al\u0131namad\u0131" });
    }
  });
  app2.patch("/api/users/profile", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const { firstName, lastName, profileImageUrl, phone, bio } = req.body;
      const updateData = {};
      if (firstName !== void 0) updateData.firstName = firstName;
      if (lastName !== void 0) updateData.lastName = lastName;
      if (profileImageUrl !== void 0) updateData.profileImageUrl = profileImageUrl;
      if (phone !== void 0) updateData.phone = phone;
      if (bio !== void 0) updateData.bio = bio;
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "Kullan\u0131c\u0131 bulunamad\u0131" });
      }
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (err) {
      console.error("\u274C Profile update error:", err);
      res.status(500).json({ message: "Profil g\xFCncellenemedi" });
    }
  });
  app2.get("/api/listings", async (req, res) => {
    try {
      const listings2 = await storage.getListings({});
      res.json(listings2);
    } catch (err) {
      res.status(500).json({ message: "Veritaban\u0131 hatas\u0131" });
    }
  });
  app2.post("/api/listings", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const data = insertListingSchema.parse({ ...req.body, userId });
      const slug = makeSlug([data.title, data.address]);
      const listing = await storage.createListing({ ...data, slug });
      res.status(201).json(listing);
    } catch (err) {
      res.status(400).json({ message: "\u0130lan olu\u015Fturulamad\u0131" });
    }
  });
  app2.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "\u0130lan bulunamad\u0131" });
      }
      res.json(listing);
    } catch (err) {
      console.error("\u274C Error fetching listing by ID:", err);
      res.status(500).json({ message: "\u0130lan getirilemedi" });
    }
  });
  app2.put("/api/listings/:id", jwtAuth, async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing || listing.userId !== req.userId) {
        return res.status(403).json({ message: "Yetkiniz yok" });
      }
      const { userId: _, id: __, ...requestData } = req.body;
      const data = insertListingSchema.partial().parse(requestData);
      const slug = data.title || data.address ? makeSlug([data.title || listing.title, data.address || listing.address]) : listing.slug;
      const updateData = { ...data, slug };
      const updated = await storage.updateListing(req.params.id, updateData);
      res.json(updated);
    } catch (err) {
      console.error("\u274C Error updating listing:", err);
      res.status(400).json({ message: err.message || "\u0130lan g\xFCncellenemedi" });
    }
  });
  app2.delete("/api/listings/:id", jwtAuth, async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing || listing.userId !== req.userId)
        return res.status(403).json({ message: "Yetkiniz yok" });
      await storage.deleteListing(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "\u0130lan silinemedi" });
    }
  });
  app2.get("/api/listings/slug/:slug", async (req, res) => {
    try {
      const listing = await storage.getListingBySlug(req.params.slug);
      if (!listing) {
        return res.status(404).json({ message: "\u0130lan bulunamad\u0131" });
      }
      res.json(listing);
    } catch (err) {
      console.error("\u274C Error fetching listing by slug:", err);
      res.status(500).json({ message: "\u0130lan getirilemedi" });
    }
  });
  app2.get("/api/seekers/public", async (req, res) => {
    try {
      const seekers = await storage.getSeekerProfiles({
        isPublished: true,
        isActive: true
      });
      res.json(seekers);
    } catch (err) {
      console.error("\u274C /api/seekers/public error:", err);
      res.status(500).json({ message: "Veritaban\u0131 hatas\u0131" });
    }
  });
  app2.get("/api/seekers/slug/:slug", async (req, res) => {
    try {
      const seeker = await storage.getSeekerProfileBySlug(req.params.slug);
      if (!seeker) {
        return res.status(404).json({ message: "Profil bulunamad\u0131" });
      }
      res.json(seeker);
    } catch (err) {
      console.error("\u274C Error fetching seeker by slug:", err);
      res.status(500).json({ message: "Profil getirilemedi" });
    }
  });
  app2.get("/api/seekers/user/:userId", jwtAuth, async (req, res) => {
    try {
      const seeker = await storage.getUserSeekerProfile(req.params.userId);
      if (!seeker) {
        return res.status(404).json({ message: "Profil bulunamad\u0131" });
      }
      res.json(seeker);
    } catch (err) {
      console.error("\u274C Error fetching user seeker profile:", err);
      res.status(500).json({ message: "Profil getirilemedi" });
    }
  });
  app2.post("/api/seekers", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const data = insertSeekerProfileSchema.parse({ ...req.body, userId });
      const slug = makeSlug([data.fullName || "", data.preferredLocation || ""]);
      const seeker = await storage.createSeekerProfile({
        ...data,
        slug,
        isActive: true,
        isPublished: true
      });
      res.status(201).json(seeker);
    } catch (err) {
      console.error("\u274C Error creating seeker profile:", err);
      res.status(400).json({ message: err.message || "Profil olu\u015Fturulamad\u0131" });
    }
  });
  app2.put("/api/seekers/:id", jwtAuth, async (req, res) => {
    try {
      const seeker = await storage.getSeekerProfile(req.params.id);
      if (!seeker || seeker.userId !== req.userId) {
        return res.status(403).json({ message: "Yetkiniz yok" });
      }
      const data = insertSeekerProfileSchema.parse(req.body);
      const slug = makeSlug([data.fullName || seeker.fullName || "", data.preferredLocation || seeker.preferredLocation || ""]);
      const updateData = { ...data, slug };
      const updated = await storage.updateSeekerProfile(req.params.id, updateData);
      res.json(updated);
    } catch (err) {
      console.error("\u274C Error updating seeker profile:", err);
      res.status(400).json({ message: err.message || "Profil g\xFCncellenemedi" });
    }
  });
  app2.delete("/api/seekers/:id", jwtAuth, async (req, res) => {
    try {
      const seeker = await storage.getSeekerProfile(req.params.id);
      if (!seeker || seeker.userId !== req.userId) {
        return res.status(403).json({ message: "Yetkiniz yok" });
      }
      await storage.deleteSeekerProfile(req.params.id);
      res.status(204).send();
    } catch (err) {
      console.error("\u274C Error deleting seeker profile:", err);
      res.status(500).json({ message: "Profil silinemedi" });
    }
  });
  app2.post("/api/uploads/seeker-photo", jwtAuth, seekerUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const imagePath = `/uploads/seekers/${req.file.filename}`;
      const imageUrl = `${req.protocol}://${req.get("host")}${imagePath}`;
      console.log("\u2705 Seeker photo uploaded:", {
        filename: req.file.filename,
        path: imagePath,
        url: imageUrl
      });
      res.status(200).json({
        success: true,
        imagePath,
        url: imageUrl,
        message: "Photo uploaded successfully"
      });
    } catch (err) {
      console.error("\u274C Error uploading seeker photo:", err);
      res.status(500).json({ error: err.message || "Photo upload failed" });
    }
  });
  app2.delete("/api/seekers/:id/photo", jwtAuth, async (req, res) => {
    try {
      const seeker = await storage.getSeekerProfile(req.params.id);
      if (!seeker || seeker.userId !== req.userId) {
        return res.status(403).json({ message: "Yetkiniz yok" });
      }
      await storage.updateSeekerProfile(req.params.id, { profilePhotoUrl: null });
      res.json({ message: "Foto\u011Fraf silindi" });
    } catch (err) {
      console.error("\u274C Error deleting seeker photo:", err);
      res.status(500).json({ message: "Foto\u011Fraf silinemedi" });
    }
  });
  app2.get("/api/my-listings", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const listings2 = await storage.getUserListings(userId);
      res.json(listings2);
    } catch (err) {
      console.error("\u274C Error fetching my listings:", err);
      res.status(500).json({ message: "\u0130lanlar y\xFCklenemedi" });
    }
  });
  app2.get("/api/conversations", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (err) {
      console.error("\u274C Error fetching conversations:", err);
      res.status(500).json({ message: "Konu\u015Fmalar y\xFCklenemedi" });
    }
  });
  app2.get("/api/messages/:userId", jwtAuth, async (req, res) => {
    try {
      const currentUserId = req.userId;
      const otherUserId = req.params.userId;
      const listingId = req.query.listingId;
      const messages2 = await storage.getMessages(currentUserId, otherUserId, listingId);
      res.json(messages2);
    } catch (err) {
      console.error("\u274C Error fetching messages:", err);
      res.status(500).json({ message: "Mesajlar y\xFCklenemedi" });
    }
  });
  app2.post("/api/messages", jwtAuth, async (req, res) => {
    try {
      const senderId = req.userId;
      const data = insertMessageSchema.parse({ ...req.body, senderId });
      const message = await storage.sendMessage(data);
      res.status(201).json(message);
    } catch (err) {
      console.error("\u274C Error sending message:", err);
      res.status(400).json({ message: err.message || "Mesaj g\xF6nderilemedi" });
    }
  });
  app2.patch("/api/messages/:id/read", jwtAuth, async (req, res) => {
    try {
      await storage.markMessageAsRead(req.params.id);
      res.json({ message: "Mesaj okundu olarak i\u015Faretlendi" });
    } catch (err) {
      console.error("\u274C Error marking message as read:", err);
      res.status(500).json({ message: "\u0130\u015Flem ba\u015Far\u0131s\u0131z" });
    }
  });
  const httpServer = createServer(app2);
  const { setupVite: setupVite2, serveStatic: serveStatic2 } = await init_vite().then(() => vite_exports);
  if (process.env.NODE_ENV === "production") {
    serveStatic2(app2);
  } else {
    await setupVite2(app2, httpServer);
  }
  return httpServer;
}

// server/index.ts
import { fileURLToPath } from "url";
import { dirname } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var app = express4();
app.get("/health", (_req, res) => res.status(200).send("ok"));
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Backend running fine \u2705" });
});
app.use(express4.json());
app.use(express4.urlencoded({ extended: false }));
app.use(cookieParser2());
app.use(
  cors({
    origin: [
      "https://www.odanet.com.tr",
      "https://odanet.com.tr",
      "https://flatmate-connect-1-mesudemirok.replit.app"
    ],
    credentials: true
  })
);
app.use("/uploads", express4.static(path6.join(__dirname, "../uploads")));
app.use("/api/uploads", uploads_default);
(async () => {
  try {
    const server = await registerRoutes(app);
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = "0.0.0.0";
    server.listen(port, host, () => {
      console.log(`\u2705 Odanet backend running on port ${port}`);
      console.log(`\u{1F310} Accessible at: http://localhost:${port}`);
    });
  } catch (err) {
    console.error("\u274C Server startup error:", err);
    process.exit(1);
  }
})();
app.use(
  (err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      message: "Beklenmeyen sunucu hatas\u0131.",
      error: err?.message || err
    });
  }
);
