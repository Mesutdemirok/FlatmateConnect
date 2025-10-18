import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { jwtAuth, generateToken, hashPassword, comparePassword } from "./auth";
import { insertListingSchema, insertUserPreferencesSchema, insertMessageSchema, insertFavoriteSchema, insertUserSchema, insertSeekerProfileSchema, type User } from "@shared/schema";
import { getErrorMessage, detectLanguage } from "./i18n";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const uploadDir = 'uploads/listings';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const lang = detectLanguage(req);
      cb(new Error(getErrorMessage('invalid_file_type', lang)));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Configure multer for seeker photo uploads
const seekerUploadDir = 'uploads/seekers';
if (!fs.existsSync(seekerUploadDir)) {
  fs.mkdirSync(seekerUploadDir, { recursive: true });
}

const seekerUpload = multer({
  storage: multer.diskStorage({
    destination: seekerUploadDir,
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'seeker-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const lang = detectLanguage(req);
      cb(new Error(getErrorMessage('invalid_file_type', lang)));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      version: '1.0.0',
      env: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const lang = detectLanguage(req);
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
      }

      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const token = generateToken(user.id, user.email);
      
      const { password, passwordResetToken, passwordResetExpires, ...userWithoutPassword } = user;
      
      res.status(201).json({ 
        user: userWithoutPassword, 
        token 
      });
    } catch (error: any) {
      console.error("Error registering user:", error);
      const lang = detectLanguage(req);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: 'Geçersiz kayıt bilgileri', error: error.message });
      } else {
        res.status(500).json({ message: 'Kayıt işlemi başarısız oldu' });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const lang = detectLanguage(req);
      
      if (!email || !password) {
        return res.status(400).json({ message: 'E-posta ve şifre gereklidir' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
      }

      const token = generateToken(user.id, user.email);
      
      const { password: _, passwordResetToken, passwordResetExpires, ...userWithoutPassword } = user;
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      res.json({ 
        user: userWithoutPassword, 
        token 
      });
    } catch (error) {
      console.error("Error logging in:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: 'Giriş işlemi başarısız oldu' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Çıkış yapıldı' });
  });

  app.get('/api/auth/me', jwtAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage('user_not_found', lang) });
      }
      
      const { password, passwordResetToken, passwordResetExpires, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('user_not_found', lang) });
    }
  });

  // Listing routes
  app.get('/api/listings', async (req, res) => {
    try {
      const filters = {
        location: req.query.location as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        availableFrom: req.query.availableFrom as string,
        suburb: req.query.suburb as string,
        city: req.query.city as string,
        postcode: req.query.postcode as string,
        roomType: req.query.roomType as string,
        propertyType: req.query.propertyType as string,
        furnished: req.query.furnished === 'true' ? true : req.query.furnished === 'false' ? false : undefined,
        billsIncluded: req.query.billsIncluded === 'true' ? true : req.query.billsIncluded === 'false' ? false : undefined,
        parkingAvailable: req.query.parkingAvailable === 'true' ? true : req.query.parkingAvailable === 'false' ? false : undefined,
        internetIncluded: req.query.internetIncluded === 'true' ? true : req.query.internetIncluded === 'false' ? false : undefined,
      };
      
      const listings = await storage.getListings(filters);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  app.get('/api/listings/:id', async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage('listing_not_found', lang) });
      }
      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  app.post('/api/listings', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const listingData = insertListingSchema.parse({
        ...req.body,
        userId
      });
      
      const listing = await storage.createListing(listingData);
      res.status(201).json(listing);
    } catch (error: any) {
      console.error("Error creating listing:", error);
      const lang = detectLanguage(req);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: getErrorMessage('bad_request', lang), error: error.message });
      } else {
        res.status(400).json({ message: getErrorMessage('listing_creation_failed', lang), error: error.message });
      }
    }
  });

  app.put('/api/listings/:id', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const listing = await storage.getListing(req.params.id);
      
      if (!listing || listing.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage('listing_not_found', lang) });
      }
      
      const updates = insertListingSchema.partial().parse(req.body);
      const updated = await storage.updateListing(req.params.id, updates);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating listing:", error);
      const lang = detectLanguage(req);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: getErrorMessage('bad_request', lang), error: error.message });
      } else {
        res.status(400).json({ message: getErrorMessage('listing_update_failed', lang), error: error.message });
      }
    }
  });

  app.delete('/api/listings/:id', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const listing = await storage.getListing(req.params.id);
      
      if (!listing || listing.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage('listing_not_found', lang) });
      }
      
      await storage.deleteListing(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting listing:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('listing_delete_failed', lang) });
    }
  });

  app.get('/api/my-listings', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const listings = await storage.getUserListings(userId);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  // Image upload routes
  app.post('/api/listings/:id/images', jwtAuth, upload.array('images', 10), async (req, res) => {
    try {
      const userId = req.userId!;
      const listing = await storage.getListing(req.params.id);
      
      if (!listing || listing.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage('listing_not_found', lang) });
      }
      
      const files = req.files as Express.Multer.File[];
      const images = [];
      
      // Dynamically import R2 utilities
      const { uploadToR2 } = await import('./r2-utils');
      const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || process.env.VITE_R2_PUBLIC_URL;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const r2Key = `uploads/listings/${file.filename}`;
        
        // Always upload to R2 for consistent image storage across environments
        let fullImageUrl = `/${r2Key}`; // fallback to relative path
        
        try {
          await uploadToR2(file.path, r2Key);
          // Store full R2 URL for consistency across all environments
          if (R2_PUBLIC_URL) {
            fullImageUrl = `${R2_PUBLIC_URL}/${r2Key}`;
          }
          console.log(`✅ Uploaded to R2: ${fullImageUrl}`);
        } catch (r2Error) {
          console.error(`❌ R2 upload failed for ${r2Key}:`, r2Error);
          // Continue anyway - file is saved locally as fallback
        }
        
        const image = await storage.addListingImage({
          listingId: req.params.id,
          imagePath: fullImageUrl,
          isPrimary: i === 0 // First image is primary
        });
        images.push(image);
      }
      
      res.json(images);
    } catch (error) {
      console.error("Error uploading images:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('upload_failed', lang) });
    }
  });

  app.delete('/api/listings/:listingId/images/:imageId', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const listing = await storage.getListing(req.params.listingId);
      
      if (!listing || listing.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage('listing_not_found', lang) });
      }
      
      await storage.deleteListingImage(req.params.imageId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting image:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  // Set primary image
  app.put('/api/listings/:listingId/images/:imageId/primary', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const listing = await storage.getListing(req.params.listingId);
      
      if (!listing || listing.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage('listing_not_found', lang) });
      }
      
      await storage.setPrimaryImage(req.params.listingId, req.params.imageId);
      res.status(204).send();
    } catch (error) {
      console.error("Error setting primary image:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  // Get listing images
  app.get('/api/listings/:id/images', async (req, res) => {
    try {
      const images = await storage.getListingImages(req.params.id);
      res.json(images);
    } catch (error) {
      console.error("Error fetching listing images:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  // User preferences routes
  app.get('/api/preferences', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  app.put('/api/preferences', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const preferencesData = insertUserPreferencesSchema.parse({
        ...req.body,
        userId
      });
      
      const preferences = await storage.upsertUserPreferences(preferencesData);
      res.json(preferences);
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      const lang = detectLanguage(req);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: getErrorMessage('bad_request', lang), error: error.message });
      } else {
        res.status(400).json({ message: getErrorMessage('profile_update_failed', lang), error: error.message });
      }
    }
  });

  // Message routes
  app.get('/api/conversations', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('conversation_not_found', lang) });
    }
  });

  app.get('/api/messages/:otherUserId', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const { otherUserId } = req.params;
      const { listingId } = req.query;
      
      const messages = await storage.getMessages(userId, otherUserId, listingId as string);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  app.post('/api/messages', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId
      });
      
      const message = await storage.sendMessage(messageData);
      res.status(201).json(message);
    } catch (error: any) {
      console.error("Error sending message:", error);
      const lang = detectLanguage(req);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: getErrorMessage('bad_request', lang), error: error.message });
      } else {
        res.status(400).json({ message: getErrorMessage('message_send_failed', lang), error: error.message });
      }
    }
  });

  app.put('/api/messages/:id/read', jwtAuth, async (req, res) => {
    try {
      await storage.markMessageAsRead(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking message as read:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  // Favorites routes
  app.get('/api/favorites', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  app.post('/api/favorites', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        userId
      });
      
      const favorite = await storage.addFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error: any) {
      console.error("Error adding favorite:", error);
      const lang = detectLanguage(req);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: getErrorMessage('bad_request', lang), error: error.message });
      } else {
        res.status(400).json({ message: getErrorMessage('database_error', lang), error: error.message });
      }
    }
  });

  app.delete('/api/favorites/:listingId', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      await storage.removeFavorite(userId, req.params.listingId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  app.get('/api/favorites/:listingId/check', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const isFavorite = await storage.isFavorite(userId, req.params.listingId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  // Seeker profile routes
  app.get('/api/seekers', async (req, res) => {
    try {
      const filters = {
        minBudget: req.query.minBudget ? Number(req.query.minBudget) : undefined,
        maxBudget: req.query.maxBudget ? Number(req.query.maxBudget) : undefined,
        gender: req.query.gender as string,
        location: req.query.location as string,
        isFeatured: req.query.featured === 'true' ? true : undefined,
      };
      
      const seekers = await storage.getSeekerProfiles(filters);
      res.json(seekers);
    } catch (error) {
      console.error("Error fetching seekers:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  app.get('/api/seekers/featured', async (req, res) => {
    try {
      const count = req.query.count ? Number(req.query.count) : 4;
      const seekers = await storage.getSeekerProfiles({ isFeatured: true });
      res.json(seekers.slice(0, count));
    } catch (error) {
      console.error("Error fetching featured seekers:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  // Public seekers endpoint - no auth required
  app.get('/api/seekers/public', async (req, res) => {
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
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  app.get('/api/seekers/:id', async (req, res) => {
    try {
      const seeker = await storage.getSeekerProfile(req.params.id);
      if (!seeker) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: 'Oda arayan profil bulunamadı' });
      }
      res.json(seeker);
    } catch (error) {
      console.error("Error fetching seeker:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  app.get('/api/seekers/user/:userId', async (req, res) => {
    try {
      const seeker = await storage.getUserSeekerProfile(req.params.userId);
      if (!seeker) {
        return res.status(404).json({ message: 'Profil bulunamadı' });
      }
      res.json(seeker);
    } catch (error) {
      console.error("Error fetching user seeker profile:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  app.post('/api/seekers', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      console.log('[POST /api/seekers] Request body:', JSON.stringify(req.body, null, 2));
      console.log('[POST /api/seekers] userId from JWT:', userId);
      
      const seekerData = insertSeekerProfileSchema.parse({
        ...req.body,
        userId,
        isPublished: true // Auto-publish new seeker profiles
      });
      
      console.log('[POST /api/seekers] Parsed seeker data:', JSON.stringify(seekerData, null, 2));
      
      const seeker = await storage.createSeekerProfile(seekerData);
      console.log('[POST /api/seekers] Seeker profile created successfully:', seeker.id);
      res.status(201).json(seeker);
    } catch (error: any) {
      console.error("[POST /api/seekers] Error creating seeker profile:", error);
      if (error.name === 'ZodError') {
        console.error("[POST /api/seekers] Zod validation errors:", JSON.stringify(error.errors, null, 2));
      }
      const lang = detectLanguage(req);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: getErrorMessage('bad_request', lang), error: error.message, details: error.errors });
      } else {
        res.status(400).json({ message: 'Profil oluşturulamadı', error: error.message });
      }
    }
  });

  app.put('/api/seekers/:id', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const seeker = await storage.getSeekerProfile(req.params.id);
      
      if (!seeker || seeker.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: 'Profil bulunamadı veya yetkiniz yok' });
      }
      
      const updatedSeeker = await storage.updateSeekerProfile(req.params.id, req.body);
      res.json(updatedSeeker);
    } catch (error: any) {
      console.error("Error updating seeker profile:", error);
      const lang = detectLanguage(req);
      res.status(400).json({ message: 'Profil güncellenemedi', error: error.message });
    }
  });

  app.delete('/api/seekers/:id', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const seeker = await storage.getSeekerProfile(req.params.id);
      
      if (!seeker || seeker.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: 'Profil bulunamadı veya yetkiniz yok' });
      }
      
      await storage.deleteSeekerProfile(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting seeker profile:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  // Seeker photo routes
  app.post('/api/seekers/:id/photos', jwtAuth, seekerUpload.array('photos', 5), async (req, res) => {
    try {
      const userId = req.userId!;
      const seeker = await storage.getSeekerProfile(req.params.id);
      
      if (!seeker || seeker.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: 'Profil bulunamadı veya yetkiniz yok' });
      }
      
      const files = req.files as Express.Multer.File[];
      const existingPhotos = await storage.getSeekerPhotos(req.params.id);
      
      // Dynamically import R2 utilities
      const { uploadToR2 } = await import('./r2-utils');
      const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || process.env.VITE_R2_PUBLIC_URL;
      
      const photoPromises = files.map(async (file, index) => {
        const r2Key = `uploads/seekers/${file.filename}`;
        
        // Always upload to R2 for consistent image storage across environments
        let fullImageUrl = `/${r2Key}`; // fallback to relative path
        
        try {
          await uploadToR2(file.path, r2Key);
          // Store full R2 URL for consistency across all environments
          if (R2_PUBLIC_URL) {
            fullImageUrl = `${R2_PUBLIC_URL}/${r2Key}`;
          }
          console.log(`✅ Uploaded to R2: ${fullImageUrl}`);
        } catch (r2Error) {
          console.error(`❌ R2 upload failed for ${r2Key}:`, r2Error);
          // Continue anyway - file is saved locally as fallback
        }
        
        return storage.addSeekerPhoto({
          seekerId: req.params.id,
          imagePath: fullImageUrl,
          sortOrder: existingPhotos.length + index,
        });
      });
      
      const photos = await Promise.all(photoPromises);
      
      // If this is the first photo and profilePhotoUrl is not set, update it
      if (files.length > 0 && !seeker.profilePhotoUrl) {
        const firstPhotoUrl = R2_PUBLIC_URL 
          ? `${R2_PUBLIC_URL}/uploads/seekers/${files[0].filename}`
          : `/uploads/seekers/${files[0].filename}`;
        await storage.updateSeekerProfile(req.params.id, {
          profilePhotoUrl: firstPhotoUrl
        });
      }
      
      res.status(201).json(photos);
    } catch (error: any) {
      console.error("Error adding seeker photos:", error);
      const lang = detectLanguage(req);
      res.status(400).json({ message: 'Fotoğraflar eklenemedi', error: error.message });
    }
  });

  app.delete('/api/seekers/:seekerId/photos/:photoId', jwtAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const seeker = await storage.getSeekerProfile(req.params.seekerId);
      
      if (!seeker || seeker.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: 'Profil bulunamadı veya yetkiniz yok' });
      }
      
      await storage.deleteSeekerPhoto(req.params.photoId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting seeker photo:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
