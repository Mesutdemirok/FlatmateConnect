# Odanet - Flatmate & Room Rental Platform

## Overview

Odanet is a modern flatmate and room rental platform built for the Turkish market, designed to connect people seeking shared accommodation with room providers. The platform focuses on verified profiles, smart matching, and secure communication to create a trustworthy environment for finding compatible flatmates and rental opportunities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: React Query (@tanstack/react-query) for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: i18next with Turkish language support as the primary locale
- **Authentication**: Integration with Replit Auth system for user management

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with session-based authentication using express-session
- **File Handling**: Multer for image uploads with local storage in uploads directory
- **API Design**: RESTful API structure with standardized error handling

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Modular schema design with separate tables for users, listings, listing images, user preferences, messages, favorites, seeker profiles, and seeker photos
- **Session Storage**: Dedicated sessions table for Replit Auth compatibility
- **Relationships**: Proper foreign key relationships with cascade deletes for data integrity

### Key Features Architecture
- **User Management**: Profile creation with verification status, preferences, and image uploads
- **Listing System**: Room listings with multiple images, detailed descriptions, and filtering capabilities
- **Seeker Profiles**: Room-seeking profiles for users looking for accommodation with budget, location preferences, move-in dates, and personal details
- **Messaging System**: Real-time messaging between users with conversation management
- **Favorites System**: Users can save and manage favorite listings
- **Search & Filtering**: Location-based search with price range, availability, and feature filters

### File Upload System
- Local file storage with organized directory structure
- Image validation for type and size limits
- Multiple image support for listings with primary image designation

## External Dependencies

### Database Services
- **Neon Database**: PostgreSQL hosting service (@neondatabase/serverless)
- **connect-pg-simple**: PostgreSQL session store for express-session

