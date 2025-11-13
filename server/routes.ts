import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { jwtAuth, generateToken, hashPassword, comparePassword } from "./auth";
import {
  insertListingSchema,
  insertUserPreferencesSchema,
  insertMessageSchema,
  insertFavoriteSchema,
  insertUserSchema,
  insertSeekerProfileSchema,
} from "@shared/schema";
import { getErrorMessage, detectLanguage } from "./i18n";
import multer from "multer";
import path from "path";
import fs from "fs";
import { makeSlug } from "@shared/slug";
import oauthRouter from "./routes/oauth";
import uploadsRouter from "./routes/uploads";
import { calculateProfileScore } from "./utils/profileScore";

/* -------------------------------------------------------
   🧰 File Upload Setup
------------------------------------------------------- */
const uploadDir = "uploads/listings";
fs.mkdirSync(uploadDir, { recursive: true });

const seekerUploadDir = "uploads/seekers";
fs.mkdirSync(seekerUploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + unique + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Geçersiz dosya türü"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const seekerUpload = multer({
  storage: multer.diskStorage({
    destination: seekerUploadDir,
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "seeker-" + unique + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Geçersiz dosya türü"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* -------------------------------------------------------
   🔐 Cookie Setup
------------------------------------------------------- */
function getCookieOptions(req: express.Request) {
  const isProductionDomain = req.get("host")?.includes("odanet.com.tr");
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    domain: isProductionDomain ? ".odanet.com.tr" : undefined,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

/* -------------------------------------------------------
   🚀 Main Server
------------------------------------------------------- */
export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/uploads", express.static("uploads"));
  app.use("/api", oauthRouter);
  app.use("/api/uploads", uploadsRouter);

  /* -------------------------------------------------------
     🩺 Health Check
  ------------------------------------------------------- */
  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      env: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    });
  });

  /* -------------------------------------------------------
     🏠 Mixed Feed (Listings + Seekers)
  ------------------------------------------------------- */
  app.get("/api/feed", async (req, res) => {
    try {
      const [listings, seekers] = await Promise.all([
        storage.getFeedListings(25),
        storage.getFeedSeekers(25),
      ]);

      // Map listings to FeedItem shape
      const listingItems = listings.map((listing) => ({
        type: 'listing' as const,
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        suburb: listing.district ?? listing.neighborhood ?? listing.city,
        rentAmount: listing.rentAmount,
        totalOccupants: listing.totalOccupants,
        roommatePreference: listing.roommatePreference,
        furnishingStatus: listing.furnishingStatus,
        images: listing.images,
        createdAt: listing.createdAt,
      }));

      // Map seekers to FeedItem shape
      const seekerItems = seekers.map((seeker) => ({
        type: 'seeker' as const,
        id: seeker.id,
        slug: seeker.slug,
        displayName: seeker.fullName,
        budgetMonthly: seeker.budgetMonthly ? parseFloat(seeker.budgetMonthly) : null,
        preferredLocation: seeker.preferredLocation,
        photoUrl: seeker.profilePhotoUrl,
        age: seeker.age,
        occupation: seeker.occupation,
        createdAt: seeker.createdAt,
      }));

      // Merge and sort by createdAt DESC
      const combinedFeed = [...listingItems, ...seekerItems]
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 40); // Limit to 40 items total

      // Remove createdAt from response (used only for sorting)
      const feedItems = combinedFeed.map(({ createdAt, ...item }) => item);

      res.json(feedItems);
    } catch (err: any) {
      console.error("❌ /api/feed error:", err);
      res.status(500).json({ message: "Feed yüklenemedi" });
    }
  });

  /* -------------------------------------------------------
     👤 Authentication Routes
  ------------------------------------------------------- */
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(userData.email);
      if (existing)
        return res.status(400).json({ message: "Bu e-posta zaten kayıtlı" });

      const hashed = await hashPassword(userData.password);
      const user = await storage.createUser({ ...userData, password: hashed });
      const token = generateToken(user.id, user.email);

      res.cookie("auth_token", token, getCookieOptions(req));
      const { password, ...safeUser } = user;
      res.status(201).json({ user: safeUser, token });
    } catch (err: any) {
      console.error("❌ Register Error:", err);
      res.status(500).json({
        message: "Kayıt başarısız",
        error: err.message || JSON.stringify(err),
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "E-posta ve şifre gerekli" });

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password)
        return res.status(401).json({ message: "Geçersiz bilgiler" });

      const match = await comparePassword(password, user.password);
      if (!match) return res.status(401).json({ message: "Geçersiz bilgiler" });

      const token = generateToken(user.id, user.email);
      res.cookie("auth_token", token, getCookieOptions(req));

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } catch (err) {
      console.error("❌ Login Error:", err);
      res.status(500).json({ message: "Giriş başarısız" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const options = getCookieOptions(req);
    res.clearCookie("auth_token", { ...options, path: "/" });
    res.json({ message: "Çıkış yapıldı" });
  });

  app.get("/api/auth/me", jwtAuth, async (req, res) => {
    try {
      const [user, prefs] = await Promise.all([
        storage.getUser(req.userId!),
        storage.getUserPreferences(req.userId!),
      ]);
      if (!user)
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      const { password, ...safeUser } = user;
      const profileScore = calculateProfileScore(user, prefs);
      res.json({ ...safeUser, profileScore });
    } catch {
      res.status(500).json({ message: "Kullanıcı bilgisi alınamadı" });
    }
  });

  /* -------------------------------------------------------
     🧍 Seeker Profiles
  ------------------------------------------------------- */
  // ✅ PUBLIC route for homepage
  app.get("/api/seekers", async (req, res) => {
    try {
      const seekers = await storage.getSeekerProfiles({
        isPublished: true,
        isActive: true,
      });
      res.status(200).json({ seekers });
    } catch (err: any) {
      console.error("❌ /api/seekers error:", err);
      res.status(500).json({ message: "Veritabanı hatası" });
    }
  });

  // ✅ ALSO PUBLIC (removed jwtAuth)
  app.get("/api/users/seekers", async (req, res) => {
    try {
      const seekers = await storage.getSeekerProfiles({
        isPublished: true,
        isActive: true,
      });
      res.json({ seekers });
    } catch (err: any) {
      console.error("❌ /api/users/seekers error:", err);
      res.status(500).json({ message: "Veritabanı hatası" });
    }
  });

  // ✅ PUBLIC route for web frontend (returns plain array, not wrapped)
  app.get("/api/seekers/public", async (req, res) => {
    try {
      // Extract filter parameters from query string
      const filters: any = {
        isPublished: true,
        isActive: true,
      };
      
      if (req.query.location) filters.location = String(req.query.location);
      if (req.query.minBudget) filters.minBudget = String(req.query.minBudget);
      if (req.query.maxBudget) filters.maxBudget = String(req.query.maxBudget);
      
      const seekers = await storage.getSeekerProfiles(filters);
      res.json(seekers); // Return array directly, not {seekers: [...]}
    } catch (err: any) {
      console.error("❌ /api/seekers/public error:", err);
      res.status(500).json({ message: "Veritabanı hatası" });
    }
  });

  // Get seeker by slug (must come before /:id to avoid shadowing)
  app.get("/api/seekers/slug/:slug", async (req, res) => {
    try {
      const seeker = await storage.getSeekerProfileBySlug(req.params.slug);
      if (!seeker || !seeker.isPublished || !seeker.isActive) {
        return res.status(404).json({ message: "Profil bulunamadı" });
      }
      res.json(seeker); // Return flat seeker object
    } catch (err: any) {
      console.error("❌ /api/seekers/slug/:slug error:", err);
      res.status(500).json({ message: "Veritabanı hatası" });
    }
  });

  // Get seeker by ID (PUBLIC) - UUID format only to avoid conflicts
  app.get("/api/seekers/:id", async (req, res) => {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ message: "Geçersiz ID formatı" });
      }
      
      const seeker = await storage.getSeekerProfile(req.params.id);
      if (!seeker || !seeker.isPublished || !seeker.isActive) {
        return res.status(404).json({ message: "Profil bulunamadı" });
      }
      res.json(seeker);
    } catch (err: any) {
      console.error("❌ /api/seekers/:id error:", err);
      res.status(500).json({ message: "Veritabanı hatası" });
    }
  });

  // Create seeker profile (photo required)
  app.post("/api/seekers", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      
      // Check profile completion score
      const [user, prefs] = await Promise.all([
        storage.getUser(userId),
        storage.getUserPreferences(userId),
      ]);
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      
      const score = calculateProfileScore(user, prefs);
      if (score < 60) {
        return res.status(422).json({
          success: false,
          message: "Profiliniz %60 tamamlanmadan ilan oluşturamazsınız.",
          score,
          profileUrl: "/profile"
        });
      }
      
      const data = insertSeekerProfileSchema.parse({ ...req.body, userId });
      
      // ✅ Enforce mandatory photo requirement
      if (!data.profilePhotoUrl || data.profilePhotoUrl.trim() === "") {
        return res.status(400).json({
          message: "Profil fotoğrafı eklenmeden ilan yayınlanamaz.",
        });
      }
      
      // Generate slug from fullName + preferredLocation, fallback to userId
      const slugParts = [
        data.fullName || "",
        data.preferredLocation || "",
      ].filter(Boolean);
      const slug = slugParts.length > 0 
        ? makeSlug(slugParts) 
        : makeSlug([userId]);
      
      // Create profile with default values from schema (isActive: true, isPublished: true)
      const profile = await storage.createSeekerProfile({ 
        ...data, 
        slug,
      });
      res.status(201).json(profile);
    } catch (err: any) {
      console.error("❌ Create seeker profile error:", err);
      res.status(400).json({ 
        message: err.message || "Profil oluşturulamadı" 
      });
    }
  });

  // Update seeker profile (photo required if changing)
  app.put("/api/seekers/:id", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const profileId = req.params.id;
      
      // Verify ownership
      const existing = await storage.getSeekerProfile(profileId);
      if (!existing || existing.user.id !== userId) {
        return res.status(404).json({ message: "Profil bulunamadı" });
      }
      
      const data = insertSeekerProfileSchema.partial().parse(req.body);
      
      // If updating profilePhotoUrl, ensure it's not empty
      if ("profilePhotoUrl" in data) {
        if (!data.profilePhotoUrl || data.profilePhotoUrl.trim() === "") {
          return res.status(400).json({
            message: "Profil fotoğrafı boş olamaz.",
          });
        }
      }
      
      // Re-generate slug if name or location changed
      let updatedSlug: string | undefined;
      if (data.fullName || data.preferredLocation) {
        const slugParts = [
          data.fullName || existing.fullName || "",
          data.preferredLocation || existing.preferredLocation || "",
        ].filter(Boolean);
        updatedSlug = slugParts.length > 0 ? makeSlug(slugParts) : (existing.slug ?? undefined);
      }
      
      const profile = await storage.updateSeekerProfile(profileId, { 
        ...data,
        ...(updatedSlug && { slug: updatedSlug })
      });
      res.status(200).json(profile);
    } catch (err: any) {
      console.error("❌ Update seeker profile error:", err);
      res.status(400).json({ 
        message: err.message || "Profil güncellenemedi" 
      });
    }
  });

  app.get("/api/users/:userId", jwtAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user)
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch {
      res.status(500).json({ message: "Kullanıcı bilgisi alınamadı" });
    }
  });

  // Update current user's profile
  app.patch("/api/users/me", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const allowedFields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'occupation', 'bio', 'profileImageUrl', 'city'];
      const updates: any = {};
      
      // Only allow specific fields to be updated
      for (const field of allowedFields) {
        if (field in req.body) {
          updates[field] = req.body[field];
        }
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (err: any) {
      console.error("❌ Update user error:", err);
      res.status(400).json({ 
        message: err.message || "Profil güncellenemedi" 
      });
    }
  });

  /* -------------------------------------------------------
     🎨 User Preferences
  ------------------------------------------------------- */
  // Get current user's preferences
  app.get("/api/user-preferences", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences || null);
    } catch (err: any) {
      console.error("❌ Get user preferences error:", err);
      res.status(500).json({ message: "Tercihler alınamadı" });
    }
  });

  // Create or update user preferences
  app.post("/api/user-preferences", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const data = insertUserPreferencesSchema.parse({ ...req.body, userId });
      const preferences = await storage.upsertUserPreferences(data);
      
      // Invalidate the user cache to refresh profile score
      res.json(preferences);
    } catch (err: any) {
      console.error("❌ Upsert user preferences error:", err);
      res.status(400).json({ 
        message: err.message || "Tercihler kaydedilemedi" 
      });
    }
  });

  // Get seeker profile for the current authenticated user
  app.get("/api/seekers/user/:userId", jwtAuth, async (req, res) => {
    try {
      const authenticatedUserId = req.userId!;
      const requestedUserId = req.params.userId;
      
      // Security: Only allow users to fetch their own seeker profile
      if (authenticatedUserId !== requestedUserId) {
        return res.status(403).json({ message: "Yetkiniz yok" });
      }
      
      // Don't filter by isActive to show drafts/inactive profiles to owner
      const seekers = await storage.getSeekerProfiles({ 
        userId: requestedUserId,
        _skipActiveCheck: true // Special flag to bypass isActive filter
      });
      
      if (!seekers || seekers.length === 0) {
        return res.status(404).json({ message: "Profil bulunamadı" });
      }
      res.json(seekers[0]); // Return first (should be only one) seeker profile
    } catch (err: any) {
      console.error("❌ /api/seekers/user/:userId error:", err);
      res.status(500).json({ message: "Veritabanı hatası" });
    }
  });

  /* -------------------------------------------------------
     🏠 Listings
  ------------------------------------------------------- */
  app.get("/api/listings", async (req, res) => {
    try {
      const listings = await storage.getListings({});
      res.json(listings);
    } catch (err: any) {
      console.error("❌ /api/listings error:", err);
      res.status(500).json({ message: "Veritabanı hatası" });
    }
  });

  // Get current user's listings (including drafts/inactive)
  app.get("/api/my-listings", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const listings = await storage.getListings({ 
        userId,
        _skipStatusFilter: true // Show all user's listings including drafts
      });
      res.json(listings);
    } catch (err: any) {
      console.error("❌ /api/my-listings error:", err);
      res.status(500).json({ message: "Veritabanı hatası" });
    }
  });

  // Get listing by slug (must come before /:id to avoid route conflict)
  app.get("/api/listings/slug/:slug", async (req, res) => {
    try {
      const listing = await storage.getListingBySlug(req.params.slug);
      if (!listing || listing.status !== "active") {
        return res.status(404).json({ message: "İlan bulunamadı" });
      }
      res.json(listing); // Return flat listing object
    } catch (err: any) {
      console.error("❌ /api/listings/slug/:slug error:", err);
      res.status(500).json({ message: "Veritabanı hatası" });
    }
  });

  // Get listing by ID
  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "İlan bulunamadı" });
      }
      res.json(listing); // Return flat listing object
    } catch (err: any) {
      console.error("❌ /api/listings/:id error:", err);
      res.status(500).json({ message: "Veritabanı hatası" });
    }
  });

  // Create listing (images uploaded separately afterward)
  app.post("/api/listings", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      
      // Check profile completion score
      const [user, prefs] = await Promise.all([
        storage.getUser(userId),
        storage.getUserPreferences(userId),
      ]);
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      
      const score = calculateProfileScore(user, prefs);
      if (score < 60) {
        return res.status(422).json({
          success: false,
          message: "Profiliniz %60 tamamlanmadan ilan oluşturamazsınız.",
          score,
          profileUrl: "/profile"
        });
      }
      
      const data = insertListingSchema.parse({ ...req.body, userId });
      const slug = makeSlug([data.title, data.address]);
      const listing = await storage.createListing({ ...data, slug });
      res.status(201).json(listing);
    } catch (err: any) {
      console.error("❌ Create listing error:", err);
      res.status(400).json({ 
        message: err.message || "İlan oluşturulamadı" 
      });
    }
  });

  // Update listing
  app.put("/api/listings/:id", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const listingId = req.params.id;
      
      // Verify ownership
      const existing = await storage.getListing(listingId);
      if (!existing) {
        return res.status(404).json({ message: "İlan bulunamadı" });
      }
      
      if (existing.userId !== userId) {
        return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
      }
      
      const data = insertListingSchema.partial().parse(req.body);
      const updatedListing = await storage.updateListing(listingId, data);
      res.json(updatedListing);
    } catch (err: any) {
      console.error("❌ Update listing error:", err);
      res.status(400).json({ 
        message: err.message || "İlan güncellenemedi" 
      });
    }
  });

  // Delete listing (soft delete by setting status to 'deleted')
  app.delete("/api/listings/:id", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const listingId = req.params.id;
      
      // Verify ownership
      const existing = await storage.getListing(listingId);
      if (!existing) {
        return res.status(404).json({ message: "İlan bulunamadı" });
      }
      
      if (existing.userId !== userId) {
        return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
      }
      
      // Soft delete by setting status to 'deleted'
      await storage.updateListing(listingId, { status: 'deleted' });
      res.json({ message: "İlan silindi" });
    } catch (err: any) {
      console.error("❌ Delete listing error:", err);
      res.status(500).json({ 
        message: err.message || "İlan silinemedi" 
      });
    }
  });

  // Update listing status
  app.put("/api/listings/:id/status", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const listingId = req.params.id;
      const { status } = req.body;
      
      // Validate status
      const validStatuses = ['active', 'paused', 'rented', 'deleted'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: "Geçersiz durum. Geçerli değerler: active, paused, rented" 
        });
      }
      
      // Verify ownership
      const existing = await storage.getListing(listingId);
      if (!existing) {
        return res.status(404).json({ message: "İlan bulunamadı" });
      }
      
      if (existing.userId !== userId) {
        return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
      }
      
      const updatedListing = await storage.updateListing(listingId, { status });
      res.json(updatedListing);
    } catch (err: any) {
      console.error("❌ Update listing status error:", err);
      res.status(400).json({ 
        message: err.message || "İlan durumu güncellenemedi" 
      });
    }
  });

  /* -------------------------------------------------------
     💬 Messaging
  ------------------------------------------------------- */
  app.get("/api/conversations", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (err) {
      console.error("❌ Error fetching conversations:", err);
      res.status(500).json({ message: "Konuşmalar yüklenemedi" });
    }
  });

  app.get("/api/messages/:userId", jwtAuth, async (req, res) => {
    try {
      const currentUserId = req.userId!;
      const otherUserId = req.params.userId;
      const listingId = req.query.listingId as string | undefined;
      const messages = await storage.getMessages(
        currentUserId,
        otherUserId,
        listingId,
      );
      res.json(messages);
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
      res.status(500).json({ message: "Mesajlar yüklenemedi" });
    }
  });

  /* -------------------------------------------------------
     🌍 Static Files / Dev
  ------------------------------------------------------- */
  const httpServer = createServer(app);
  const { setupVite, serveStatic } = await import("./vite");

  if (process.env.NODE_ENV === "production") serveStatic(app);
  else await setupVite(app, httpServer);

  return httpServer;
}
