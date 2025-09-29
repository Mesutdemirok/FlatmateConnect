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
- **Schema**: Modular schema design with separate tables for users, listings, listing images, user preferences, messages, and favorites
- **Session Storage**: Dedicated sessions table for Replit Auth compatibility
- **Relationships**: Proper foreign key relationships with cascade deletes for data integrity

### Key Features Architecture
- **User Management**: Profile creation with verification status, preferences, and image uploads
- **Listing System**: Room listings with multiple images, detailed descriptions, and filtering capabilities
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