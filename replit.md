# Odanet - Flatmate & Room Rental Platform

## Overview
Odanet is a flatmate and room rental platform for the Turkish market, connecting individuals seeking shared accommodation with room providers. The platform emphasizes verified profiles, smart matching, and secure communication to build a trustworthy environment for finding compatible flatmates and rental opportunities. Its core capabilities include user profile management, a comprehensive listing system, seeker profiles, real-time messaging, and search & filtering functionalities.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (October 18, 2025)

### Mobile-First Listing Detail Redesign (October 18, 2025)
- **Created 6 New Reusable Components**:
  - `DefinitionList.tsx` - Base component for structured dl/dt/dd layouts with 1 or 2 columns
  - `TitleBlock.tsx` - Header with title, address (MapPin icon), and category badges
  - `KeyFacts.tsx` - "Oda Bilgileri" section using DefinitionList, 2-column grid on desktop
  - `FeatureChips.tsx` - Icon-based feature chips (Wifi, Klima, TV, etc.) with smart amenity mapping
  - `OwnerCard.tsx` - Owner profile card with avatar, name, and safety reminder box
  - `StickyCTA.tsx` - Fixed bottom bar (mobile only) with price + contact button
  
- **Completely Redesigned ListingDetail.tsx**:
  - Mobile-first architecture with responsive breakpoints (lg: for desktop sidebar)
  - Clean gradient background (indigo-50/30 → white → violet-50/30)
  - Rounded-2xl cards with subtle ring borders (ring-1 ring-slate-100)
  - Typography hierarchy: 2xl title, lg section headings, consistent slate color palette
  - Image gallery with overlay favorite button, improved navigation buttons (white/90 backdrop-blur)
  - Sticky CTA appears only on mobile, shows price + contact button at bottom
  - Desktop sidebar shows traditional price card with edit/contact/favorite buttons
  - Orange brand color (#f97316) for all primary CTAs
  - Proper spacing with pb-24 for mobile sticky bar clearance
  
- **Key Design Choices**:
  - Definition list (dl/dt/dd) for "Oda Bilgileri" with uppercase 11px labels
  - Icon-based feature chips with gray backgrounds (bg-slate-50)
  - Violet category badges (bg-violet-50 text-violet-700)
  - Safety reminder in amber colors (bg-amber-50 border-amber-100)
  - Mobile price card appears above KeyFacts (lg:hidden)
  - OwnerCard duplicated for mobile/desktop placement
  
- **Production Build**: ✓ Successful (704KB frontend gzip: 208KB, 64KB backend)
- **LSP Status**: All errors cleared in new components and ListingDetail.tsx

### UI Revisions - NumberInput & Single-Page Seeker Form (October 18, 2025)
- **Created NumberInput Component**: Custom input component that removes +/- stepper buttons from all numeric fields
  - Implemented in `client/src/components/forms/NumberInput.tsx`
  - Uses `type="text"` with `inputMode="numeric"` and `pattern="[0-9]*"` for mobile keyboards
  - Added CSS rules to hide number spinners in all browsers
  - Updated all forms to use NumberInput: CreateListing, EditListing, CreateSeekerProfile, Profile
  
- **Simplified Seeker Profile Form**: Converted from multi-step to single-page form
  - All fields now visible on one page (Personal Info, Lifestyle, Preferences)
  - Added new fields to schema: `isSmoker` and `hasPets` (boolean) for the seeker's own situation
  - Separate from `smokingPreference` and `petPreference` (what they want in roommates)
  - Delete photo button added with proper R2 cleanup
  - Orange submit button (#f97316) matches site design
  
- **Homepage Mixed Listings**: Combined room listings and seeker profiles into one shuffled section
  - "Güncel İlanlar" displays up to 24 randomly mixed items (rooms + seekers)
  - Responsive grid layout (1-4 columns based on screen size)
  - More engaging and diverse content discovery

- **Database Schema Updated**: Successfully pushed changes with new seeker profile fields
  - `is_smoker` (boolean) - whether the seeker smokes
  - `has_pets` (boolean) - whether the seeker has pets
  
- **Build Status**: ✓ Production build successful (696KB frontend, 64KB backend)
  - Zero type="number" inputs remaining in codebase
  - All LSP diagnostics in new code cleared
  - Workflow running successfully

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