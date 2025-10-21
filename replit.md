# Odanet - Flatmate & Room Rental Platform

## Overview
Odanet is a flatmate and room rental platform designed for the Turkish market. Its primary purpose is to connect individuals seeking shared accommodation with available room providers. The platform emphasizes verified profiles, intelligent matching algorithms, and secure communication channels to foster a trustworthy environment for users. Key features include comprehensive user and listing management, seeker profiles, real-time messaging, and advanced search and filtering capabilities.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript (Vite)
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI for accessible components.
- **State Management**: React Query for server state, React hooks for local state.
- **Routing**: Wouter for client-side routing.
- **Internationalization**: i18next (Turkish primary locale, localized URLs).
- **Authentication**: Replit Auth integration.
- **UI/UX**: Mobile-first design, consistent branding with orange accents, gradient backgrounds, rounded cards, and icon-based feature chips.

### Backend
- **Framework**: Express.js with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM.
- **Authentication**: Replit Auth, session-based using `express-session`.
- **File Handling**: Multer for image uploads, Cloudflare R2 for production storage.
- **API Design**: RESTful with standardized error handling.
- **System Design**: Modular schema with foreign key relationships.

### Key Features
- **User Management**: Profile creation, verification, image uploads.
- **Listing System**: Detailed room listings with multiple images and filtering.
- **Seeker Profiles**: Comprehensive profiles for accommodation seekers.
- **Messaging System**: Real-time communication.
- **Favorites System**: Save and manage favorite listings.
- **Search & Filtering**: Location-based search with various filters for both room and flatmate searches.
- **File Upload System**: Cloudflare R2 CDN storage for production, local storage for development, supporting multiple image uploads and optimized for mobile with image processing (HEIC/HEIF to JPEG conversion, compression, resizing).
- **Homepage Feed**: Mixed feed displaying both listings and seeker profiles.
- **Social Share Previews**: Dynamic Open Graph and Twitter card generation for social media sharing.
- **UI Enhancements**: Consistent navigation, responsive card layouts with dynamic aspect ratios and address overlays, and optimized mobile-first grids.

## External Dependencies

### Database & ORM
- **Neon Database**: PostgreSQL hosting.
- **Drizzle ORM**: Database interactions and schema management.
- **connect-pg-simple**: PostgreSQL session store.

### UI/UX Libraries
- **Radix UI**: Accessible React components.
- **Lucide React**: Icon library.
- **class-variance-authority**: Component variant management.

### Development & Build Tools
- **Vite**: Fast build tool.
- **TypeScript**: Type safety.
- **Drizzle Kit**: Database migration.

### Form Management & Validation
- **React Hook Form**: Form state management.
- **Zod**: Schema validation.

### Authentication
- **Replit Auth**: OIDC-based authentication.
- **Passport.js**: Authentication middleware.

### Utilities
- **i18next**: Internationalization.
- **date-fns**: Date manipulation.
- **Sharp & Busboy**: Image processing for uploads.
- **nanoid**: Compact, URL-safe unique ID generation for slugs.
- **slugify**: Turkish-locale URL slug generation from text.

### Cloud Services
- **Cloudflare R2**: Object storage for images (bucket: `odanet-uploads`).
- **Cloudflare CDN**: Custom domain (`cdn.odanet.com.tr`) for image delivery.
- **AWS SDK S3 Client**: R2 API compatibility.

### Analytics
- **Google Analytics 4**: Event tracking (ID: G-ME5ES9KLDE)
  - Automatic pageview tracking via Wouter routing
  - Custom event tracking for user actions (signup, login, search, etc.)
  - Real-time analytics monitoring

### SEO & Meta Tags
- **React Helmet**: Dynamic meta tag management
- **SEOHead Component**: Reusable SEO component with Open Graph and Twitter cards
  - Default Odanet title and description
  - Dynamic meta tags for listing and seeker detail pages
  - Proper canonical URLs and social media preview images

## Recent Changes

### SEO-Friendly Slugs for Both Listings and Seekers (October 21, 2025)
- **Complete Slug Implementation**: Automatic generation of unique, SEO-friendly slugs for both listings AND seeker profiles
  - Listing format: `{title}-{address}-{uniqueID}` (e.g., `nisantasi-ferah-daire-istanbul-abc123`)
  - Seeker format: `{fullName}-{preferredLocation}-{uniqueID}` (e.g., `ahmet-k-kadikoy-xyz789`)
  - Turkish locale support via slugify library with character mapping (ş→s, ı→i, ğ→g, etc.)
  - Unique ID suffix using nanoid (6-char lowercase) to prevent collisions
  - Switched from shortid to nanoid for better performance and smaller bundle size
