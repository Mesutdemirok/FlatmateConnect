# VITE_API_URL Configuration Guide

## Current Problem
The VITE_API_URL secret is causing double `/api` in URLs:
- Wrong: `https://flatmateconnect.xxx.repl.co/api/api/auth/me` ❌
- Correct: `https://flatmateconnect.xxx.repl.co/api/auth/me` ✅

## Solution

### Option 1: Same-Origin Setup (RECOMMENDED for Replit)
Since frontend and backend run on the same server in Replit, you don't need an external API URL.

**In Replit Secrets (🔒 icon in sidebar):**
- **Delete the `VITE_API_URL` secret entirely** OR
- Set `VITE_API_URL` to empty string: ` ` (just blank)

**Why this works:**
- Frontend and backend both run on `localhost:5000` in development
- Frontend and backend both deploy to the same Replit URL in production
- Uses relative paths like `/api/auth/me` - no CORS issues!

### Option 2: External API URL (Only if needed)
If you absolutely need to specify an external URL:

**In Replit Secrets:**
```
VITE_API_URL=https://your-replit-id.repl.co
```

**IMPORTANT:** 
- ✅ DO include the protocol: `https://`
- ✅ DO include your Replit domain
- ❌ DO NOT include `/api` at the end
- ❌ DO NOT include trailing slash

## Correct Examples
```bash
# Same-origin (recommended)
VITE_API_URL=

# External URL (if needed)
VITE_API_URL=https://217db6ce-3fa5-4d7e-960e-5dc9e683b312-00-27tmrxlpun9n.picard.replit.dev
VITE_API_URL=https://flatmateconnect.mesudemirok.replit.app
```

## Wrong Examples
```bash
# ❌ These will NOT work:
VITE_API_URL=https://example.repl.co/api  # Has /api at end
VITE_API_URL=https://example.repl.co/api/ # Has /api/ at end
VITE_API_URL=/api                         # Relative path with /api
```

## After Updating
1. The workflow will automatically restart
2. Test by opening the site - login should work
3. Check browser console - no more "double /api" errors
