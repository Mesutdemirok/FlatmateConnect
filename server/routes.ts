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
      const user = await storage.getUser(req.userId!);
      if (!user)
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      const { password, ...safeUser } = user;
      res.json(safeUser);
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

  // Get seeker by slug
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

  /* -------------------------------------------------------
     🏠 Listings
  ------------------------------------------------------- */
  app.get("/api/listings", async (req, res) => {
    try {
      const listings = await storage.getListings({});
      res.json(listings);
    } catch {
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

  app.post("/api/listings", jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const data = insertListingSchema.parse({ ...req.body, userId });
      const slug = makeSlug([data.title, data.address]);
      const listing = await storage.createListing({ ...data, slug });
      res.status(201).json(listing);
    } catch {
      res.status(400).json({ message: "İlan oluşturulamadı" });
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
