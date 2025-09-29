import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertListingSchema, insertUserPreferencesSchema, insertMessageSchema, insertFavoriteSchema } from "@shared/schema";
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
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
        furnished: req.query.furnished === 'true' ? true : req.query.furnished === 'false' ? false : undefined,
        billsIncluded: req.query.billsIncluded === 'true' ? true : req.query.billsIncluded === 'false' ? false : undefined,
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

  app.post('/api/listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listingData = insertListingSchema.parse({
        ...req.body,
        userId
      });
      
      const listing = await storage.createListing(listingData);
      res.status(201).json(listing);
    } catch (error) {
      console.error("Error creating listing:", error);
      const lang = detectLanguage(req);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: getErrorMessage('bad_request', lang), error: error.message });
      } else {
        res.status(400).json({ message: getErrorMessage('listing_creation_failed', lang), error: error.message });
      }
    }
  });

  app.put('/api/listings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listing = await storage.getListing(req.params.id);
      
      if (!listing || listing.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage('listing_not_found', lang) });
      }
      
      const updates = insertListingSchema.partial().parse(req.body);
      const updated = await storage.updateListing(req.params.id, updates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating listing:", error);
      const lang = detectLanguage(req);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: getErrorMessage('bad_request', lang), error: error.message });
      } else {
        res.status(400).json({ message: getErrorMessage('listing_update_failed', lang), error: error.message });
      }
    }
  });

  app.delete('/api/listings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/my-listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listings = await storage.getUserListings(userId);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  // Image upload routes
  app.post('/api/listings/:id/images', isAuthenticated, upload.array('images', 10), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listing = await storage.getListing(req.params.id);
      
      if (!listing || listing.userId !== userId) {
        const lang = detectLanguage(req);
        return res.status(404).json({ message: getErrorMessage('listing_not_found', lang) });
      }
      
      const files = req.files as Express.Multer.File[];
      const images = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const image = await storage.addListingImage({
          listingId: req.params.id,
          imagePath: `/uploads/listings/${file.filename}`,
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

  app.delete('/api/listings/:listingId/images/:imageId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  // User preferences routes
  app.get('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  app.put('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferencesData = insertUserPreferencesSchema.parse({
        ...req.body,
        userId
      });
      
      const preferences = await storage.upsertUserPreferences(preferencesData);
      res.json(preferences);
    } catch (error) {
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
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('conversation_not_found', lang) });
    }
  });

  app.get('/api/messages/:otherUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId
      });
      
      const message = await storage.sendMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      const lang = detectLanguage(req);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: getErrorMessage('bad_request', lang), error: error.message });
      } else {
        res.status(400).json({ message: getErrorMessage('message_send_failed', lang), error: error.message });
      }
    }
  });

  app.put('/api/messages/:id/read', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        userId
      });
      
      const favorite = await storage.addFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      const lang = detectLanguage(req);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: getErrorMessage('bad_request', lang), error: error.message });
      } else {
        res.status(400).json({ message: getErrorMessage('database_error', lang), error: error.message });
      }
    }
  });

  app.delete('/api/favorites/:listingId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.removeFavorite(userId, req.params.listingId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  app.get('/api/favorites/:listingId/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const isFavorite = await storage.isFavorite(userId, req.params.listingId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite:", error);
      const lang = detectLanguage(req);
      res.status(500).json({ message: getErrorMessage('database_error', lang) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
