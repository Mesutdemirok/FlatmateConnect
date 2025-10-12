# Odanet - Flatmate & Room Rental Platform

## Overview
Odanet is a flatmate and room rental platform for the Turkish market, connecting individuals seeking shared accommodation with room providers. The platform emphasizes verified profiles, smart matching, and secure communication to build a trustworthy environment for finding compatible flatmates and rental opportunities. Its core capabilities include user profile management, a comprehensive listing system, seeker profiles, real-time messaging, and search & filtering functionalities.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **Authentication**: JWT-based with httpOnly cookies, bcrypt password hashing
- **Email Service**: Nodemailer for verification and password reset emails
- **SMS/OTP Service**: Twilio for phone verification
- **File Handling**: Multer for image uploads (local storage)
- **API Design**: RESTful, standardized error handling, Turkish error messages
- **System Design**: Modular schema, proper foreign key relationships with cascade deletes. Health endpoint (`/api/health`) for monitoring.

### Key Features
- **Authentication System**: Multi-method authentication (email/password, Google OAuth placeholder, phone/SMS OTP), email verification, password reset, JWT with httpOnly cookies, auto-redirect to /profil after login/register
- **User Management**: Profile creation, verification, image uploads
- **Listing System**: Detailed room listings with multiple images, descriptions, and filtering
- **Seeker Profiles**: Comprehensive profiles for those seeking accommodation, including preferences and photos
- **Messaging System**: Real-time communication between users
- **Favorites System**: Save and manage favorite listings
- **Search & Filtering**: Location-based search with various filters (price, availability, features)
- **File Upload System**: Local storage, image validation, multiple image support

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

### Authentication & Communication
- **JWT**: Token-based authentication with httpOnly cookies
- **bcrypt**: Password hashing
- **Nodemailer**: Email service for verification and password reset
- **Twilio**: SMS/OTP service for phone verification
- **Passport.js**: Authentication middleware (available for OAuth integration)

### Utilities
- **i18next**: Internationalization
- **date-fns**: Date manipulation
- **PostCSS & Autoprefixer**: CSS processing