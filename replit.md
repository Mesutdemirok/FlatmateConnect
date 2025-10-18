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

### Cloud Services
- **Cloudflare R2**: Object storage for images (bucket: `odanet-uploads`).
- **Cloudflare CDN**: Custom domain (`cdn.odanet.com.tr`) for image delivery.
- **AWS SDK S3 Client**: R2 API compatibility.