# Odanet - Flatmate & Room Rental Platform

## Overview
Odanet is a flatmate and room rental platform for the Turkish market, connecting individuals seeking shared accommodation with room providers. It aims to build a trustworthy environment through verified profiles, intelligent matching, and secure communication. The platform offers comprehensive user and listing management, seeker profiles, real-time messaging, and advanced search and filtering capabilities. The business vision is to become the leading platform for shared accommodation in Turkey, leveraging intelligent technology and a user-centric design to solve common pain points in the rental market.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (Nov 11, 2025)

### Phase 8: Deployment Migration Fix and Diagnostics (Latest)
- **Critical Fix**: Restored corrupted server/routes.ts file from git history after accidental overwrite.
- **TypeScript Fixes**: 
  - Fixed slug property type error in seeker profile update endpoint by properly handling partial schema updates
  - Removed invalid props (imageAspect, addressOverlay) from CombinedFeed.tsx ListingCard usage
- **Migration Cleanup**: Removed all migration folders (drizzle/ and migrations/) to prevent "stage already exists" validation errors during deployment.
- **Database Schema Sync**: 
  - Added missing columns to both Development and Production databases via SQL ALTER TABLE
  - Columns added: description, deposit, move_in_date, min_stay_months, latitude, longitude
  - Both databases now fully synchronized with shared/schema.ts
- **Diagnostics Endpoint**: Added /api/_diag endpoint that returns database name, listing count, and seeker count for deployment verification.
- **Homepage Fix**: Resolved "column does not exist" errors preventing listings from displaying - all 28 listings now visible in CombinedFeed.
- **Deployment Ready**: All migration validation errors resolved, zero destructive SQL operations, Production and Development schemas fully synchronized.
- **Status**: Production-ready with 28 listings and 14 seekers verified and displaying correctly.

### Phase 7: Complete Turkish Localization and Color-Enhanced Cards
- **Database Schema Fix**: Added missing Phase 4 columns (description, deposit, move_in_date, min_stay_months, city/district/neighborhood, latitude/longitude) to production database, resolving "column does not exist" errors that prevented listings from displaying.
- **Full Turkish Translation**: All card text now in Turkish only - "YENİ" badge, "Şimdi müsait" availability, "22 yaşında Kadın" age/gender format, Turkish date formatting with TR locale.
- **Enhanced Visual Design**:
  - **ListingCard**: Teal price (₺12.500 ay), colored icons (teal bed, blue bath, purple users), thinner font-semibold text, no decimal places on prices
  - **SeekerCard**: Purple budget (₺14.000 ay), availability replaces occupation field, thinner text styling, cleaner number formatting
- **4:3 Image Carousels**: White circular navigation arrows, image counter badges, "YENİ" badge in Turkish, white star favorites (not hearts)
- **Number Formatting**: Removed .00 decimals from prices using Math.round() and .replace(), uses Turkish locale thousand separators (e.g., 12.500 not 12,500)
- **Color System**: Teal for listings (price, bed icons), purple for seekers (budget), blue for bathrooms, consistent brand colors across cards
- **Status**: Architect-approved, production-ready. Backend serving 27 active listings successfully.

### Phase 6: Editable Profile Dashboard with Personal Info and Listings Management
- **Backend API**: Implemented PATCH /api/users/me for updating personal info (firstName, lastName, phone, bio), GET /api/my-listings with _skipStatusFilter for fetching all user listings including drafts, and GET /api/seekers/user/:userId with ownership enforcement and _skipActiveCheck for user's own profile access.
- **Security**: Ownership validation on seeker profile endpoint (403 if userId mismatch), whitelisted updatable fields in user endpoint, all endpoints require JWT authentication.
- **Web Profile Page**: Made "Kişisel Bilgiler" tab editable with React Hook Form + Zod validation, auto-population from user data, Save/Cancel buttons with loading states, and proper error handling.
- **My Listings Tab**: Displays all user's room listings and seeker profile including drafts, shows status badges (Aktif/Pasif) to distinguish active vs inactive content.
- **Type Safety**: Added userId and _skipStatusFilter to IStorage.getListings, userId and _skipActiveCheck to IStorage.getSeekerProfiles, ensuring TypeScript compliance across storage contract.
- **Status**: Architect-approved, production-ready implementation with proper cache invalidation and auth error handling.