- **Database Schema**: Added `slug` field to both listings and seeker_profiles tables with unique constraints
- **New Endpoints**: 
  - `GET /api/listings/slug/:slug` for slug-based listing lookup
  - `GET /api/seekers/slug/:slug` for slug-based seeker lookup
- **Storage Layer**: 
  - Added `getListingBySlug` method to IStorage interface
  - Added `getSeekerProfileBySlug` method to IStorage interface
- **Frontend Routing**: Updated all routes to use :slug parameter instead of :id
  - `/oda-ilani/:slug` for listings
  - `/oda-arayan/:slug` for seekers
- **Card Components**: All cards (ListingCard, SeekerCard, FeaturedListings) use slug-based URLs with ID fallback
- **Type Safety**: Full TypeScript support throughout
- **Backwards Compatibility**: ID-based API endpoints remain functional for existing data
- **URL Format**: Enables SEO-friendly URLs for both listings and seekers

### Footer Social Media Icons Update (October 20, 2025)
- **Complete Social Media Integration**: Added all 6 social platforms to footer
  - Instagram, Facebook, TikTok, Pinterest, YouTube, İletişim (Contact)
  - React Icons (FontAwesome) for consistent, crisp icon rendering
  - All URLs corrected to use .com.tr domain format
- **Visual Enhancements**:
  - Orange circular buttons with white icons (brand consistency)
  - Smooth hover effects: scale-105, shadow-lg, enhanced ring glow
  - Responsive flex-wrap for mobile compatibility
- **SEO Structured Data**: Updated Schema.org JSON-LD to include all social platforms
- **Accessibility**: ARIA labels, keyboard navigation, focus states
- **Test IDs**: Added data-testid attributes for automated testing

### SEO Integration Across All Main Pages (October 19, 2025)
- **SEOHead Component**: Clean, reusable component with TypeScript props
  - Default title: "Odanet – Güvenli, kolay ve şeffaf oda & ev arkadaşı bul"
  - Default description for home page
  - Supports custom title, description, URL, and image per page
- **Dynamic SEO on Detail Pages**:
  - `ListingDetail`: Uses listing title, location, price, and description for SEO
  - `SeekerDetail`: Uses seeker name, age, occupation, location, and budget for SEO
  - Both use first image as Open Graph preview
- **Static SEO on List Pages**:
  - `Search`: "Oda İlanları - Kiralık Oda Bul | Odanet"
  - `SeekerList`: "Oda Arayanlar - Ev Arkadaşı Bul | Odanet"
  - `Profile`: "Profilim - Hesap Ayarları | Odanet"
  - `Home`: Default Odanet branding
- **Social Media Ready**: All pages have proper Open Graph and Twitter Card meta tags for rich previews when shared

## Recent Changes

### Google Analytics 4 Event Tracking Integration (October 19, 2025)
- **Analytics Helper**: Created `/client/src/lib/analytics.ts` with reusable event tracking functions
  - `trackSignup(method)` - User registration events
  - `trackLogin(method)` - User login events
  - `trackCreateListing()` - New listing creation
  - `trackMessageSend()` - Message sending
  - `trackSearch(query)` - Search actions
  - `trackEvent(name, params)` - Generic custom events
- **Automatic Pageview Tracking**: Integrated with Wouter router in `App.tsx`
  - Tracks all route changes automatically
  - No manual pageview calls needed
- **GA Configuration**: Measurement ID G-ME5ES9KLDE
  - Loaded in `index.html` with `send_page_view: false`
  - Manual SPA pageview tracking via React
  - Ready for real-time event monitoring
- **Cleanup**: Removed Next.js leftover files (_app.tsx, ga.tsx, gtag.tsx)
  - Consolidated to single analytics module
  - Vite/React architecture compliant

### Mobile Photo Upload Optimization (October 18, 2025)
- **Sharp & Busboy Integration**: Installed image processing libraries for robust mobile uploads
  - Sharp: HEIC/HEIF → JPEG conversion, auto-rotation (EXIF), compression (82% quality)
  - Busboy: Multipart/form-data parsing for file uploads
  - Automatic resize to max 1600px width (maintains aspect ratio)
- **New Upload Endpoint**: `/api/uploads/seeker-photo`
  - Accepts all image formats: JPEG, PNG, WebP, HEIC, HEIF
  - Immediate processing and optimization on upload
  - Returns both imagePath (for DB) and CDN URL (for preview)
  - Maximum file size: 10MB (raw files, compressed to ~200-500KB)
- **Frontend Upload UX**: Completely redesigned CreateSeekerProfile photo upload
  - `accept="image/*"` + `capture="environment"` for mobile camera access
  - Instant upload on file selection (no waiting for form submit)
  - Real-time progress indicator (loading spinner)
  - Preview with rounded image after successful upload
  - Clear success/error messages in Turkish