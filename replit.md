# Odanet - Flatmate & Room Rental Platform

## Overview
Odanet is a flatmate and room rental platform for the Turkish market, connecting individuals seeking shared accommodation with room providers. The platform emphasizes verified profiles, smart matching, and secure communication to build a trustworthy environment for finding compatible flatmates and rental opportunities. Its core capabilities include user profile management, a comprehensive listing system, seeker profiles, real-time messaging, and search & filtering functionalities.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (October 17, 2025)

### Full Health Pass - Complete Site Audit & Fixes (October 17, 2025)
- **TypeScript Type Safety Fixed**:
  - Created `listingApi.ts` with proper type definitions (`ListingWithRelations`, `FavoriteStatus`)
  - Fixed all 54 LSP errors in `ListingDetail.tsx` by adding proper type annotations
  - Added null safety checks for listing operations
  
- **Image Management System Verified**:
  - All components now use `getAbsoluteImageUrl()` utility for consistent R2 CDN URL handling
  - ListingDetail.tsx ✓ (main image + thumbnails)
  - ListingCard.tsx ✓
  - FeaturedListings.tsx ✓
  - FeaturedRoomSeekers.tsx ✓
  - SeekerList.tsx ✓
  - SeekerDetail.tsx ✓
  - Production-ready with Cloudflare R2 CDN support

- **Search Box Enhancement (October 17, 2025)**:
  - Beautiful gradient background (indigo-50 via white to violet-50)
  - Simplified to single location input with MapPin icon
  - Toggle tabs: "Oda Ara" (room listings) vs "Oda Arkadaşı Ara" (flatmates/seekers)
  - Gradient buttons (indigo-600 to violet-600) with Search icon
  - Mobile-responsive with full-width layout on small screens
  - Properly positioned below Hero, above "Güncel İlanlar"
  
- **Search Functionality Complete**:
  - Created `/oda-aramalari` route for seeker listings with full filtering support
  - Fixed location filtering for seeker profiles (searches preferredLocation field in database)
  - Both Search.tsx and SeekerList.tsx properly read URL query parameters
  - SearchBox navigates to filtered results pages with correct query strings

- **Navigation Links Fixed**:
  - Footer links updated to match actual routes:
    - `/oda-ilani-ver` → `/ilan-olustur` ✓
    - `/oda-arama-ilani-ver` → `/oda-arama-ilani-olustur` ✓
    - Added `/oda-ilanlari` and `/oda-aramalari` links
  - All navbar links verified and working
  - No broken links remaining in header, footer, or pages

- **Build & Production Status**:
  - Build successful: 694.67 kB frontend (gzip: 206.11 kB), 63.8 KB backend
  - All LSP diagnostics cleared
  - Workflow running successfully
  - Mobile-responsive layout tested and verified

### Latest UI/UX Improvements
- **Authentication Page Enhanced**: 
  - Unified login/register page with purple gradient tab switching (purple-600 to pink-600)
  - Auto-redirects authenticated users to /profil
  - Mobile-first responsive design with social login placeholders
