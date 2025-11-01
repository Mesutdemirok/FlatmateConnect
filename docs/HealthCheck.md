# Odanet Health Check & Fixes

**Platform**: https://www.odanet.com.tr  
**Last Updated**: November 1, 2025  
**Status**: ✅ Critical Issues Resolved

---

## Executive Summary

### What Was Broken
1. **Profile Image Upload** - Backend endpoints existed but were not authenticated
2. **Room Listing Image Upload** - Endpoint was missing entirely, causing submission failures
3. **Room Seeker Image Upload** - No authentication on upload endpoint
4. **Security Vulnerability** - All upload endpoints allowed unauthenticated access to R2 storage

### What Changed
1. ✅ Added JWT authentication to ALL three upload endpoints
2. ✅ Created missing `/api/listings/:id/images` endpoint with ownership verification
3. ✅ Fixed frontend to include JWT tokens in upload requests
4. ✅ Standardized environment variables in `.env.example`
5. ✅ Created comprehensive seed dataset (`scripts/seed.sql`)

### Remaining Work
- [ ] Add profile photo upload UI to Profile page (backend ready)
- [ ] End-to-end testing of all flows on production
- [ ] Automated test suite (E2E + API tests)

---

## Environment Variables

### Final Configuration

All environment variables have been standardized. See `.env.example` for the complete list.

#### Required Variables

**App & URLs**:
```
NODE_ENV=production
PORT=5000
BASE_URL=https://www.odanet.com.tr
FRONTEND_URL=https://www.odanet.com.tr
```

**Database** (Neon Postgres):
```
DATABASE_URL=postgresql://...@neon.tech/neondb?sslmode=require
```

**Authentication**:
```
JWT_SECRET=<minimum 32 characters>
```

**Google OAuth**:
```
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://www.odanet.com.tr/api/oauth/google/callback
```

**Cloudflare R2 Storage**:
```
R2_S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=odanet-uploads
R2_PUBLIC_URL=https://cdn.odanet.com.tr
VITE_R2_PUBLIC_URL=https://cdn.odanet.com.tr
```

### Registered OAuth Redirect URIs

Register these in Google Cloud Console:

1. **Production**: `https://www.odanet.com.tr/api/oauth/google/callback`
2. **Development**: `https://<your-repl-id>.repl.co/api/oauth/google/callback`

---

## Issue 1: Profile Image Upload

### Symptoms
- Profile photos failed to upload
- No error messages, silent failures
- Images didn't persist or render

### Root Cause
**Backend**: The upload endpoint `/api/uploads/profile-photo` existed but:
1. Had no authentication (security vulnerability)
2. Frontend wasn't sending JWT token in headers

**Frontend**: Profile.tsx had no UI to upload profile photos

### Fix Applied

**Backend** (`server/routes/uploads.ts`):
```typescript
// Added jwtAuth middleware
router.post("/api/uploads/profile-photo", jwtAuth, (req, res) => {
  // Accepts HEIC/JPEG/PNG/WebP
  // Converts to JPEG, resizes to 800px
  // Uploads to R2 under profiles/ path
  // Returns imagePath and CDN URL
});
```

**Backend** (`server/routes.ts`):
```typescript
// Added PATCH endpoint to update user profile
router.patch("/api/users/profile", jwtAuth, async (req, res) => {
  // Updates user fields including profileImageUrl
  // Returns updated user object
});
```

**Frontend** (`client/src/lib/queryClient.ts`):
```typescript
// Exported getAuthHeaders() for use in uploads
export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}
```

### Files Changed
- `server/routes/uploads.ts` - Added jwtAuth to profile-photo endpoint
- `server/routes.ts` - Added PATCH /api/users/profile endpoint  
- `server/storage.ts` - Added updateUser() method
- `client/src/lib/queryClient.ts` - Exported getAuthHeaders()

### Status
✅ **Backend Complete** - Endpoints ready and secured  
⏳ **Frontend Pending** - UI component needs to be added to Profile.tsx

### Retest Steps
1. Log in to https://www.odanet.com.tr
2. Navigate to Profile page
3. Click upload photo button (once UI is added)
4. Select HEIC, JPEG, or PNG image
5. Verify image uploads and displays in header
6. Refresh page - image should persist

---

## Issue 2: Room Listing Creation - Missing Image Upload

### Symptoms
- Room listing form appeared to work but images never saved
- "Unexpected token '<', "<!doctype "..." JSON error when uploading images
- Listings created without photos

