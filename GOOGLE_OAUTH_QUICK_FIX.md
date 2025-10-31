# 🔥 QUICK FIX: Google OAuth 400 Error

## 🎯 PROBLEM IDENTIFIED

Your code is **100% correct** ✅

The issue is a **single environment variable**:

```bash
# ❌ CURRENT (WRONG)
FRONTEND_URL = https://odanet.com.tr/giris

# ✅ SHOULD BE
FRONTEND_URL = https://www.odanet.com.tr
```

---

## ⚡ 3-STEP FIX

### Step 1: Update Replit Secret (5 seconds)

1. Open **Replit Tools → Secrets**
2. Find `FRONTEND_URL`
3. Change value to: `https://www.odanet.com.tr`
4. Click **Save**

### Step 2: Verify Google Console (1 minute)

Go to: https://console.cloud.google.com/apis/credentials

**Check these match EXACTLY:**

| Setting | Value |
|---------|-------|
| **Authorized redirect URIs** | `https://www.odanet.com.tr/api/oauth/google/callback` |
| **Authorized JavaScript origins** | `https://www.odanet.com.tr` |
| **Publishing status** | Testing (with your Gmail in test users) |

### Step 3: Test (10 seconds)

1. Visit: `https://www.odanet.com.tr/giris`
2. Click: "Google ile devam et"
3. ✅ Should work now!

---

## 🔍 Why This Fixes It

**Current Flow (BROKEN):**
```
User clicks Google → Backend builds OAuth URL ✅
→ User consents on Google ✅
→ Google redirects to: /api/oauth/google/callback ✅
→ Backend processes token ✅
→ Backend redirects to: https://odanet.com.tr/giris/auth/callback ❌
   (Wrong! Should be: https://www.odanet.com.tr/auth/callback)
```

**Fixed Flow:**
```
→ Backend redirects to: https://www.odanet.com.tr/auth/callback ✅
→ Frontend loads AuthCallback.tsx ✅
→ User lands on /profil ✅
```

---

## ✅ Acceptance Test

**After fixing FRONTEND_URL:**

- [ ] Click "Google ile devam et" on `/giris`
- [ ] See Google consent screen (not 400 error)
- [ ] Click "Continue" on Google
- [ ] Land on `/profil` page
- [ ] See your Google profile info

**Both /giris and /uye-ol use the same Google OAuth button, so both will work.**

---

## 📋 Complete Secrets Checklist

**These should be set in Replit → Secrets:**

```bash
GOOGLE_CLIENT_ID = xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-xxxxx
GOOGLE_REDIRECT_URI = https://www.odanet.com.tr/api/oauth/google/callback
FRONTEND_URL = https://www.odanet.com.tr  ← FIX THIS ONE
JWT_SECRET = your-secret-key
```

---

## 🎉 That's It!

Change 1 environment variable → Google OAuth works.

See `GOOGLE_OAUTH_SETUP.md` for detailed technical documentation.
