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
- **AWS SDK S3 Client**: Used for R2 API compatibility for image uploads/downloads.