### Root Cause
1. The `/api/listings/:id/images` endpoint **did not exist** - returning HTML 404 page
2. Frontend tried to upload images to non-existent endpoint
3. Browser attempted to parse HTML error page as JSON → error message

### Fix Applied

**Backend** (`server/routes/uploads.ts`):
```typescript
// Created new endpoint with full security
router.post("/api/listings/:id/images", jwtAuth, async (req, res) => {
  // 1. Verify listing ownership BEFORE accepting files
  const listing = await storage.getListing(listingId);
  if (listing.userId !== userId) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  
  // 2. Process multiple images via Busboy
  // 3. Convert HEIC→JPEG, resize to 1600px, compress
  // 4. Upload to R2 under listings/ path
  // 5. Save to database with first image marked as primary
  // 6. Return array of uploaded images with CDN URLs
});
```

**Frontend** (`client/src/pages/CreateListing.tsx`, `EditListing.tsx`):
```typescript
// Added auth headers to image uploads
const imageResponse = await fetch(`/api/listings/${listing.id}/images`, {
  method: 'POST',
  headers: getAuthHeaders(), // ← Added this
  body: formData,
  credentials: 'include',
});
```

### Files Changed
- `server/routes/uploads.ts` - Created /api/listings/:id/images endpoint
- `client/src/pages/CreateListing.tsx` - Added auth headers
- `client/src/pages/EditListing.tsx` - Added auth headers

### Status
✅ **Complete** - Endpoint created, authenticated, and integrated

### Retest Steps
1. Log in to https://www.odanet.com.tr
2. Navigate to "İlan Oluştur" (Create Listing)
3. Fill out all required fields
4. Upload 2-3 photos (HEIC, JPEG, or PNG)
5. Submit form
6. Verify redirect to listing detail page
7. Confirm photos display correctly
8. Check that first photo is marked as primary

---

## Issue 3: Room Seeker Profile Upload

### Symptoms
- Seeker photo upload worked but had security issue
- No authentication required (anyone could upload)

### Root Cause
The `/api/uploads/seeker-photo` endpoint existed but had no authentication middleware, allowing unauthorized uploads to R2 storage.

### Fix Applied

**Backend** (`server/routes/uploads.ts`):
```typescript
// Added jwtAuth middleware
router.post("/api/uploads/seeker-photo", jwtAuth, (req, res) => {
  // Now requires valid JWT token
  // Processes images same as before
});
```

**Frontend** (`client/src/pages/CreateSeekerProfile.tsx`):
```typescript
// Added auth headers
const response = await fetch('/api/uploads/seeker-photo', {
  method: 'POST',
  headers: getAuthHeaders(), // ← Added this
  body: formData,
  credentials: 'include',
});
```

### Files Changed
- `server/routes/uploads.ts` - Added jwtAuth middleware
- `client/src/pages/CreateSeekerProfile.tsx` - Added auth headers

### Status
✅ **Complete** - Secured and functional

### Retest Steps
1. Log in to https://www.odanet.com.tr
2. Navigate to "Oda Arayan Profili Oluştur"
3. Fill out seeker profile form
4. Upload profile photo
5. Submit form
6. Verify photo displays on seeker profile page

---

## Security Improvements

### Upload Endpoints - Before & After

#### Before (Vulnerable)
```typescript
❌ /api/uploads/profile-photo     - NO AUTH (anyone can upload)
❌ /api/uploads/seeker-photo      - NO AUTH (anyone can upload)
❌ /api/listings/:id/images       - ENDPOINT MISSING
```

#### After (Secured)
```typescript
✅ /api/uploads/profile-photo     - jwtAuth required
✅ /api/uploads/seeker-photo      - jwtAuth required  
✅ /api/listings/:id/images       - jwtAuth + ownership verification
```

### Security Measures Implemented
1. **JWT Authentication** - All uploads require valid session token
2. **Ownership Verification** - Listing uploads verify user owns the listing
3. **File Validation** - Type and size checks on all uploads
4. **Rate Limiting** - 15MB max file size enforced during streaming
5. **Sanitization** - Filenames sanitized, UUIDs used for storage

---

## Seed Dataset

### Overview
A minimal, realistic seed dataset for development and testing.

### Installation

1. **Ensure seed images are in place**:
   - See `public/seed/README.md` for image requirements
   - Or upload to R2 bucket under `seed/` prefix

2. **Run seed script**:
   ```bash
   psql "$DATABASE_URL" -f scripts/seed.sql
   ```

