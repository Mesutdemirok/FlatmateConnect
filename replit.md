# Odanet - Flatmate & Room Rental Platform

## Overview
Odanet is a flatmate and room rental platform for the Turkish market. It connects individuals seeking shared accommodation with room providers, focusing on verified profiles, smart matching, and secure communication. The platform aims to create a trustworthy environment for finding compatible flatmates and rental opportunities. Key capabilities include user profile management, a comprehensive listing system, seeker profiles, real-time messaging, and robust search and filtering functionalities.

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
- **UI/UX**: Mobile-first design principles, consistent design, improved contrast, clear typography, and responsive layouts. Design elements include gradient backgrounds, rounded cards, icon-based feature chips, and orange brand color for CTAs.

### Backend
- **Framework**: Express.js with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations.
- **Authentication**: Replit Auth, session-based using `express-session`.
- **File Handling**: Multer for image uploads, Cloudflare R2 for production storage, local disk for development.
- **API Design**: RESTful with standardized error handling.
- **System Design**: Modular schema with proper foreign key relationships and cascade deletes. Health endpoints at `/` and `/api/health`.

### Key Features
- **User Management**: Profile creation, verification, image uploads.
- **Listing System**: Detailed room listings with multiple images, descriptions, and filtering.
- **Seeker Profiles**: Comprehensive profiles for those seeking accommodation, including preferences and photos, with single-page form for ease of use.
- **Messaging System**: Real-time communication between users.
- **Favorites System**: Save and manage favorite listings.
- **Search & Filtering**: Location-based search with various filters (price, availability, features), supporting both room and flatmate searches.
- **File Upload System**: Cloudflare R2 CDN storage for production, local storage for development, image validation, multiple image support, and proper cleanup on deletion.
- **UI Improvements**: Custom `NumberInput` component, fully clickable cards, improved header, and revamped listing detail pages with mobile-first architecture.

## External Dependencies

### Database & ORM
- **Neon Database**: PostgreSQL hosting for production.
- **Drizzle ORM**: For database interactions and schema management.
- **connect-pg-simple**: PostgreSQL session store.

### UI/UX Libraries
- **Radix UI**: Accessible React components.
- **Lucide React**: Icon library.
- **class-variance-authority**: Component variant management.

### Development & Build Tools
- **Vite**: Fast build tool.
- **TypeScript**: For type safety across the application.
- **Drizzle Kit**: Database migration and schema management.
- **Replit Plugins**: For development integration.

### Form Management & Validation
- **React Hook Form**: For form state management.
- **Zod**: For schema validation, integrated with Drizzle ORM.

### Authentication
- **Replit Auth**: OIDC-based authentication.
- **Passport.js**: Authentication middleware.
- **memoizee**: Caching for OIDC configuration.

### Utilities
- **i18next**: Internationalization library.
- **date-fns**: Date manipulation utility.
- **PostCSS & Autoprefixer**: CSS processing tools.

### Cloud Services
- **Cloudflare R2**: Object storage for production images (bucket: `odanet-uploads`).
- **Cloudflare CDN**: Custom domain (`cdn.odanet.com.tr`) for optimized image delivery with runtime URL normalization.
- **AWS SDK S3 Client**: Used for R2 API compatibility for image uploads/downloads.- **AWS SDK S3 Client**: Used for R2 API compatibility for image uploads/downloads.

## Recent Changes (October 18, 2025)

### Fixed Seeker Schema & Added Mixed Homepage Feed (October 18, 2025)
- **Schema Migration**: Removed legacy `is_smoker` and `has_pets` boolean fields
  - Now using normalized preference fields: `smoking_preference`, `pet_preference`, `cleanliness_level`
  - Updated client form to use new fields with proper defaults (`no-preference`, `average`)
  - Pushed schema changes to database successfully
- **New Mixed Feed API**: Created `/api/feed` endpoint
  - Returns merged array of recent listings and seeker profiles (up to 24 items)
  - Sorted by creation date descending for fresh content
  - Each item has type discriminator (`listing` or `seeker`)
- **MixedFeed Component**: New homepage component at `client/src/components/MixedFeed.tsx`
  - Displays listings and seekers together in unified grid
  - SeekerMiniCard with budget badge, location, and "Oda Arayan" label
  - Mobile-first responsive design (2 cols mobile, 3 tablet, 4 desktop)
  - Proper loading states and error handling
- **Homepage Simplified**: Replaced separate sections with single `<MixedFeed />` component
  - Cleaner code, single source of truth from API
  - Better performance with one API call instead of multiple
- **Bug Fix**: Server routes now correctly maps listing `address` to `suburb` for frontend compatibility

### Enhanced Error Handling for Seeker Profile Creation (October 18, 2025)
- **Client-Side Improvements**:
  - Added detailed console logging for form submission payload and API responses
  - Enhanced error display to show actual error messages instead of generic messages
  - Added try-catch block in mutation function to properly catch and propagate errors
  - Error toast now displays the actual error message from the server
- **Server-Side Improvements**:
  - Added comprehensive logging for POST /api/seekers endpoint
  - Logs request body, userId from JWT, and parsed seeker data
  - Enhanced Zod validation error logging with detailed error array
  - Server now returns validation error details in response for better debugging
- **Purpose**: These changes help diagnose issues with seeker profile creation by providing clear, actionable error messages in both browser console and server logs