### UI Component Libraries
- **Radix UI**: Comprehensive set of accessible React components (@radix-ui/*)
- **Lucide React**: Icon library for consistent iconography
- **class-variance-authority**: Utility for component variant management

### Development Tools
- **Vite**: Fast build tool with HMR and development server
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database migration and schema management tool
- **Replit Plugins**: Development integration with @replit/vite-plugin-* packages

### Form Management
- **React Hook Form**: Form state management with @hookform/resolvers
- **Zod**: Schema validation with drizzle-zod for database schema validation

### Authentication Infrastructure
- **Replit Auth**: OIDC-based authentication system
- **Passport.js**: Authentication middleware integration
- **memoizee**: Caching for OIDC configuration

### Additional Services
- **i18next**: Internationalization with browser language detection
- **date-fns**: Date manipulation and formatting utilities
- **PostCSS & Autoprefixer**: CSS processing and vendor prefixing

## Recent Changes

### October 11, 2025 - Listing Display & Pricing Format Updates
- **Listing Detail Page Data Binding**: Fixed all listing data fields to display correctly using proper schema fields
  - Now shows: address, title, rentAmount, propertyType, furnishingStatus, bathroomType, totalRooms, totalOccupants, roommatePreference, smokingPolicy, amenities, excludedBills
  - Removed references to old fields (city, suburb, postcode, roomType, furnished, bondAmount)
  - Added proper Turkish labels for all property details
- **Monthly Pricing Format**: Changed pricing display from weekly to monthly across entire application
  - ListingDetail: ₺X/ay instead of per_week
  - FeaturedListings: ₺X/ay format for all listings
  - ListingCard: ₺X/ay instead of /week
  - FeaturedRoomSeekers: Fixed to use budgetMonthly field, display ₺X/ay
- **Owner Section Cleanup**: Removed rating/star display from listing detail pages
  - Removed Star icon import
  - Clean display with only owner name, "Mülk Sahibi" label, and verified badge
- **Homepage Listing Cards**: Updated to show dynamic data from database
  - Card titles now show actual listing titles from database
  - Addresses display properly below titles
  - Removed hardcoded repetitive placeholder text
- **Homepage Section Titles**: 
  - Added "Güncel İlanlar" section header above listings
  - Removed subtitle "Evinize uygun ev arkadaşı bulun" from "Oda Arayanlar" section
- **Design Consistency**: Improved spacing, alignment, and typography for better visual hierarchy

### October 11, 2025 - UI/UX Improvements & Form Enhancements
- **Header Button Visibility**: Updated "Profil" and "Çıkış Yap" buttons with white background and indigo-700 text for better contrast against the purple gradient header
- **Icon Styling**: Enhanced heart and message icons to be thicker (h-6 w-6, strokeWidth 2.5) with improved background contrast (bg-white/10 hover:bg-white/20)
- **Property Type Update**: Removed "Apartman" option from property type dropdown, keeping Rezidans, Daire, Müstakil Ev, and Diğer
- **Conditional Bill Fields**: Added dynamic excluded bills checkboxes (Su, Elektrik, Telefon, Doğalgaz, İnternet) that appear when "Fiyata Faturalar Dahil mi?" is set to "Hayır"
  - Added excludedBills field to database schema as text array
  - Form properly captures and submits excluded bill selections
  - Database migration successfully applied

### October 11, 2025 - Homepage Image Display & Section Reordering
- **Listing Images Fixed**: Updated FeaturedListings component to properly extract image paths from images array
  - Primary image selection: `listing.images?.find(img => img.isPrimary)?.imagePath`
  - Fallback to first image if no primary: `listing.images?.[0]?.imagePath`
  - Unsplash fallback for listings without images
- **Static File Serving**: Added Express static middleware to serve uploaded files from `/uploads` directory
  - Images now accessible via HTTP at `/uploads/listings/*` paths
  - Confirmed working with uploaded PNG and JPEG files
- **Homepage Layout**: Reordered sections to prioritize room listings over seeker profiles
  - New order: Hero → FeaturedListings → FeaturedRoomSeekers
  - Improved user experience by showing available rooms first

### October 11, 2025 - Complete Turkish URL Implementation
- **Turkish URL Structure**: Converted all application URLs to Turkish for local market SEO and user experience
  - Route mappings: `/auth/login` → `/giris`, `/auth/register` → `/uye-ol`, `/profile` → `/profil`, `/messages` → `/mesajlar`, `/create-listing` → `/ilan-olustur`, `/search` → `/oda-ilanlari`, `/listing/:id` → `/oda-ilani/:id`, `/seeker/:id` → `/oda-arayan/:id`, `/favorites` → `/favoriler`, `/how-it-works` → `/nasil-calisir`
- **Client-Side Navigation**: All navigation uses Wouter's `setLocation` hook instead of `window.location.href` for smooth SPA experience
- **Protected Routes**: Updated ProtectedRoute to redirect to `/giris?next=...` with Turkish URLs
- **Authentication Flow**: Login/Register pages properly handle next parameter for post-login redirection to Turkish URLs
- **Component Updates**: Updated all feature components (Header, FeaturedListings, FeaturedRoomSeekers, ListingCard, CTASection) to use Turkish URLs
- **Page Components**: Messages, Profile, CreateListing, ListingDetail all use Turkish navigation and redirects

### October 11, 2025 - Critical UX Fixes & Navigation Improvements
- **Form Submission Fix**: Resolved CreateListing form submission bug by removing synchronous `setIsSubmitting(false)` call that prevented async mutations
- **Public Seeker Access**: Made seeker profiles publicly accessible by unifying homepage experience - all users (guest and authenticated) now see identical Home page
- **Seeker Detail Pages**: Created SeekerDetail component with full profile display and fixed 404 errors when clicking seeker cards
- **Login Flow Enhancement**: Updated login to redirect to /profile page with personalized Turkish welcome toast ("Hoş geldiniz, {username}!") instead of homepage
- **SPA Navigation**: Replaced all full-page redirects (window.location.href) with client-side navigation (setLocation) for smooth single-page app experience
  - Fixed CreateListing unauthorized redirects to use client-side routing
  - Proper next parameter handling for post-login navigation
- **Form Validation**: Enhanced validation messages with specific Turkish error messages for better user experience
- **Loading State Management**: Added proper finally blocks to prevent stuck loading states

### October 11, 2025 - Seeker/Room-Seeking Functionality
- **Database**: Extended PostgreSQL schema with `seekerProfiles` and `seekerPhotos` tables
  - Added fields: firstName, lastName, age, gender, budgetWeekly, preferredLocations, moveInDate, occupation, smokingStatus, petOwner, isFeatured
  - Implemented proper relations with users table and photos table with cascade deletes
- **Backend API**: Created comprehensive REST endpoints for seeker profiles
  - GET `/api/seekers` - List all seekers with filtering support (budget, gender, location)
  - GET `/api/seekers/featured` - Get featured seeker profiles
  - GET `/api/seekers/:id` - Get single seeker profile by ID
  - GET `/api/seekers/user/:userId` - Get seeker profile by user ID
  - POST `/api/seekers` - Create new seeker profile (authenticated)
  - PUT `/api/seekers/:id` - Update seeker profile (authenticated, owner only)
  - DELETE `/api/seekers/:id` - Delete seeker profile (authenticated, owner only)
  - POST `/api/seekers/:id/photos` - Upload seeker photos with multer (max 5 photos)
  - DELETE `/api/seekers/:seekerId/photos/:photoId` - Delete seeker photo
- **Storage Layer**: Added seeker CRUD methods to storage interface mirroring listing patterns
- **Frontend**: 
  - Created `FeaturedRoomSeekers` component with real API integration using React Query
  - Added seeker API client (`client/src/lib/seekerApi.ts`) for frontend-backend communication
  - Integrated FeaturedRoomSeekers section on homepage with purple gradient styling
  - Added formatMonthlyPrice utility function for Turkish price formatting
- **Data Seeding**: Created seed script with 3 sample Turkish seeker profiles (Ayşe Yılmaz, Mehmet Demir, Zeynep Kaya)