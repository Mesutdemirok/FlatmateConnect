# Overview

Odanet is a roommate and room rental matching platform for Turkey, connecting people seeking accommodation with those offering rooms. The application provides a modern, mobile-first experience with features including verified profiles, listing management, real-time messaging, and lifestyle compatibility matching.

Built as a full-stack web application with mobile app support via Expo, Odanet emphasizes safety, ease of use, and transparent communication between room seekers and room providers.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Web Application (Next.js + Vite)**
- **Framework**: Hybrid Next.js/Vite setup with React 18.3+
- **Routing**: Client-side routing using `wouter` library
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **State Management**: React Query (@tanstack/react-query) for server state
- **Internationalization**: i18next with browser language detection
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

**Mobile Application (Expo React Native)**
- **Framework**: Expo SDK 54+ with React Native 0.81.5
- **Navigation**: Expo Router v6 for file-based routing
- **Styling**: NativeWind (Tailwind for React Native)
- **API Integration**: Shared API client with web app using axios

**Design System**
- Primary color: Teal (#0EA5A7)
- Secondary color: Dark slate (#0F172A)
- Accent color: Orange (#F97316)
- Component library: Custom components built on Radix UI primitives
- Icons: Lucide React
- Typography: CSS variables for consistent theming across platforms

## Backend Architecture

**API Server (Express.js)**
- **Runtime**: Node.js 20.x
- **Framework**: Express 4.18+ with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: JWT-based auth with httpOnly cookies
- **Session Management**: Custom session handling with bcrypt password hashing
- **File Upload**: Multipart form handling with busboy
- **CORS**: Configured for both development and production domains

**Database Design**
- **ORM**: Drizzle ORM with strict mode disabled for Replit compatibility
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Migration Strategy**: Push-based migrations using `drizzle-kit push`
- **Primary Database**: PostgreSQL (Neon serverless)

**Key Data Models**
- Users: Authentication, profile information, verification status
- Listings: Room listings with images, pricing, location, amenities
- Seekers: Room seeker profiles with preferences and budget
- Messages: Real-time messaging between users
- Images: Multiple images per listing with primary image designation

## Authentication & Authorization

**OAuth Integration**
- Google OAuth 2.0 for social login
- Custom email/password registration
- JWT tokens stored in httpOnly cookies
- Session-based authentication with automatic token refresh

**Security Measures**
- Password hashing with bcrypt
- CSRF protection via cookie settings
- Secure cookie configuration for production domain
- Email verification workflow (email_verified_at timestamp)

## File Storage & CDN

**Image Storage**
- **Primary**: Cloudflare R2 object storage
- **Fallback**: Local uploads directory
- **Public URL Base**: Environment variable VITE_R2_PUBLIC_URL or R2_PUBLIC_URL
- **Image Processing**: Sharp library for HEIC conversion, compression, EXIF rotation
- **Supported Formats**: JPEG, PNG, WebP, HEIC/HEIF (auto-converted to JPEG)
- **Optimization**: Max width 1600px, JPEG quality 82%, automatic rotation

**CDN Strategy**
- Absolute URLs generated via `getImageUrl()` utility
- Dynamic fallback images for seeker profiles without photos
- Lazy loading with placeholder backgrounds

## Routing & Navigation

**URL Structure**
- SEO-friendly slugs: `/oda-ilani/:slug-:id` and `/oda-arayan/:slug-:id`
- Slug generation using slugify + nanoid (6-char unique suffix)
- Automatic redirects from UUID-only URLs to slugged URLs
- Canonical URL tags for SEO

**Key Routes**
- `/` - Homepage with mixed feed of listings and seekers
- `/oda-ilanlari` - Room listings browse
- `/oda-arayan` - Room seeker profiles
- `/profil` - User dashboard (personal info + user listings)
- `/messages` - Messaging interface
- `/giris` - Combined login/register page
- `/oda-ilani-ver` - Create room listing
- `/oda-arama-ilani-ver` - Create seeker profile

## API Design

**RESTful Endpoints**
- `GET /api/listings` - Public listings (filtered by status)
- `GET /api/listings/:id` - Single listing detail
- `POST /api/listings` - Create new listing (auth required)
- `GET /api/seekers` or `/api/users/seekers` - Public seeker profiles
- `GET /api/users/me` - Current user profile
- `PATCH /api/users/update` - Update user profile
- `POST /api/oauth/google/redirect` - Initiate Google OAuth
- `GET /api/oauth/google/callback` - OAuth callback handler
- `POST /api/uploads/seeker-photo` - Upload seeker profile photo
- `DELETE /api/seeker-listings/:id` - Delete seeker listing

**Response Format**
- JSON responses with consistent error handling
- HTTP status codes: 200 (success), 400 (validation), 401 (unauthorized), 404 (not found), 500 (server error)
- Toast notifications for user feedback on frontend

## Deployment Architecture

**Development Environment**
- Replit-hosted with hot module replacement
- Vite dev server on port 5000
- API server on port 3001
- Proxy configuration in vite.config.ts

**Production Environment**
- Domain: https://www.odanet.com.tr
- Static file serving from `/dist` directory
- Express server handles both API and SPA fallback
- Health check endpoint at `/health`
- Special routes for sitemap.xml and rss.xml

**Environment Variables**
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment mode (development/production)
- `BASE_URL` - Primary application URL
- `VITE_R2_PUBLIC_URL` - CDN base URL for images
- `SESSION_SECRET` - JWT signing secret
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - OAuth credentials

# External Dependencies

## Third-Party Services

**Database**
- **Neon Serverless PostgreSQL**: Primary production database with connection pooling
- Configured with SSL mode required
- WebSocket support for serverless environments

**Authentication**
- **Google OAuth 2.0**: Social login integration
- Redirect URI: `https://www.odanet.com.tr/api/auth/callback/google`
- Supports both web and mobile authentication flows

**Storage**
- **Cloudflare R2**: Object storage for user-uploaded images
- Bucket: `odanet-uploads`
- Public URL: `https://pub-f084c4d11d4541f2a83f290d3f7f761e.r2.dev`

**Analytics**
- **Google Analytics 4**: User behavior tracking
- Measurement ID: G-ME5ES9KLDE (referenced in code comments)
- Event tracking for signup, login, listing creation, messaging, and search

**Development Tools**
- **Replit**: Primary development and hosting platform
- Replit-specific Vite plugins for error handling and code mapping
- Replit Object Storage as backup storage option

## Key NPM Dependencies

**Frontend Core**
- React 18.3+ with React DOM
- Next.js configuration (hybrid setup with Vite)
- TanStack Query (React Query) for data fetching
- Wouter for client-side routing
- i18next for internationalization

**UI & Styling**
- Tailwind CSS with typography plugin
- Radix UI component primitives (dialog, select, tabs, etc.)
- Lucide React for icons
- class-variance-authority and clsx for conditional styling
- Emoji Picker React for message interactions

**Forms & Validation**
- React Hook Form for form management
- Zod for schema validation
- @hookform/resolvers for integration
- Drizzle-zod for database schema validation

**Backend**
- Express.js web framework
- Drizzle ORM with PostgreSQL driver
- bcrypt for password hashing
- jsonwebtoken for JWT generation
- cookie-parser for session management
- cors for cross-origin requests
- pg (node-postgres) for database connections

**File Processing**
- Sharp for image manipulation
- Busboy for multipart form parsing
- Gray Matter for markdown frontmatter parsing

**Mobile (Expo)**
- Expo SDK 54+
- React Native 0.81.5
- Expo Router for navigation
- NativeWind for styling
- React Native Safe Area Context
- React Native Gesture Handler

## Build & Development Tools

- **Vite**: Build tool and dev server with custom Replit plugins
- **TypeScript**: Type safety across frontend and backend
- **ESLint**: Code quality and consistency
- **Drizzle Kit**: Database migration and schema management
- **TSX**: TypeScript execution for server-side code
- **PostCSS & Autoprefixer**: CSS processing pipeline