### Consistent Menu & Mixed Homepage Cards (October 18, 2025)
- **Homepage Mixed Cards**: Room listings and seeker profiles now display together on homepage
  - Created sample seeker profiles (Ahmet Yılmaz, Ayşe Demir) for demonstration
  - Home page shuffles and mixes both listing types in randomized order
  - Maximum 24 cards displayed from combined pool
- **Consistent Header Menu**: All navigation options now visible for both logged-in and logged-out users
  - **Favorites Icon**: Always visible (orange gradient), redirects to login if not authenticated
  - **Messages Icon**: Always visible (violet background), redirects to login if not authenticated
  - **Desktop**: Shows Login/Signup buttons for guests, Profile/Logout for authenticated users
  - **Mobile Menu**: Works for all users with appropriate auth-specific options
    - All users see: Favoriler, Mesajlar, Oda İlanı Ver, Oda Arama İlanı Ver
    - Logged out: Shows "Giriş Yap" and "Üye Ol" at bottom
    - Logged in: Shows "Profil" and "Çıkış Yap" at bottom

### Social Share Previews Implementation (October 18, 2025)
- **Open Graph Handler**: Created `server/og.ts` with bot detection and dynamic meta tag generation
  - Detects social media bots (WhatsApp, Facebook, Twitter, LinkedIn, Telegram, Discord, Pinterest)
  - Returns server-side rendered HTML with OG tags for bots, regular SPA for users
  - Manual testing available via `?_og=1` query parameter
- **Route Integration**: OG handlers registered in `server/index.ts` before Vite/static middleware
  - Homepage: Branded OG tags with fallback image
  - Listing detail (`/oda-ilani/:id`): Dynamic title, location, and primary image
  - Seeker detail (`/oda-arayan/:id`): User name, location preference, and profile photo
- **Public Assets**: Created `client/public/` folder structure for static assets
  - Favicon and app icons at root level
  - OG share images in `/og/` subfolder (og-home.jpg as fallback)
  - Vite automatically copies public folder contents to build output
- **Meta Tags**: Comprehensive OG and Twitter card implementation
  - Title, description, canonical URL, site name
  - Image with dimensions (1200x630 for optimal display)
  - Auto-redirects bots to actual page after crawling
- **CDN Integration**: Image URLs normalized to use Cloudflare CDN domain for optimal delivery
  - Production: Uses R2_PUBLIC_URL (cdn.odanet.com.tr)
  - Development: Falls back to local paths

### Seeker Photo Upload Implementation (October 18, 2025)
- **New Endpoints**: Created `/api/seekers/:id/photo` (singular) for profile photo management
  - POST endpoint accepts single 'photo' file upload via multipart/form-data
  - Uploads to Cloudflare R2 storage using existing R2 utilities
  - Updates `profilePhotoUrl` field in database immediately
  - Also adds photo to `seeker_photos` table with sortOrder 0
  - DELETE endpoint removes profile photo (sets profilePhotoUrl to null)
- **Form Integration**: CreateSeekerProfile form already configured correctly
  - Uses FormData to send photo with 'photo' field name
  - Uploads photo after profile creation/update
  - Displays selected file name and existing photo status
  - Supports photo deletion with confirmation
- **Display Logic**: SeekerCard and SeekerDetail use existing getAbsoluteImageUrl helper
  - Priority: profilePhotoUrl → photos[0] → initials avatar fallback
  - Cloudflare CDN URL normalization automatic
  - No frontend code changes needed for display

### UI Consistency & Mobile Optimization (October 18, 2025)
- **Mobile-First Grid**: Changed from 2-column mobile to 1-column mobile layout
  - Mobile: `grid-cols-1` (1 card per row for better focus)
  - Tablet: `md:grid-cols-2` (2 cards per row)
  - Desktop: `lg:grid-cols-3` (3 cards per row)
- **Responsive Aspect Ratios**: Optimized image ratios for different screen sizes
  - ListingCard images: `aspect-[5/4]` mobile (more vertical), `sm:aspect-[4/3]` tablet, `lg:aspect-[16/10]` desktop
  - SeekerCard images: `aspect-[4/5]` mobile (taller portraits), `sm:aspect-[4/3]` tablet
  - Images use `absolute inset-0` for proper aspect ratio fill
- **Equal Content Heights**: All cards have `min-h-[110px]` content areas with `flex justify-center`
  - Ensures visual consistency even with varying text lengths
  - No more mismatched card heights or excessive white space
- **Simplified ListingCard**: 
  - Removed duplicate address displays and location pills from images
  - Clean single address line below title with proper truncation
  - Reduced padding: `px-3 pb-3 sm:px-4 sm:pb-4` for tighter spacing
  - Title: `line-clamp-2` with responsive sizing `text-[15.5px] sm:text-[17px]`
  - Address: `truncate` with responsive sizing `text-[13px] sm:text-sm`
- **Redesigned SeekerCard**: 
  - Taller portrait photos on mobile eliminate white space
  - Budget badge (emerald green) in top-left, "Oda Arayan" label (violet) in top-right
  - Content area: `p-4 min-h-[110px]` for consistency
  - Simplified info: name (line-clamp-1), location (truncate), age
- **New CombinedFeed Component**: Replaced MixedFeed
  - Fetches both listings and seekers in parallel with `useQueries`
  - Interleaves results (seeker, listing, seeker, listing...) for variety
  - Single unified grid instead of separate sections
  - Shows "Henüz ilan yok" when empty