3. **Verify**:
   ```bash
   # Should show: ✓ Seed completed successfully!
   # - Users: 3
   # - Listings: 1
   # - Seeker Profiles: 1
   # - Messages: 3
   ```

### Seed Data Included

**Users** (3):
- `admin@odanet.com.tr` - Admin User (verified)
- `lister@odanet.com.tr` - Ayşe Yılmaz (room lister, verified)
- `seeker@odanet.com.tr` - Mehmet Demir (room seeker, verified)

**Room Listings** (1):
- **Title**: "Geniş Oda – Kadıköy Merkez"
- **Owner**: lister@odanet.com.tr
- **Rent**: 18,000 TRY/month (bills included)
- **Property**: 3-room apartment, furnished
- **Images**: 2 photos (kadikoy1.jpg, kadikoy2.jpg)
- **Status**: Active
- **Slug**: `genis-oda-kadikoy-merkez`

**Seeker Profiles** (1):
- **Name**: Mehmet Demir
- **Age**: 24
- **Occupation**: Student (Boğaziçi University - Computer Engineering)
- **Budget**: 15,000 TRY/month
- **Preferences**: Non-smoker, no pets, very clean
- **Location**: İstanbul Anadolu Yakası (Kadıköy, Moda, Üsküdar)
- **Slug**: `mehmet-demir-oda-ariyor`

**Messages** (3):
- Conversation between seeker and lister about the Kadıköy listing
- Thread linked to listing ID
- Includes timestamps and read status

### Test Scenarios

After seeding, you should be able to:

1. ✓ Log in as `lister@odanet.com.tr` → See Kadıköy listing under "My Listings"
2. ✓ Log in as `seeker@odanet.com.tr` → See inbox with 3 messages about Kadıköy listing
3. ✓ View listing detail page → Images render from seed data
4. ✓ View seeker profile → Profile photo and details display

### Reset Database

To clear seed data and start fresh:

```sql
DELETE FROM messages WHERE sender_id IN (SELECT id FROM users WHERE email LIKE '%@odanet.com.tr');
DELETE FROM seeker_profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@odanet.com.tr');
DELETE FROM listing_images WHERE listing_id IN (SELECT id FROM listings WHERE slug = 'genis-oda-kadikoy-merkez');
DELETE FROM listings WHERE slug = 'genis-oda-kadikoy-merkez';
DELETE FROM users WHERE email LIKE '%@odanet.com.tr';
```

Then re-run the seed script.

---

## Database Schema Health

### Tables Verified
- ✅ `users` - User accounts with auth fields
- ✅ `listings` - Room listings with all required fields
- ✅ `listing_images` - Multiple images per listing with primary flag
- ✅ `seeker_profiles` - Detailed seeker profiles
- ✅ `seeker_photos` - Multiple photos per seeker
- ✅ `messages` - Direct messages linked to listings
- ✅ `favorites` - User saved listings
- ✅ `user_preferences` - User preference settings
- ✅ `sessions` - Express session storage

### Foreign Key Relationships
All foreign keys properly configured with `ON DELETE CASCADE` for data integrity.

### Indexes
- ✅ `sessions.expire` - Indexed for session cleanup
- ✅ `users.email` - Unique constraint
- ✅ `listings.slug` - Unique constraint for SEO
- ✅ `seeker_profiles.slug` - Unique constraint for SEO

---

## API Endpoints Inventory

### Authentication
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - Create new account
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/me` - Get current user
- `GET /api/oauth/google` - Initiate Google OAuth
- `GET /api/oauth/google/callback` - OAuth callback

### Users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/profile` - Update current user profile (✅ NEW)

### Listings
- `GET /api/listings` - List all active listings
- `GET /api/listings/:id` - Get listing details
- `GET /api/listings/slug/:slug` - Get listing by slug
- `POST /api/listings` - Create new listing (auth required)
- `PUT /api/listings/:id` - Update listing (auth + ownership required)
- `DELETE /api/listings/:id` - Delete listing (auth + ownership required)

### Uploads
- `POST /api/uploads/profile-photo` - Upload user avatar (✅ AUTH REQUIRED)
- `POST /api/uploads/seeker-photo` - Upload seeker photo (✅ AUTH REQUIRED)
- `POST /api/listings/:id/images` - Upload listing images (✅ NEW + AUTH + OWNERSHIP)

### Seeker Profiles
- `GET /api/seekers/public` - List published seeker profiles
- `GET /api/seekers/:id` - Get seeker profile
- `POST /api/seekers` - Create seeker profile (auth required)
- `PUT /api/seekers/:id` - Update seeker profile (auth + ownership required)

