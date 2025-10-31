# 🔐 Google OAuth Setup Guide - Odanet

## ✅ Current Status

**Backend Implementation:** ✅ Correct (using openid-client with PKCE)
**Frontend Implementation:** ✅ Correct (Auth.tsx line 128-136)
**Callback Handler:** ✅ Correct (AuthCallback.tsx)

## ❌ PROBLEM FOUND

**Environment Variable Issue:**
```bash
# ❌ WRONG (current value)
FRONTEND_URL=https://odanet.com.tr/giris

# ✅ CORRECT (should be)
FRONTEND_URL=https://www.odanet.com.tr
```

**Impact:** OAuth callback redirects to wrong URL, causing 400 errors.

---

## 🛠️ FIX REQUIRED

### Step 1: Update Replit Secrets

Go to **Replit → Tools → Secrets** and update:

```bash
# Update this secret:
FRONTEND_URL = https://www.odanet.com.tr
```

**Important:** Use `www.odanet.com.tr` to match your production domain.

---

## 🌐 Google Cloud Console Configuration

### Step 2: Verify Google OAuth Client Settings

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. **Verify these exact settings:**

#### Application Type
```
Web application
```

#### Authorized JavaScript Origins
```
https://www.odanet.com.tr
https://odanet.com.tr
```

#### Authorized Redirect URIs
```
https://www.odanet.com.tr/api/oauth/google/callback
```

**⚠️ CRITICAL:** The redirect URI must **EXACTLY match** your `GOOGLE_REDIRECT_URI` secret.

---

## 📋 Complete Environment Variables Checklist

Ensure these secrets are set in **Replit → Secrets**:

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `GOOGLE_CLIENT_ID` | `xxxxx.apps.googleusercontent.com` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxx` | Your Google OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://www.odanet.com.tr/api/oauth/google/callback` | OAuth callback URL |
| `FRONTEND_URL` | `https://www.odanet.com.tr` | ✅ **FIX THIS** (base URL only) |
| `JWT_SECRET` | `your-secret-key` | JWT signing key |

---

## 🧪 Testing Mode Configuration

### Option 1: Testing Mode (Recommended for Development)

1. **Publishing Status:** Keep as "Testing"
2. **Test Users:** Add your Gmail to test users list:
   - Go to: OAuth consent screen → Test users
   - Click "+ ADD USERS"
   - Add your Gmail address
   - Save

**Note:** Only emails in the test users list can sign in while in Testing mode.

### Option 2: Production Mode (For Public Launch)

1. **Publishing Status:** Set to "In production"
2. **Verification:** May require app verification by Google
3. **Benefits:** Any Gmail user can sign in

---

## 🔄 OAuth Flow (Technical Reference)

### 1. User Clicks "Google ile devam et"

**Frontend (Auth.tsx:128-136):**
```typescript
handleGoogleLogin() {
  sessionStorage.setItem('oauth_next_path', nextPath);
  window.location.href = `/api/oauth/google/redirect?next=${next}`;
}
```

### 2. Backend Builds Authorization URL

**Backend (server/routes/oauth.ts:25-65):**
```typescript
GET /api/oauth/google/redirect
  ↓
1. Generate PKCE code_verifier + code_challenge
2. Generate random state (CSRF protection)
3. Store code_verifier and state in httpOnly cookies
4. Build authorization URL:
   https://accounts.google.com/o/oauth2/v2/auth?
     response_type=code&
     client_id={GOOGLE_CLIENT_ID}&
     redirect_uri=https://www.odanet.com.tr/api/oauth/google/callback&
     scope=openid email profile&
     code_challenge={code_challenge}&
     code_challenge_method=S256&
     state={state}
5. Redirect user to Google
```

### 3. Google Consent Screen

User sees:
- App name: "Odanet"
- Permissions: Email, Profile, OpenID
- "Continue" or "Cancel"

### 4. Google Redirects Back

```
https://www.odanet.com.tr/api/oauth/google/callback?
  code=4/0AfJohXm...
  &state={state}
  &scope=openid+email+profile
```

### 5. Backend Exchanges Code for Tokens

**Backend (server/routes/oauth.ts:78-199):**
```typescript
GET /api/oauth/google/callback
  ↓
1. Verify state matches (CSRF check)
2. Retrieve code_verifier from cookie
3. Exchange code at https://oauth2.googleapis.com/token:
   POST {
     code: "4/0AfJohXm...",
     client_id: {GOOGLE_CLIENT_ID},
     client_secret: {GOOGLE_CLIENT_SECRET},
     redirect_uri: "https://www.odanet.com.tr/api/oauth/google/callback",
     grant_type: "authorization_code",
     code_verifier: {code_verifier}  // PKCE
   }
4. Receive tokens: { access_token, id_token, refresh_token }
5. Fetch user info from Google
6. Find or create user in database
7. Set email_verified_at = NOW()
8. Generate JWT token
9. Set httpOnly cookie: auth_token
10. Redirect to: https://www.odanet.com.tr/auth/callback
```