- **Header Updates**:
  - Blood-orange gradient favorite icon badge (gradient from #FF3B30 to #FF7A00)
  - Improved message icon styling
  - Better mobile responsiveness
- **Messages Page**: Removed footer for cleaner, focused messaging experience
- **Seeker Profile Cards Redesigned**:
  - Price badge prominently displayed on photo (emerald-to-teal gradient)
  - Name and gender overlaid at bottom of photo with elegant drop shadow
  - Compact info section with location, occupation, and preference badges
  - Improved mobile-friendly layout
- **Image Management Completely Fixed**: 
  - All seeker images now display correctly using `getAbsoluteImageUrl` utility
  - Fixed SeekerDetail page to properly show photos from R2
  - Fixed FeaturedRoomSeekers component image URLs
  - Seeker photo deletion properly removes files from Cloudflare R2
  - Handles both full R2 URLs and relative paths
  - Local file fallback for development
- **Delete Functionality Added**:
  - Added "İlanı Sil" button to listing edit page (EditListing.tsx)
  - Added "İlanı Sil" button to seeker profile edit page (CreateSeekerProfile.tsx)
  - Both deletion flows include confirmation dialogs
  - Proper cleanup of R2 storage on deletion
  - Ownership verification before deletion
  - Cache invalidation after deletion

### Production Environment
- **Environment Detection Fixed**: Changed from `app.get("env")` to `process.env.NODE_ENV` for reliable production detection
- **Object Storage Configuration**: Disabled Replit object storage by default (using Cloudflare R2 instead)
  - Added ENABLE_REPLIT_OBJECT_STORAGE environment variable to optionally enable it
  - Graceful fallback when object storage is unavailable
- **Package Scripts Updated**: Added cross-env for reliable NODE_ENV setting across platforms
- **Production Deployment Fixed**: Corrected static file serving path (server/vite.ts) to properly serve frontend build from dist/public
- **API Route Handling Fixed**: Updated wildcard route to skip /api and /uploads paths, preventing conflicts with API endpoints
- **CDN Migration Implemented**: Runtime URL normalization to use custom domain (cdn.odanet.com.tr) instead of default R2 URL
- **Image Upload Logic Fixed**: Updated to store full R2 URLs in database for consistency across all environments
- **URL Normalization Added**: Automatic replacement of pub-*.r2.dev URLs with custom CDN domain at runtime (no database migration needed)
- **Database Migration Completed**: Successfully migrated to new Neon production database (postgresql://neondb_owner@ep-noisy-sun-afcx37wr-pooler.c-2.us-west-2.aws.neon.tech/neondb)
- **Fixed DATABASE_URL Sanitization**: Added duplicate prefix handling in `server/db.ts` and `drizzle.config.ts` to handle malformed environment variables
- **Image Display Fixed**: All environments now properly handle full R2 URLs - images work on desktop, mobile, Mac, iPhone, all browsers
- **Schema Pushed Successfully**: All 9 tables created in new Neon DB (users, listings, listing_images, seeker_profiles, seeker_photos, favorites, messages, user_preferences, sessions)
- **Development Environment**: Clean database, all APIs working, CDN normalization functional, workflow running successfully
- **Production Status**: Fixed and ready for deployment - frontend serves correctly, API endpoints working
- **Build Updated**: New production build (63.7KB backend, 684KB frontend gzip: 203.94KB) with all UI/UX improvements included

## System Architecture

### Frontend
- **Framework**: React with TypeScript (Vite)
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **State Management**: React Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Internationalization**: i18next (Turkish primary locale)
- **Authentication**: Replit Auth integration
- **UI/UX**: Focus on consistent design, improved contrast, and clear typography. All URLs are localized to Turkish.

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth, session-based using `express-session`
- **File Handling**: Multer for image uploads, Cloudflare R2 for storage (production), local disk (development)
- **API Design**: RESTful, standardized error handling
- **System Design**: Modular schema, proper foreign key relationships with cascade deletes. Health endpoints at `/` and `/api/health` for monitoring and deployment health checks.
- **Image Storage**: Cloudflare R2 bucket (odanet-uploads) for production, automatic upload on file submission

### Key Features
- **User Management**: Profile creation, verification, image uploads.
- **Listing System**: Detailed room listings with multiple images, descriptions, and filtering.
- **Seeker Profiles**: Comprehensive profiles for those seeking accommodation, including preferences and photos.
- **Messaging System**: Real-time communication between users.
- **Favorites System**: Save and manage favorite listings.
- **Search & Filtering**: Location-based search with various filters (price, availability, features).
- **File Upload System**: Cloudflare R2 CDN storage (production), local storage (development), image validation, multiple image support.

## External Dependencies

### Database & ORM
- **Neon Database**: PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **connect-pg-simple**: PostgreSQL session store

### UI/UX Libraries
- **Radix UI**: Accessible React components
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management

### Development & Build Tools
- **Vite**: Fast build tool
- **TypeScript**: Type safety
- **Drizzle Kit**: Database migration and schema management
- **Replit Plugins**: Development integration (`@replit/vite-plugin-*`)

### Form Management & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation, integrated with Drizzle ORM

### Authentication
- **Replit Auth**: OIDC-based authentication
- **Passport.js**: Authentication middleware
- **memoizee**: Caching for OIDC configuration

### Utilities
- **i18next**: Internationalization
- **date-fns**: Date manipulation
- **PostCSS & Autoprefixer**: CSS processing

### Cloud Services
- **Cloudflare R2**: Object storage for production images (bucket: odanet-uploads)
- **Cloudflare CDN**: Custom domain (cdn.odanet.com.tr) for image delivery with runtime URL normalization
- **AWS SDK S3 Client**: R2 API compatibility for uploads/downloads