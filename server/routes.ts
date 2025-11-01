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
    } catch {
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
     🌍 Server Start
  ------------------------------------------------------- */
  const httpServer = createServer(app);
  return httpServer;
}