### Phase 5: Enhanced Listing Detail Pages with 8 Comprehensive Sections
- **Web Detail Page**: Added Description section (whitespace-preserved formatting), Address/Location section (city/district/neighborhood with teal icon, fallback to address), and Terms section (deposit, move-in date, min stay with purple theme and defensive validation).
- **Mobile Detail Page**: Added Location section (accent-colored icon with structured address) and Terms section (grid layout with deposit/move-in/min stay, purple icons, Turkish formatting).
- **Defensive Validation**: IIFE pattern with null/NaN guards for deposit, moveInDate, minStayMonths. Sections hide completely if no valid data exists.
- **React Native Compatibility**: Replaced unsupported `gap` with explicit margins for consistent cross-device layout.
- **8-Section Compliance**: Hero carousel ✅, Summary row ✅, Address ✅, Landlord ✅, Description ✅, Room Details ✅, Terms ✅, Contact CTA ✅.
- **Status**: Architect-approved, production-ready implementation with backward compatibility.

### Phase 4: Enhanced Listing Cards with Modern Design
- **Schema Extension**: Added 10 optional fields (city, citySlug, district, districtSlug, neighborhood, neighborhoodSlug, description, deposit, moveInDate, minStayMonths, latitude, longitude).
- **Modernized Cards**: Web and mobile ListingCard rebuilt with 16:9 images, dynamic badges (NEW/UPDATED), bottom white overlays, purple pricing, teal location icons, favorite toggles, and location fallback logic.
- **Production Quality**: Uses centralized image helpers, robust error handling, TypeScript type safety, performance optimization (useMemo), testid attributes.

## System Architecture

### UI/UX Decisions
The platform prioritizes a mobile-first design with consistent branding. The web application uses shadcn/ui with Radix components, featuring a teal/turquoise primary color. The mobile application employs a purple gradient design system, including gradient headers, white cards with gradient shadows, rounded corners, and icon-based navigation. The logo and tagline "Güvenilir ve şeffaf oda arama deneyimi" are consistently displayed. The homepage features a unified chronological feed of both room listings and seeker profiles. All screens utilize real API data with appropriate loading and empty states.

### Technical Implementations
- **Frontend (Web)**: React with TypeScript (Vite), Tailwind CSS, shadcn/ui, and Radix UI. State management is handled by React Query and React hooks. Wouter provides client-side routing, and i18next manages internationalization (Turkish primary locale). Detail pages use SEO-friendly slug-based routing.
- **Frontend (Mobile)**: Built with Expo SDK and React Native, utilizing Expo Router for file-based navigation. Styling is managed via React Native's StyleSheet API with a centralized theme system. TanStack Query handles data fetching, and SecureStore manages JWT tokens. Custom UI components adhere to the purple gradient design system. The home screen displays a unified chronological feed of listings and seekers. Login/Register and Profile screens feature gradient headers and themed components. Bottom tab navigation uses purple active states.
- **Backend**: Developed with Express.js and TypeScript, using PostgreSQL as the database with Drizzle ORM. The API is RESTful, providing detail endpoints with eager-loaded relations and enforcing publish/active filters.
- **Configuration**: A centralized `config.ts` manages `API_URL`, `getImageUrl()` for image path normalization, and `getApiUrl()` for endpoint URL construction, ensuring consistency across platforms.
- **Authentication**: JWT-based authentication supports both Google OAuth and email/password, with secure cookies set for `.odanet.com.tr`. Mobile authentication uses SecureStore for token persistence.
- **File Upload System**: Supports multiple image uploads, optimized for mobile with HEIC/HEIF to JPEG conversion, compression, and resizing. Cloudflare R2 serves as the CDN. All uploads require JWT authentication and ownership verification.
- **SEO**: Implemented with React Helmet for dynamic meta tags, Open Graph, and Twitter card generation. Slugs are generated for listings and seeker profiles. A sitemap.xml and rss.xml are dynamically generated, and `robots.txt` is configured. 301 redirects handle legacy UUID-based URLs.
- **Mobile Build System**: EAS (Expo Application Services) is configured for Android and iOS, supporting development, preview, and production profiles.
- **Listing & Seeker Cards**: Redesigned ListingCard and SeekerCard with 4:3 image carousels, white circular navigation arrows, image counter badges, simple white "NEW" badges, white outlined star favorites, Turkish Lira (₺) with "ay" (monthly) suffix, clean white info sections, and room detail icons (Bed, Bath, Users) matching reference designs.
- **Image Fallback System**: `getImageUrl()` provides deterministic CDN-hosted placeholders for seekers and listings without images, using a robust hash function. Graceful degradation includes gradient placeholders for failed image loads.
- **Mandatory Image Validation**: Backend and frontend validation ensure `profilePhotoUrl` is present for seeker profiles and at least one image for listings (after draft creation), providing Turkish error messages.