### 6. Frontend Completes Login

**Frontend (AuthCallback.tsx:11-41):**
```typescript
/auth/callback
  ↓
1. Wait 500ms for cookie to propagate
2. Refresh user state (JWT validated)
3. Retrieve nextPath from sessionStorage
4. Navigate to /profil or custom next path
```

---

## ✅ Acceptance Criteria

**Test both flows:**

### Test 1: Login from /giris
1. Visit `https://www.odanet.com.tr/giris`
2. Click "Google ile devam et"
3. Complete Google OAuth
4. ✅ Should land on `/profil`
5. ✅ User should be authenticated
6. ✅ Profile should show Google email/name

### Test 2: Register from /uye-ol
1. Visit `https://www.odanet.com.tr/uye-ol`
2. Click "Google ile devam et"
3. Complete Google OAuth
4. ✅ Should land on `/profil`
5. ✅ New user created in database
6. ✅ `email_verified_at` is set

### Test 3: OAuth with Next Parameter
1. Visit a protected page (e.g., `/ilan-ver`)
2. Get redirected to `/giris?next=/ilan-ver`
3. Click "Google ile devam et"
4. Complete Google OAuth
5. ✅ Should land on `/ilan-ver` (not /profil)

---

## 🐛 Common Issues & Solutions

### Issue 1: "400. That's an error. The request is malformed."

**Cause:** redirect_uri mismatch

**Solution:**
1. Check Google Console redirect URI: `https://www.odanet.com.tr/api/oauth/google/callback`
2. Check `GOOGLE_REDIRECT_URI` secret matches exactly
3. Ensure no trailing slashes
4. Ensure protocol is `https://` not `http://`

### Issue 2: "Error 400: redirect_uri_mismatch"

**Cause:** redirect_uri not registered in Google Console

**Solution:**
1. Go to Google Cloud Console
2. Add exact redirect URI to Authorized redirect URIs
3. Save and wait 5 minutes for changes to propagate

### Issue 3: "Error 403: access_denied"

**Cause:** User not in test users list (Testing mode)

**Solution:**
1. Add user's Gmail to test users
2. OR switch to Production mode

### Issue 4: User redirected to wrong page after OAuth

**Cause:** FRONTEND_URL is wrong

**Solution:**
```bash
# Update Replit Secret:
FRONTEND_URL = https://www.odanet.com.tr  # No path, just domain
```

---

## 🔍 Debugging

### Check Current Settings

```bash
# In Replit Shell:
echo "GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo "GOOGLE_REDIRECT_URI: $GOOGLE_REDIRECT_URI"
echo "FRONTEND_URL: $FRONTEND_URL"
```

**Expected Output:**
```
GOOGLE_CLIENT_ID: xxxxx...
GOOGLE_REDIRECT_URI: https://www.odanet.com.tr/api/oauth/google/callback
FRONTEND_URL: https://www.odanet.com.tr
```

### Check Server Logs

```bash
# Look for these messages:
✅ "🔐 Redirecting to Google OAuth: https://accounts.google.com/..."
✅ "🔐 Processing Google OAuth callback..."
✅ "✅ Tokens received, fetching userinfo..."
✅ "✅ Google user info received: { email: ..., verified: true }"
✅ "✅ JWT token generated for user: ..."
✅ "🔄 Redirecting to frontend: https://www.odanet.com.tr/auth/callback"

❌ "❌ No code_verifier found in cookies"
❌ "❌ No oauth_state found in cookies"
❌ "❌ OAuth callback error: ..."
```

---

## 📞 Support

**Still getting 400 errors?**

1. Double-check **all** environment variables
2. Verify Google Console settings **exactly match**
3. Clear browser cookies and try again
4. Check server logs for detailed error messages
5. Ensure app is in Testing mode with your email added

---

## 🎯 Quick Fix Summary

**To fix the 400 error:**

1. **Update Replit Secret:**
   ```
   FRONTEND_URL = https://www.odanet.com.tr
   ```

2. **Verify Google Console:**
   - Redirect URI: `https://www.odanet.com.tr/api/oauth/google/callback`
   - JS Origins: `https://www.odanet.com.tr`

3. **Add Test User:**
   - Your Gmail address in OAuth consent screen → Test users

4. **Restart Server:**
   ```bash
   # Server will auto-restart after updating secrets
   ```

5. **Test:**
   - Visit `/giris` → Click "Google ile devam et"
   - Should work! ✅

---

Generated: $(date)
Status: ✅ Code is correct, only env vars need fixing
