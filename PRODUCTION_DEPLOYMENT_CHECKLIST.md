# Production Deployment Checklist - CDN Migration
**Date**: October 17, 2025  
**Status**: ✅ Ready to Deploy

---

## ✅ PRE-DEPLOYMENT (COMPLETED)

- [x] CDN domain active: cdn.odanet.com.tr
- [x] DNS CNAME configured and proxied
- [x] R2 bucket Public Access enabled
- [x] Cloudflare cache purged
- [x] Development Mode enabled
- [x] Code implementation complete
- [x] Runtime URL normalization working
- [x] No hardcoded old R2 URLs in source
- [x] Production build successful (61.9KB + 678KB)
- [x] Environment variables configured (development)

---

## 🚀 DEPLOYMENT STEPS

### 1. Update Production Environment Variables

Go to: **Replit → Deployments → www.odanet.com.tr → Environment Variables**

**Update these two variables:**
```bash
R2_PUBLIC_URL=https://cdn.odanet.com.tr
VITE_R2_PUBLIC_URL=https://cdn.odanet.com.tr
```

**Verify these remain unchanged:**
```bash
DATABASE_URL=postgresql://neondb_owner:npg_tXqT2mEjLF7R@ep-noisy-sun-afcx37wr-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
R2_S3_ENDPOINT=https://6f97940e30aab3a7db85052337e4536e.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=80c4487a1a838befad9af96d720ec41b
R2_SECRET_ACCESS_KEY=a59f4f71379c7fd225f8a6725ac61ba3e3a71c714b757b49f722ad334640bf13
R2_BUCKET_NAME=odanet-uploads
```

### 2. Republish

- Click **"Republish"** button
- Wait 2-3 minutes
- Confirm "Deployment successful"

---

## 🧪 VERIFICATION (Run After Deployment)

### Quick Test (2 minutes)
1. Open: https://www.odanet.com.tr
2. Hard refresh: **Cmd+Shift+R** or **Ctrl+Shift+R**
3. Right-click any image → Inspect
4. Verify: `src="https://cdn.odanet.com.tr/..."`

### Full Test (5 minutes)
1. Open DevTools (F12) → Network tab
2. Filter: "Img"
3. Reload page
4. Verify: All images from `cdn.odanet.com.tr`
5. Verify: NO requests to `pub-*.r2.dev`

### Profile Page Test
1. Go to: https://www.odanet.com.tr/profil?v=2
2. Check Network tab → All images use CDN
3. Check Console → No errors

### Upload Test
1. Create test listing with images
2. Verify uploaded images display
3. Check image URLs use CDN domain

---

## 🎯 SUCCESS CRITERIA

- [ ] www.odanet.com.tr loads successfully
- [ ] All images load from cdn.odanet.com.tr
- [ ] No pub-*.r2.dev requests in Network tab
- [ ] No console errors
- [ ] Image upload works
- [ ] Images display on all devices

---

## 🔧 IF ISSUES OCCUR

### Images don't load
1. Hard refresh browser (Cmd+Shift+R)
2. Try incognito/private mode
3. Check environment variables
4. Wait 2-3 minutes, try again
5. Clear Cloudflare cache

### Still seeing old R2 URLs
1. Verify environment variables updated
2. Confirm you republished
3. Hard refresh multiple times
4. Check different browser

---

## ✅ FINAL STEP

After successful verification (all tests pass):
1. Go to **Cloudflare Dashboard**
2. Navigate to **Caching → Configuration**
3. Turn **OFF** Development Mode
4. Done! CDN caching now active

---

## 📊 EXPECTED RESULT

**Before Migration:**
```
Image URL: https://pub-f084c4d11d4541f2a83f290d3f7f761e.r2.dev/uploads/...
```

**After Migration:**
```
Image URL: https://cdn.odanet.com.tr/uploads/...
```

**Benefits:**
- ✅ Professional branded domain
- ✅ Cloudflare CDN caching
- ✅ Better global performance
- ✅ Faster image loading

---

**Estimated Time**: 10 minutes total (5 min deploy + 5 min verify)

**Support**: See CDN_VERIFICATION_REPORT.md for detailed troubleshooting