### Feature Specifications
- **User Management**: Profile creation, verification, and image uploads. Editable profile dashboard with personal info form and listings management.
- **Listing System**: Detailed room listings with multiple images and filtering. Dashboard shows all user's listings including drafts.
- **Seeker Profiles**: Comprehensive profiles with dedicated detail pages. Dashboard shows user's own seeker profile including inactive states.
- **Messaging System**: Real-time communication.
- **Favorites System**: Users can save and manage favorite listings.
- **Search & Filtering**: Location-based search with various filters for both room and flatmate searches.
- **Homepage Feed**: A unified chronological feed of listings and seeker profiles.
- **Seeker Detail Pages**: Display complete profile information, including contact options.
- **Profile Dashboard**: Four-tab interface (Personal Info, Preferences, My Listings, Favorites) with editable forms, status badges, and quick action buttons.

### System Design Choices
The system uses a modular schema with foreign key relationships. Backend fallbacks for slug-based lookups ensure backward compatibility.

## External Dependencies

### Database & ORM
- **Neon Database**: PostgreSQL hosting.
- **Drizzle ORM**: Database interactions.
- **connect-pg-simple**: PostgreSQL session store.

### UI/UX Libraries
- **Radix UI**: Accessible React components.
- **Lucide React**: Icon library.
- **class-variance-authority**: Component variant management.

### Form Management & Validation
- **React Hook Form**: Form state management.
- **Zod**: Schema validation.

### Authentication
- **JWT (jsonwebtoken)**: Token-based authentication.
- **bcrypt**: Password hashing.
- **Google OAuth 2.0**: Social login via `openid-client`.

### Utilities
- **i18next**: Internationalization.
- **date-fns**: Date manipulation.
- **Sharp & Busboy**: Image processing for uploads.
- **nanoid**: Unique ID generation.
- **slugify**: Turkish-locale URL slug generation.
- **gray-matter**: YAML frontmatter parsing.
- **react-markdown**: Markdown rendering.
- **remark-gfm**: GitHub-flavored Markdown support.
- **vite-plugin-node-polyfills**: Browser polyfills.

### Cloud Services
- **Cloudflare R2**: Object storage for images.
- **Cloudflare CDN**: Custom domain for image delivery.
- **AWS SDK S3 Client**: For R2 API compatibility.

### Analytics
- **Google Analytics 4**: Event tracking (ID: G-ME5ES9KLDE).

### Mobile Development
- **Expo SDK**: Mobile framework.
- **React Native**: Native iOS and Android components.
- **Expo Router**: File-based routing.
- **NativeWind**: Tailwind CSS for React Native.
- **EAS CLI**: Production build system.