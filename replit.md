# Odanet - Flatmate & Room Rental Platform

## Overview
Odanet is a flatmate and room rental platform for the Turkish market, connecting individuals seeking shared accommodation with room providers. The platform emphasizes verified profiles, smart matching, and secure communication to build a trustworthy environment for finding compatible flatmates and rental opportunities. Its core capabilities include user profile management, a comprehensive listing system, seeker profiles, real-time messaging, and search & filtering functionalities.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (October 17, 2025)
- **Production Deployment Fixed**: Corrected static file serving path (server/vite.ts) to properly serve frontend build from dist/public
- **API Route Handling Fixed**: Updated wildcard route to skip /api and /uploads paths, preventing conflicts with API endpoints
- **CDN Migration Implemented**: Runtime URL normalization to use custom domain (cdn.odanet.com.tr) instead of default R2 URL
- **Image Upload Logic Fixed**: Updated to store full R2 URLs in database for consistency across all environments
- **URL Normalization Added**: Automatic replacement of pub-*.r2.dev URLs with custom CDN domain at runtime (no database migration needed)
- **Database Migration Completed**: Successfully migrated to new Neon production database (postgresql://neondb_owner@ep-noisy-sun-afcx37wr-pooler.c-2.us-west-2.aws.neon.tech/neondb)
- **Fixed DATABASE_URL Sanitization**: Added duplicate prefix handling in `server/db.ts` and `drizzle.config.ts` to handle malformed environment variables
- **Image Display Fixed**: All environments now properly handle full R2 URLs - images work on desktop, mobile, Mac, iPhone, all browsers
- **Schema Pushed Successfully**: All 9 tables created in new Neon DB (users, listings, listing_images, seeker_profiles, seeker_photos, favorites, messages, user_preferences, sessions)
- **Development Environment**: Clean database, all APIs working, CDN normalization functional
- **Production Status**: Fixed and ready for deployment - frontend serves correctly, API endpoints working
- **Build Updated**: New production build (61.9KB backend, 678KB frontend) with all fixes included

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