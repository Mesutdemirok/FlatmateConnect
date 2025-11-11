# Odanet - Flatmate & Room Rental Platform

## Overview
Odanet is a flatmate and room rental platform for the Turkish market, connecting individuals seeking shared accommodation with room providers. It aims to build a trustworthy environment through verified profiles, intelligent matching, and secure communication. The platform offers comprehensive user and listing management, seeker profiles, real-time messaging, and advanced search and filtering capabilities. The business vision is to become the leading platform for shared accommodation in Turkey, leveraging intelligent technology and a user-centric design to solve common pain points in the rental market.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform prioritizes a mobile-first design with consistent branding. The web application uses shadcn/ui with Radix components, featuring a teal/turquoise primary color. The mobile application employs a purple gradient design system, including gradient headers, white cards with gradient shadows, rounded corners, and icon-based navigation. The logo and tagline "Güvenilir ve şeffaf oda arama deneyimi" are consistently displayed. The homepage features a unified chronological feed of both room listings and seeker profiles. All screens utilize real API data with appropriate loading and empty states. Listing and Seeker cards are redesigned with 4:3 image carousels, navigation arrows, image counters, "NEW" badges, outlined star favorites, and clean white info sections with Turkish Lira (₺) pricing.

### Technical Implementations
- **Frontend (Web)**: React with TypeScript (Vite), Tailwind CSS, shadcn/ui, and Radix UI. State management uses React Query and React hooks. Wouter provides client-side routing, and i18next handles internationalization (Turkish primary locale). Detail pages use SEO-friendly slug-based routing.
- **Frontend (Mobile)**: Built with Expo SDK and React Native, utilizing Expo Router for file-based navigation. Styling is managed via React Native's StyleSheet API with a centralized theme system. TanStack Query handles data fetching, and SecureStore manages JWT tokens. The home screen displays a unified chronological feed of listings and seekers. Login/Register and Profile screens feature gradient headers and themed components. Bottom tab navigation uses purple active states.
- **Backend**: Developed with Express.js and TypeScript, using PostgreSQL with Drizzle ORM. The API is RESTful, providing detail endpoints with eager-loaded relations and enforcing publish/active filters.
- **Configuration**: A centralized `config.ts` manages `API_URL`, `getImageUrl()` for image path normalization, and `getApiUrl()` for endpoint URL construction.
- **Authentication**: JWT-based authentication supports both Google OAuth and email/password, with secure cookies set for `.odanet.com.tr`. Mobile authentication uses SecureStore for token persistence.
- **File Upload System**: Supports multiple image uploads, optimized for mobile with HEIC/HEIF to JPEG conversion, compression, and resizing. Cloudflare R2 serves as the CDN. All uploads require JWT authentication and ownership verification. Mandatory image validation is in place for seeker profiles and listings.
- **SEO**: Implemented with React Helmet for dynamic meta tags, Open Graph, and Twitter card generation. Slugs are generated for listings and seeker profiles. A sitemap.xml and rss.xml are dynamically generated, and `robots.txt` is configured. 301 redirects handle legacy UUID-based URLs.
- **Mobile Build System**: EAS (Expo Application Services) is configured for Android and iOS.
- **Image Fallback System**: `getImageUrl()` provides deterministic CDN-hosted placeholders for seekers and listings without images, using a robust hash function. Graceful degradation includes gradient placeholders for failed image loads.

### Feature Specifications
- **User Management**: Profile creation, verification, image uploads, and an editable profile dashboard with personal info and listings management.
- **Listing System**: Detailed room listings with multiple images and filtering. Users can manage all their listings, including drafts. Listings include comprehensive sections for description, address/location, and terms (deposit, move-in date, min stay).
- **Seeker Profiles**: Comprehensive profiles with dedicated detail pages. Users can manage their own seeker profile, including inactive states.
- **Messaging System**: Real-time communication.
- **Favorites System**: Users can save and manage favorite listings.
- **Search & Filtering**: Location-based search with various filters for both room and flatmate searches.
- **Homepage Feed**: A unified chronological feed of listings and seeker profiles.

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