### Messages
- `GET /api/messages` - Get user's messages/inbox (auth required)
- `POST /api/messages` - Send message (auth required)
- `PUT /api/messages/:id/read` - Mark message as read (auth required)

### Favorites
- `GET /api/favorites` - Get user's favorites (auth required)
- `POST /api/favorites` - Add favorite (auth required)
- `DELETE /api/favorites/:id` - Remove favorite (auth required)

---

## Testing Checklist

### Profile Image Upload
- [ ] Upload JPEG image → Success
- [ ] Upload HEIC image → Converts to JPEG → Success
- [ ] Upload PNG image → Converts to JPEG → Success
- [ ] Upload 10MB file → Success
- [ ] Upload 20MB file → Error (too large)
- [ ] Avatar displays in profile header
- [ ] Avatar displays on listing cards
- [ ] Avatar persists after page refresh
- [ ] Upload without login → 401 error

### Room Listing Creation
- [ ] Create listing without images → Success
- [ ] Create listing with 1 image → Success
- [ ] Create listing with 5 images → Success
- [ ] First image marked as primary → Verified
- [ ] Images display on listing detail page
- [ ] Images display on listing cards
- [ ] Edit listing → Add new images → Success
- [ ] Create listing without login → Redirect to login

### Room Seeker Profile
- [ ] Create seeker profile without photo → Success
- [ ] Create seeker profile with photo → Success
- [ ] Photo displays on seeker profile page
- [ ] Photo displays on seeker cards
- [ ] Upload HEIC photo → Converts → Success
- [ ] Create profile without login → Redirect to login

### Messaging
- [ ] Send message from listing detail → Success
- [ ] Message appears in both inboxes
- [ ] Message linked to correct listing
- [ ] Unread badge displays
- [ ] Mark as read → Badge disappears
- [ ] Reply to message → Success

### Google OAuth
- [ ] Click "Sign in with Google" → Google auth screen
- [ ] New user signs in → Account created → Redirect to dashboard
- [ ] Existing user signs in → Logged in → Redirect to last page
- [ ] Sign in with existing email → Links accounts (no duplicate)
- [ ] Sign out → Session destroyed → Redirect to home

---

## Known Issues & Limitations

### To Do
1. **Profile Photo UI** - Add upload component to Profile page (backend ready)
2. **Automated Tests** - No E2E or API test suite yet
3. **Image Optimization** - No responsive image variants (srcset)
4. **Error Tracking** - No Sentry or centralized logging yet

### Won't Fix (By Design)
- Single seeker profile per user (business requirement)
- Images converted to JPEG (optimization + compatibility)
- Max 15MB upload size (prevents abuse)

---

## Deployment Checklist

### Before Deploying
- [ ] Environment variables set in production
- [ ] Google OAuth redirect URIs registered
- [ ] R2 bucket configured with public URL
- [ ] Database migrations applied
- [ ] Seed data loaded (optional)

### After Deploying
- [ ] Test Google OAuth flow
- [ ] Test image uploads (all 3 types)
- [ ] Test listing creation end-to-end
- [ ] Test seeker profile creation
- [ ] Test messaging between users
- [ ] Verify images load from CDN
- [ ] Check error logs for issues

---

## Support & Troubleshooting

### "Unexpected token '<'" Error
**Cause**: Frontend trying to parse HTML error page as JSON  
**Fix**: Check that endpoint exists and returns JSON (not 404 HTML)

### "Unauthorized" on Image Upload
**Cause**: Missing JWT token in request headers  
**Fix**: Ensure `getAuthHeaders()` is called in fetch request

### Images Don't Display
**Cause**: R2_PUBLIC_URL not configured correctly  
**Fix**: Check that VITE_R2_PUBLIC_URL matches R2_PUBLIC_URL in frontend

### Google OAuth Redirect Fails
**Cause**: Redirect URI not registered in Google Cloud Console  
**Fix**: Add exact URL to Authorized redirect URIs

---

## Changelog

### 2025-11-01 - Major Security & Bug Fixes
- ✅ Added JWT authentication to all upload endpoints
- ✅ Created missing `/api/listings/:id/images` endpoint
- ✅ Added ownership verification for listing uploads
- ✅ Fixed frontend to send JWT tokens with uploads
- ✅ Standardized environment variables
- ✅ Created comprehensive seed dataset
- ✅ Documented all findings and fixes

---

**End of Health Check Report**
