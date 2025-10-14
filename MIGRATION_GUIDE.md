# Upload Migration Guide for Autoscale

## Overview

This guide explains how to migrate existing uploads to the persistent `shared/uploads` directory for Autoscale deployment.

## ✅ What's Been Set Up

### 1. Migration Script
- **File**: `server/scripts/migrateUploads.ts`
- **Purpose**: Copies files from temporary `uploads/` to persistent `shared/uploads/`
- **Sources checked**:
  - `uploads/listings` → `shared/uploads/listings`
  - `uploads/seekers` → `shared/uploads/seekers`
  - `attached_assets/seed/listings` → `shared/uploads/listings` (if exists)
  - `attached_assets/seed/seekers` → `shared/uploads/seekers` (if exists)

### 2. Admin Endpoints (Temporary)

#### Health Check
- **Endpoint**: `GET /uploads/health.txt`
- **Response**: `ok`
- **Purpose**: Verify static file serving is working

#### Migration Trigger
- **Endpoint**: `POST /admin/run-migration?token=YOUR_TOKEN`
- **Auth**: Requires `ADMIN_MIGRATE_TOKEN` environment variable
- **Response**: `{"ok": true, "copied": <number>}` or error
- **Purpose**: Trigger migration remotely on Autoscale

## 🚀 How to Use

### Local Testing (Already Done)
```bash
npx tsx server/scripts/migrateUploads.ts
```
**Result**: ✅ Successfully migrated 23 files

### Production Migration on Autoscale

1. **Set the migration token secret**:
   - In Replit Secrets, add: `ADMIN_MIGRATE_TOKEN=your-secure-random-token`
   - Use a strong random string (e.g., from `openssl rand -hex 32`)

2. **Deploy to Autoscale**:
   - Publish/republish your app

3. **Verify health endpoint**:
   ```bash
   curl https://www.odanent.com.tr/uploads/health.txt
   ```
   Should return: `ok`

4. **Run migration**:
   ```bash
   curl -X POST "https://www.odanent.com.tr/admin/run-migration?token=your-secure-random-token"
   ```
   
   Expected response:
   ```json
   {"ok": true, "copied": 23}
   ```

5. **Verify images load**:
   - Visit your site and check that listing thumbnails display correctly
   - Check browser Network tab to confirm images return 200 status

## 🧹 Cleanup After Migration

Once migration is successful and verified:

1. **Remove temporary admin endpoints** from `server/index.ts`:
   ```typescript
   // DELETE these lines:
   app.post('/admin/run-migration', (req, res) => { ... });
   app.get('/uploads/health.txt', (_req, res) => res.type('text/plain').send('ok'));
   ```

2. **Remove migration script** (optional):
   ```bash
   rm server/scripts/migrateUploads.ts
   ```

3. **Remove old uploads directory** from repo:
   ```bash
   rm -rf uploads/
   git add -A
   git commit -m "chore: remove old uploads directory after migration"
   ```

## 📊 Current Status

- ✅ Migration script created and tested
- ✅ Admin endpoints configured
- ✅ 23 files successfully migrated locally:
  - 9 listing images
  - 14 seeker photos
- ✅ Files accessible with proper cache headers (1-year immutable)
- ✅ Health endpoint working
- ⏳ Awaiting: Set `ADMIN_MIGRATE_TOKEN` for production migration

## 🔒 Security Notes

- The `ADMIN_MIGRATE_TOKEN` should be:
  - Long and random (32+ characters)
  - Kept secret and never committed to version control
  - Removed after migration is complete
- Remove the admin endpoints after successful migration
- The migration endpoint has no rate limiting, so protect the token carefully

## 🐛 Troubleshooting

### Images still 404 on custom domain
1. Verify health endpoint returns "ok"
2. Check browser Network tab for actual request URL
3. Ensure database image paths start with `/uploads/` (not relative paths)
4. Run migration again if files weren't copied

### Migration returns 401 Unauthorized
- Verify `ADMIN_MIGRATE_TOKEN` is set correctly in Replit Secrets
- Check the token in your curl command matches exactly

### Migration returns "0 copied"
- Files already exist in `shared/uploads/` (this is safe)
- Old `uploads/` directory is empty
- No seed files in `attached_assets/seed/`
