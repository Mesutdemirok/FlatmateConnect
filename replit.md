# Odanet - Flatmate & Room Rental Platform

## Overview
Odanet is a flatmate and room rental platform for the Turkish market, connecting individuals seeking shared accommodation with room providers. It focuses on verified profiles, intelligent matching, and secure communication to build a trustworthy environment. Key capabilities include comprehensive user and listing management, seeker profiles, real-time messaging, and advanced search and filtering.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a mobile-first design with consistent branding. Web app uses shadcn/ui with Radix components and teal/turquoise primary color (#00A6A6). Mobile app rebuilt with purple gradient design system (#7F00FF → #E100FF) matching new brand identity, featuring gradient headers, white cards with gradient shadows, rounded corners (16px), and icon-based navigation. Logo displays at top with platform tagline "Güvenilir ve şeffaf oda arama deneyimi". Home screen features unified feed showing both room listings and seeker profiles mixed chronologically (sorted by createdAt descending), matching website homepage experience. All screens use real API data with proper loading and empty states.

### Technical Implementations
- **Frontend (Web)**: React with TypeScript (Vite), Tailwind CSS, shadcn/ui, Radix UI for accessibility. State management uses React Query for server state and React hooks for local state. Wouter handles client-side routing, and i18next provides internationalization (Turkish primary locale).
- **Frontend (Mobile)**: Expo SDK 54 + React Native 0.81.5, Expo Router for file-based navigation, React Native StyleSheet API for all styling with centralized theme system (theme/colors.ts, fonts.ts, spacing.ts). Purple gradient design (#7F00FF → #E100FF) with light violet background (#F7F5FB), white cards with gradient shadows. React Native Web support for unified web/mobile codebase. TanStack Query for data fetching, SecureStore for JWT token management with automatic Authorization header attachment, expo-linear-gradient for all gradient effects. Custom UI components (PrimaryButton with purple gradient, SecondaryButton with gradient outline, ListingCard, SeekerCard) all using theme tokens. Home screen displays unified chronological feed of both listings and seekers sorted by createdAt (newest first), mirroring website homepage. Login/Register screen with purple gradient header and tab switcher. Profile screen with gradient header, white menu cards, and "Popüler Oda Arkadaşları" horizontal scroll section. Images use onError fallback to display purple gradient placeholder (🏠 emoji + "Fotoğraf Yok"). Bottom tab navigation with purple active states (Home, Messages, Favorites, Profile). Production-ready with EAS build configuration for Android and iOS deployment.
- **Backend**: Express.js with TypeScript. PostgreSQL is used as the database with Drizzle ORM. The API is RESTful with standardized error handling.
- **Authentication**: Unified JWT-based authentication supporting both Google OAuth and email/password. All auth flows set identical secure cookies (`auth_token`) with SameSite=None, Secure flags, and domain `.odanet.com.tr` for production. OAuth callback: `https://www.odanet.com.tr/api/oauth/google/callback`. Mobile app uses SecureStore for token persistence with automatic header attachment. Google OAuth for mobile requires backend to redirect to `odanet://auth?token=<JWT>` for token capture via WebBrowser.openAuthSessionAsync.
- **File Upload System**: Supports multiple image uploads, optimized for mobile with HEIC/HEIF to JPEG conversion, compression, and resizing using Sharp and Busboy. Cloudflare R2 serves as the CDN for production image delivery. All upload endpoints require JWT authentication with ownership verification.
- **SEO**: Implemented with React Helmet for dynamic meta tags, Open Graph, and Twitter card generation for social media sharing. Slugs are generated for listings and seeker profiles for SEO-friendly URLs.
- **Blog System**: Markdown-based content management using gray-matter for frontmatter parsing and react-markdown with remark-gfm for rendering. Blog posts stored as .md files in src/content/blog/ with YAML frontmatter (slug, title, description, date, author, image). Vite configured with vite-plugin-node-polyfills to provide Buffer/global/process polyfills for Node.js libraries in browser environment.
- **SEO Optimization**: Comprehensive sitemap.xml auto-generated via scripts/generateSitemap.js, dynamically fetching all active listings, published seeker profiles, and blog posts from API endpoints. RSS feed (rss.xml) generated for blog content. robots.txt configured for search engine crawlers. Sitemap includes 40+ URLs with proper priorities and change frequencies. Run `node scripts/generateSitemap.js` to regenerate after content changes. 301 redirect middleware automatically redirects legacy UUID-only URLs (`/oda-ilani/{uuid}`) to SEO-friendly slug-based URLs (`/oda-ilani/{slug}`) for better search engine indexing and link equity preservation.
- **Mobile Build System**: EAS (Expo Application Services) configured with development, preview, and production profiles. Android builds use APK format for preview (easy sharing) and AAB for production (Play Store). iOS builds configured with bundle identifier and resource classes. All dependencies aligned with Expo SDK 51 (16/16 expo-doctor checks passed).

### Feature Specifications
- **User Management**: Profile creation, verification, and image uploads.
- **Listing System**: Detailed room listings with multiple images and filtering.
- **Seeker Profiles**: Comprehensive profiles for accommodation seekers with dedicated detail pages on both web and mobile platforms.
- **Messaging System**: Real-time communication.
- **Favorites System**: Allows users to save and manage favorite listings.
- **Search & Filtering**: Location-based search with various filters for both room and flatmate searches. Web seeker filtering supports location and budget parameters via /api/seekers/public endpoint.
- **Homepage Feed**: Unified chronological feed displaying both listings and seeker profiles sorted by createdAt descending (newest first), matching website homepage UX. Mobile app fetches both datasets simultaneously and interleaves them for seamless browsing.
- **Seeker Detail Pages**: Mobile seeker detail screen (app/seeker/[id].tsx) displays complete profile information including photo (with automatic URL normalization), name, budget, location, demographics, preferences, and bio. Contact button enables direct messaging.

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
- **gray-matter**: YAML frontmatter parsing for Markdown blog posts.
- **react-markdown**: Markdown rendering in React components.
- **remark-gfm**: GitHub-flavored Markdown syntax support.
- **vite-plugin-node-polyfills**: Browser polyfills for Node.js modules (Buffer, process, global).

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