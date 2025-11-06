# Odanet - Flatmate & Room Rental Platform

## Overview
Odanet is a flatmate and room rental platform for the Turkish market, connecting individuals seeking shared accommodation with room providers. It focuses on verified profiles, intelligent matching, and secure communication to build a trustworthy environment. Key capabilities include comprehensive user and listing management, seeker profiles, real-time messaging, and advanced search and filtering.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a mobile-first design with consistent branding, utilizing orange accents, gradient backgrounds, rounded cards, and icon-based feature chips. It includes responsive card layouts with dynamic aspect ratios, address overlays, and optimized mobile-first grids.

### Technical Implementations
- **Frontend (Web)**: React with TypeScript (Vite), Tailwind CSS, shadcn/ui, Radix UI for accessibility. State management uses React Query for server state and React hooks for local state. Wouter handles client-side routing, and i18next provides internationalization (Turkish primary locale).
- **Frontend (Mobile)**: Expo SDK 51 + React Native 0.74, Expo Router for file-based navigation, NativeWind v4 for Tailwind styling, TanStack Query for data fetching, SecureStore for JWT token management. Production-ready with EAS build configuration for Android and iOS deployment.
- **Backend**: Express.js with TypeScript. PostgreSQL is used as the database with Drizzle ORM. The API is RESTful with standardized error handling.
- **Authentication**: Unified JWT-based authentication supporting both Google OAuth and email/password. All auth flows set identical secure cookies (`auth_token`) with SameSite=None, Secure flags, and domain `.odanet.com.tr` for production. OAuth callback: `https://www.odanet.com.tr/api/oauth/google/callback`. Mobile app uses SecureStore for token persistence with automatic header attachment.
- **File Upload System**: Supports multiple image uploads, optimized for mobile with HEIC/HEIF to JPEG conversion, compression, and resizing using Sharp and Busboy. Cloudflare R2 serves as the CDN for production image delivery. All upload endpoints require JWT authentication with ownership verification.
- **SEO**: Implemented with React Helmet for dynamic meta tags, Open Graph, and Twitter card generation for social media sharing. Slugs are generated for listings and seeker profiles for SEO-friendly URLs.
- **Mobile Build System**: EAS (Expo Application Services) configured with development, preview, and production profiles. Android builds use APK format for preview (easy sharing) and AAB for production (Play Store). iOS builds configured with bundle identifier and resource classes. All dependencies aligned with Expo SDK 51 (16/16 expo-doctor checks passed).

### Feature Specifications
- **User Management**: Profile creation, verification, and image uploads.
- **Listing System**: Detailed room listings with multiple images and filtering.
- **Seeker Profiles**: Comprehensive profiles for accommodation seekers.
- **Messaging System**: Real-time communication.
- **Favorites System**: Allows users to save and manage favorite listings.
- **Search & Filtering**: Location-based search with various filters for both room and flatmate searches.
- **Homepage Feed**: A mixed feed displaying both listings and seeker profiles.

### System Design Choices
The system employs a modular schema with foreign key relationships for robust data management. Backend fallbacks for slug-based lookups ensure backward compatibility with ID-based URLs.

## External Dependencies

### Database & ORM
- **Neon Database**: PostgreSQL hosting.
- **Drizzle ORM**: Database interactions and schema management.
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
- **Google OAuth 2.0**: Social login via openid-client.

### Utilities
- **i18next**: Internationalization.
- **date-fns**: Date manipulation.
- **Sharp & Busboy**: Image processing for uploads.
- **nanoid**: Compact, URL-safe unique ID generation.
- **slugify**: Turkish-locale URL slug generation.

### Cloud Services
- **Cloudflare R2**: Object storage for images (`odanet-uploads` bucket).
- **Cloudflare CDN**: Custom domain (`cdn.odanet.com.tr`) for image delivery.
- **AWS SDK S3 Client**: Used for R2 API compatibility.

### Analytics
- **Google Analytics 4**: Event tracking (ID: G-ME5ES9KLDE) with automatic pageview tracking via Wouter routing and custom event tracking.

### Mobile Development
- **Expo SDK 51**: Complete mobile framework with EAS build support.
- **React Native 0.74.5**: Native iOS and Android components.
- **Expo Router 3.5.24**: File-based routing matching web patterns.
- **NativeWind 4.2.1**: Tailwind CSS for React Native with Reanimated 3.x.
- **EAS CLI 16.26.0**: Production build system for app store deployment.
- **EAS Project**: Configured with ID a21f0bc7-a5a4-417c-9eea-3e7ad1915192, ready for preview and production builds.