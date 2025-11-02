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
   🔐 Ortak Cookie Ayarları
   Production: SameSite=None, Secure, domain=.odanet.com.tr
------------------------------------------------------- */
function getCookieOptions(req: express.Request) {
  const isProductionDomain = req.get("host")?.includes("odanet.com.tr");
  return {
    httpOnly: true,
    secure: true, // Always secure (HTTPS enforced via trust proxy)
    sameSite: "none" as const, // Required for OAuth cross-site cookies
    domain: isProductionDomain ? ".odanet.com.tr" : undefined,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

/* -------------------------------------------------------
   🚀 Ana Router
------------------------------------------------------- */
export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/uploads", express.static("uploads"));

  /* -------------------------------------------------------
     🔐 Google OAuth Routes
  ------------------------------------------------------- */
  app.use("/api", oauthRouter);

  /* -------------------------------------------------------
     📸 File Upload Routes
  ------------------------------------------------------- */
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
     👤 Auth Routes
  ------------------------------------------------------- */
  // Register
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
      res.status(500).json({ message: "Kayıt başarısız" });
    }
  });

  // Login
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

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    const options = getCookieOptions(req);
    res.clearCookie("auth_token", { ...options, path: "/" });
    console.log("🚪 Kullanıcı çıkış yaptı, çerez silindi");
    res.json({ message: "Çıkış yapıldı" });
  });

  // Me
  app.get("/api/auth/me", jwtAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user)
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      res.status(500).json({ message: "Kullanıcı bilgisi alınamadı" });
    }
  });

  // Update user profile
  app.patch("/api/users/profile", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const { firstName, lastName, profileImageUrl, phone, bio } = req.body;
      
      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
      if (phone !== undefined) updateData.phone = phone;
      if (bio !== undefined) updateData.bio = bio;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (err) {
      console.error("❌ Profile update error:", err);
      res.status(500).json({ message: "Profil güncellenemedi" });
    }
  });

  /* -------------------------------------------------------
     🏠 Listings
  ------------------------------------------------------- */
  app.get("/api/listings", async (req, res) => {
    try {
      const listings = await storage.getListings({});
      res.json(listings);
    } catch (err) {
      res.status(500).json({ message: "Veritabanı hatası" });
    }
  });

  app.post("/api/listings", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const data = insertListingSchema.parse({ ...req.body, userId });
      const slug = makeSlug([data.title, data.address]);
      const listing = await storage.createListing({ ...data, slug });
      res.status(201).json(listing);
    } catch (err) {
      res.status(400).json({ message: "İlan oluşturulamadı" });
    }
  });

  // Get single listing by ID
  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "İlan bulunamadı" });
      }
      res.json(listing);
    } catch (err) {
      console.error("❌ Error fetching listing by ID:", err);
      res.status(500).json({ message: "İlan getirilemedi" });
    }
  });

  // Update listing
  app.put("/api/listings/:id", jwtAuth, async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing || listing.userId !== req.userId) {
        return res.status(403).json({ message: "Yetkiniz yok" });
      }
      
      // Parse and validate, then strip immutable fields (userId, id)
      const { userId: _, id: __, ...requestData } = req.body;
      const data = insertListingSchema.partial().parse(requestData);
      const slug = data.title || data.address 
        ? makeSlug([data.title || listing.title, data.address || listing.address])
        : listing.slug;
      
      const updateData = { ...data, slug } as Parameters<typeof storage.updateListing>[1];
      const updated = await storage.updateListing(req.params.id, updateData);
      res.json(updated);
    } catch (err: any) {
      console.error("❌ Error updating listing:", err);
      res.status(400).json({ message: err.message || "İlan güncellenemedi" });
    }
  });

  app.delete("/api/listings/:id", jwtAuth, async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing || listing.userId !== req.userId)
        return res.status(403).json({ message: "Yetkiniz yok" });
      await storage.deleteListing(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "İlan silinemedi" });
    }
  });

  // Get listing by slug
  app.get("/api/listings/slug/:slug", async (req, res) => {
    try {
      const listing = await storage.getListingBySlug(req.params.slug);
      if (!listing) {
        return res.status(404).json({ message: "İlan bulunamadı" });
      }
      res.json(listing);
    } catch (err) {
      console.error("❌ Error fetching listing by slug:", err);
      res.status(500).json({ message: "İlan getirilemedi" });
    }
  });

  /* -------------------------------------------------------
     🧍 Seeker Profiles
  ------------------------------------------------------- */
  // Get all public seeker profiles
  app.get("/api/seekers/public", async (req, res) => {
    try {
      const seekers = await storage.getSeekerProfiles({
        isPublished: true,
        isActive: true,
      });
      res.json(seekers);
    } catch (err: any) {
      console.error("❌ /api/seekers/public error:", err);
      res.status(500).json({ message: "Veritabanı hatası" });
    }
  });

  // Get seeker profile by slug
  app.get("/api/seekers/slug/:slug", async (req, res) => {
    try {
      const seeker = await storage.getSeekerProfileBySlug(req.params.slug);
      if (!seeker) {
        return res.status(404).json({ message: "Profil bulunamadı" });
      }
      res.json(seeker);
    } catch (err) {
      console.error("❌ Error fetching seeker by slug:", err);
      res.status(500).json({ message: "Profil getirilemedi" });
    }
  });

  // Get user's seeker profile
  app.get("/api/seekers/user/:userId", jwtAuth, async (req, res) => {
    try {
      const seeker = await storage.getUserSeekerProfile(req.params.userId);
      if (!seeker) {
        return res.status(404).json({ message: "Profil bulunamadı" });
      }
      res.json(seeker);
    } catch (err) {
      console.error("❌ Error fetching user seeker profile:", err);
      res.status(500).json({ message: "Profil getirilemedi" });
    }
  });

  // Create new seeker profile
  app.post("/api/seekers", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const data = insertSeekerProfileSchema.parse({ ...req.body, userId });
      const slug = makeSlug([data.fullName || '', data.preferredLocation || '']);
      const seeker = await storage.createSeekerProfile({ 
        ...data, 
        slug,
        isActive: true,
        isPublished: true 
      });
      res.status(201).json(seeker);
    } catch (err: any) {
      console.error("❌ Error creating seeker profile:", err);
      res.status(400).json({ message: err.message || "Profil oluşturulamadı" });
    }
  });

  // Update seeker profile
  app.put("/api/seekers/:id", jwtAuth, async (req, res) => {
    try {
      const seeker = await storage.getSeekerProfile(req.params.id);
      if (!seeker || seeker.userId !== req.userId) {
        return res.status(403).json({ message: "Yetkiniz yok" });
      }
      
      const data = insertSeekerProfileSchema.parse(req.body);
      const slug = makeSlug([data.fullName || seeker.fullName || '', data.preferredLocation || seeker.preferredLocation || '']);
      const updateData = { ...data, slug } as Parameters<typeof storage.updateSeekerProfile>[1];
      const updated = await storage.updateSeekerProfile(req.params.id, updateData);
      res.json(updated);
    } catch (err: any) {
      console.error("❌ Error updating seeker profile:", err);
      res.status(400).json({ message: err.message || "Profil güncellenemedi" });
    }
  });

  // Delete seeker profile
  app.delete("/api/seekers/:id", jwtAuth, async (req, res) => {
    try {
      const seeker = await storage.getSeekerProfile(req.params.id);
      if (!seeker || seeker.userId !== req.userId) {
        return res.status(403).json({ message: "Yetkiniz yok" });
      }
      await storage.deleteSeekerProfile(req.params.id);
      res.status(204).send();
    } catch (err) {
      console.error("❌ Error deleting seeker profile:", err);
      res.status(500).json({ message: "Profil silinemedi" });
    }
  });

  // Upload seeker profile photo
  app.post("/api/uploads/seeker-photo", jwtAuth, seekerUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const imagePath = `/uploads/seekers/${req.file.filename}`;
      const imageUrl = `${req.protocol}://${req.get('host')}${imagePath}`;

      console.log('✅ Seeker photo uploaded:', {
        filename: req.file.filename,
        path: imagePath,
        url: imageUrl
      });

      res.status(200).json({
        success: true,
        imagePath: imagePath,
        url: imageUrl,
        message: "Photo uploaded successfully"
      });
    } catch (err: any) {
      console.error("❌ Error uploading seeker photo:", err);
      res.status(500).json({ error: err.message || "Photo upload failed" });
    }
  });

  // Delete seeker profile photo
  app.delete("/api/seekers/:id/photo", jwtAuth, async (req, res) => {
    try {
      const seeker = await storage.getSeekerProfile(req.params.id);
      if (!seeker || seeker.userId !== req.userId) {
        return res.status(403).json({ message: "Yetkiniz yok" });
      }
      
      // Update profile to remove photo
      await storage.updateSeekerProfile(req.params.id, { profilePhotoUrl: null });
      res.json({ message: "Fotoğraf silindi" });
    } catch (err) {
      console.error("❌ Error deleting seeker photo:", err);
      res.status(500).json({ message: "Fotoğraf silinemedi" });
    }
  });

  /* -------------------------------------------------------
     📋 My Listings
  ------------------------------------------------------- */
  app.get("/api/my-listings", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const listings = await storage.getUserListings(userId);
      res.json(listings);
    } catch (err) {
      console.error("❌ Error fetching my listings:", err);
      res.status(500).json({ message: "İlanlar yüklenemedi" });
    }
  });

  /* -------------------------------------------------------
     💬 Messaging
  ------------------------------------------------------- */
  // Get user's conversations
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

  // Get messages with a specific user
  app.get("/api/messages/:userId", jwtAuth, async (req, res) => {
    try {
      const currentUserId = req.userId!;
      const otherUserId = req.params.userId;
      const listingId = req.query.listingId as string | undefined;
      
      const messages = await storage.getMessages(currentUserId, otherUserId, listingId);
      res.json(messages);
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
      res.status(500).json({ message: "Mesajlar yüklenemedi" });
    }
  });

  // Send a message
  app.post("/api/messages", jwtAuth, async (req, res) => {
    try {
      const senderId = req.userId!;
      const data = insertMessageSchema.parse({ ...req.body, senderId });
      
      const message = await storage.sendMessage(data);
      res.status(201).json(message);
    } catch (err: any) {
      console.error("❌ Error sending message:", err);
      res.status(400).json({ message: err.message || "Mesaj gönderilemedi" });
    }
  });

  // Mark message as read
  app.patch("/api/messages/:id/read", jwtAuth, async (req, res) => {
    try {
      await storage.markMessageAsRead(req.params.id);
      res.json({ message: "Mesaj okundu olarak işaretlendi" });
    } catch (err) {
      console.error("❌ Error marking message as read:", err);
      res.status(500).json({ message: "İşlem başarısız" });
    }
  });

  /* -------------------------------------------------------
     🌍 Vite Setup (Development) or Static Files (Production)
  ------------------------------------------------------- */
  const httpServer = createServer(app);
  
  // Import Vite setup functions
  const { setupVite, serveStatic } = await import("./vite");
  
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, httpServer);
  }
  
  return httpServer;
}
