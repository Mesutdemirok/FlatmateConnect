# CDN Migration Guide - Custom Domain Setup
**Goal**: Migrate from default R2 URL to custom CDN domain (cdn.odanet.com.tr)  
**Date**: October 17, 2025

---

## 🎯 OVERVIEW

### Current State
- ✅ **Code Updated**: Runtime URL normalization implemented
- ✅ **Environment Variables Set**: R2_PUBLIC_URL and VITE_R2_PUBLIC_URL configured
- ✅ **Production Build**: Ready (61.9KB backend + 678KB frontend)
- ⏳ **Cloudflare Setup**: Needs configuration (steps below)

### What This Does
- **Old URLs**: `https://pub-f084c4d11d4541f2a83f290d3f7f761e.r2.dev/uploads/image.jpg`
- **New URLs**: `https://cdn.odanet.com.tr/uploads/image.jpg`
- **Benefit**: Professional branding, better caching control, custom domain

---

## 📋 CLOUDFLARE SETUP STEPS

### Step 1: Configure R2 Custom Domain

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select your account

2. **Navigate to R2**
   - Click **R2** in left sidebar
   - Click on your bucket: **`odanet-uploads`**

3. **Enable Public Access** (if not already)
   - Click **Settings** tab
   - Under "Public access", ensure it's **Enabled**
   - If disabled, click **Allow Access** and confirm

4. **Add Custom Domain**
   - Still in Settings tab
   - Scroll to **Custom Domains** section
   - Click **Connect Domain** (or **Add Custom Domain**)
   - Enter: `cdn.odanet.com.tr`
   - Click **Continue** or **Add Domain**

5. **Complete Validation**
   - Cloudflare will show validation instructions
   - Follow any additional steps shown (usually automatic)
   - Wait for status to show **Active** (may take 1-2 minutes)

**✅ Checkpoint**: Custom domain shows "Active" status

---

### Step 2: Configure DNS (CNAME)

1. **Go to DNS Settings**
   - From Cloudflare dashboard
   - Click **Websites** in left sidebar
   - Select **odanet.com.tr** domain
   - Click **DNS** tab (or **DNS Records**)

2. **Create CNAME Record**
   - Click **Add record** button
   - Set these values:
     - **Type**: `CNAME`
     - **Name**: `cdn`
     - **Target**: `pub-f084c4d11d4541f2a83f290d3f7f761e.r2.dev`
     - **Proxy status**: **Proxied** (Orange cloud icon - should be ON)
     - **TTL**: `Auto`
   - Click **Save**

3. **Verify CNAME**
   - The record should appear in your DNS records list
   - Status should show **Proxied** with orange cloud icon
   - Name: `cdn.odanet.com.tr`
   - Target: Points to R2

**⚠️ Important Notes:**
- Leave your apex record (@) and www record unchanged
- Only create the cdn subdomain
- Keep Proxy status ON (orange cloud) for CDN benefits

**✅ Checkpoint**: CNAME record shows "Proxied" status

---

### Step 3: Clear Cloudflare Cache

1. **Go to Caching Settings**
   - Still in your odanet.com.tr website dashboard
   - Click **Caching** in left sidebar
   - Click **Configuration** tab

2. **Purge Everything**
   - Scroll to "Purge Cache" section
   - Click **Purge Everything** button
   - Confirm the action
   - Wait for success message

3. **Enable Development Mode** (for testing)
   - In same Caching section
   - Find "Development Mode" toggle
   - Turn it **ON**
   - Note: This bypasses cache for 3 hours (auto-disables)

**✅ Checkpoint**: Cache purged, Development Mode ON

---

### Step 4: Update Replit Deployment (Production)

Now update your **production deployment** on Replit:

1. **Access Deployments**
   - Click **🚀 Deployments** in Replit sidebar
   - Find your **www.odanet.com.tr** deployment
   - Click on it to open

2. **Update Environment Variables**
   - Click **Environment Variables** tab
   - Update/Add these variables:
   
   ```bash
   R2_PUBLIC_URL=https://cdn.odanet.com.tr
   VITE_R2_PUBLIC_URL=https://cdn.odanet.com.tr
   ```

   **⚠️ Critical**: Both variables must be set to the custom domain

3. **Also Verify Database URL** (from previous migration)
   ```bash
   DATABASE_URL=postgresql://neondb_owner:npg_tXqT2mEjLF7R@ep-noisy-sun-afcx37wr-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
   ```

4. **Republish Deployment**
   - Click **Republish** button
   - Wait 2-3 minutes for deployment
   - Look for "Deployment successful" message

**✅ Checkpoint**: Production republished with CDN configuration

---

## 🧪 VERIFICATION & TESTING

### Test 1: DNS Propagation Check

```bash
# Run this on your computer (Mac/Windows terminal)
nslookup cdn.odanet.com.tr

# Should return Cloudflare IPs (not the R2 URL directly)
# Example output:
# Non-authoritative answer:
# cdn.odanet.com.tr canonical name = pub-f084c4d11d4541f2a83f290d3f7f761e.r2.dev
```

### Test 2: Direct Image Access

1. **Find an Existing Image URL**
   - Go to your database or preview environment
   - Copy a full image URL like:
     `https://pub-f084c4d11d4541f2a83f290d3f7f761e.r2.dev/uploads/listings/abc123.jpg`

2. **Test CDN URL**
   - Replace the R2 domain with CDN domain:
     `https://cdn.odanet.com.tr/uploads/listings/abc123.jpg`
   - Open this URL in browser
   - **Expected**: Image loads successfully

3. **Check Response Headers** (Optional)
   - Open browser DevTools (F12)
   - Go to Network tab
   - Load the cdn.odanet.com.tr image URL
   - Check headers for:
     - `cf-cache-status: HIT` (after first load)
     - `server: cloudflare`

### Test 3: Production Website Check

1. **Open Production Site**
   - Go to https://www.odanet.com.tr
   - Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)

2. **Inspect Images**
   - Right-click any image → **Inspect** (or F12)
   - Check the `<img>` tag's `src` attribute
   - **Expected**: `https://cdn.odanet.com.tr/uploads/...`

3. **Check Network Tab**
   - Open DevTools → Network tab
   - Filter by "Img" type
   - All image requests should go to `cdn.odanet.com.tr`
   - No requests to `pub-*.r2.dev` should appear

### Test 4: Create New Listing (Full Flow)

1. **Login to Production**
   - Go to https://www.odanet.com.tr
   - Login with your account

2. **Create Test Listing**
   - Click "Oda İlanı Ver"
   - Fill in details:
     - Title: "CDN Test - Kadıköy"
     - City: Istanbul
     - District: Kadıköy
     - Price: 5000
   - Upload 2-3 images from your device

3. **Verify Upload**
   - After saving, check image URLs
   - Open DevTools → Inspect image
   - **Expected**: `src="https://cdn.odanet.com.tr/uploads/listings/..."`

4. **Cross-Platform Test**
   - Desktop browser ✅
   - iPhone Safari ✅
   - Mac Safari ✅
   - Android Chrome ✅

### Test 5: Profile Page Check

1. **Navigate to Profile**
   - Go to https://www.odanet.com.tr/profil?v=2
   - Or https://odanet.com.tr/profil?v=2 (without www)

2. **Verify Image Sources**
   - Open DevTools (F12) → Network tab
   - Filter by "Img"
   - **All images** should load from `cdn.odanet.com.tr`
   - Check console for any errors (should be none)

3. **Check Different Pages**
   - Homepage: Image banners/cards
   - Listing detail pages
   - Seeker profiles
   - User avatars

---

## ✅ SUCCESS CHECKLIST

### Cloudflare Configuration
- [ ] R2 bucket custom domain: cdn.odanet.com.tr shows "Active"
- [ ] DNS CNAME record created: cdn → pub-*.r2.dev
- [ ] CNAME shows "Proxied" status (orange cloud)
- [ ] Cache purged successfully
- [ ] Development Mode enabled (for testing)

### Replit Configuration
- [ ] R2_PUBLIC_URL = https://cdn.odanet.com.tr
- [ ] VITE_R2_PUBLIC_URL = https://cdn.odanet.com.tr
- [ ] Production deployment republished
- [ ] Deployment shows "Active" status

### Verification Tests
- [ ] DNS resolves cdn.odanet.com.tr correctly
- [ ] Direct image URL loads: https://cdn.odanet.com.tr/uploads/...
- [ ] www.odanet.com.tr shows images from CDN
- [ ] Profile page (/profil?v=2) uses CDN for all images
- [ ] Network tab shows NO pub-*.r2.dev requests
- [ ] New listing upload stores CDN URLs
- [ ] Images work on all devices (desktop, mobile)

### Final Steps
- [ ] Turn OFF Development Mode in Cloudflare (after testing)
- [ ] Verify cache is working (cf-cache-status: HIT)
- [ ] Test on multiple browsers
- [ ] Test on multiple devices

---

## 🔧 TROUBLESHOOTING

### Issue: cdn.odanet.com.tr doesn't resolve

**Solution:**
1. Check DNS propagation: https://dnschecker.org/#CNAME/cdn.odanet.com.tr
2. Wait 5-10 minutes for DNS to propagate globally
3. Verify CNAME record is correct in Cloudflare DNS
4. Ensure Proxy status is ON (orange cloud)

### Issue: Images still load from pub-*.r2.dev

**Solution:**
1. Hard refresh browser: Cmd+Shift+R or Ctrl+Shift+R
2. Check environment variables in deployment:
   - R2_PUBLIC_URL must be https://cdn.odanet.com.tr
   - VITE_R2_PUBLIC_URL must be https://cdn.odanet.com.tr
3. Verify you republished after updating env vars
4. Clear Cloudflare cache again
5. Check browser DevTools console for errors

### Issue: Images return 404 or Access Denied

**Solution:**
1. Verify R2 bucket Public Access is ENABLED
2. Check custom domain is Active in R2 settings
3. Test original R2 URL works: https://pub-*.r2.dev/uploads/...
4. If original works but CDN doesn't, wait 5 mins for DNS
5. Purge Cloudflare cache and retry

### Issue: Old database URLs still show pub-*.r2.dev

**Solution:**
This is expected! The normalization handles it:
1. Our code automatically replaces pub-*.r2.dev with cdn.odanet.com.tr
2. Check browser DevTools → Elements → inspect `<img>` tag
3. Even if DB has old URL, rendered HTML should show CDN URL
4. No database migration needed

### Issue: Mixed content (http/https) errors

**Solution:**
1. Ensure R2_PUBLIC_URL starts with `https://` (not `http://`)
2. Check console for mixed content warnings
3. Verify all environment variables use HTTPS
4. Hard refresh browser after fixing

### Issue: Cloudflare cache not working

**Solution:**
1. Turn OFF Development Mode
2. Load an image URL twice
3. Check headers second time: cf-cache-status should be HIT
4. If still MISS, check Cache Rules in Cloudflare
5. Ensure CDN domain is proxied (orange cloud)

---

## 📊 EXPECTED RESULTS

### Before CDN Migration
```html
<!-- Image URLs in database -->
https://pub-f084c4d11d4541f2a83f290d3f7f761e.r2.dev/uploads/listings/image.jpg

<!-- Rendered in browser -->
<img src="https://pub-f084c4d11d4541f2a83f290d3f7f761e.r2.dev/uploads/listings/image.jpg">
```

### After CDN Migration
```html
<!-- Image URLs in database (may still have old URLs) -->
https://pub-f084c4d11d4541f2a83f290d3f7f761e.r2.dev/uploads/listings/old-image.jpg
https://cdn.odanet.com.tr/uploads/listings/new-image.jpg

<!-- Rendered in browser (ALL normalized to CDN) -->
<img src="https://cdn.odanet.com.tr/uploads/listings/old-image.jpg">
<img src="https://cdn.odanet.com.tr/uploads/listings/new-image.jpg">
```

### Network Behavior
| Request | Status | cf-cache-status | Source |
|---------|--------|-----------------|--------|
| First load | 200 | MISS | R2 Origin |
| Second load | 200 | HIT | Cloudflare Cache |
| After purge | 200 | MISS | R2 Origin |

---

## 🎯 TECHNICAL SUMMARY

### What We Implemented

1. **Backend URL Normalization** (`server/storage.ts`)
   - `normalizeR2Url()` function detects pub-*.r2.dev URLs
   - Automatically replaces with R2_PUBLIC_URL value
   - Works on all stored URLs regardless of format

2. **Frontend URL Normalization** (`client/src/lib/imageUtils.ts`)
   - `normalizeR2Url()` function for client-side rendering
   - Replaces pub-*.r2.dev with VITE_R2_PUBLIC_URL
   - Handles both relative and absolute URLs

3. **Environment Variables**
   - R2_PUBLIC_URL: Backend CDN domain
   - VITE_R2_PUBLIC_URL: Frontend CDN domain
   - Both set to https://cdn.odanet.com.tr

4. **New Uploads**
   - Store full CDN URLs directly in database
   - Format: https://cdn.odanet.com.tr/uploads/...
   - No normalization needed for new data

### Benefits

✅ **Professional Branding**: Custom domain instead of R2 default  
✅ **Better Performance**: Cloudflare CDN caching worldwide  
✅ **No Database Migration**: Runtime normalization handles old URLs  
✅ **Backward Compatible**: Works with both old and new URLs  
✅ **Cache Control**: Full Cloudflare caching features  
✅ **Security**: HTTPS with Cloudflare protection  

---

## 📝 POST-MIGRATION TASKS

### Immediate (After Verification)
- [ ] Turn off Development Mode in Cloudflare
- [ ] Monitor error logs for 24 hours
- [ ] Test on all major browsers
- [ ] Test on mobile devices

### Optional (Future)
- [ ] Set up Cache Rules for optimal CDN performance
- [ ] Configure Page Rules for image optimization
- [ ] Enable Cloudflare Image Resizing (if needed)
- [ ] Set up Analytics to track CDN usage

### Documentation
- [ ] Update API documentation with CDN URLs
- [ ] Update user guides with new image URLs
- [ ] Document CDN configuration in team wiki

---

## 🔗 USEFUL LINKS

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **R2 Documentation**: https://developers.cloudflare.com/r2/
- **DNS Checker**: https://dnschecker.org/#CNAME/cdn.odanet.com.tr
- **Replit Deployments**: https://replit.com/~/deployments

---

## 📞 SUPPORT

If you encounter issues:

1. **Check this guide's Troubleshooting section**
2. **Verify all checklist items are complete**
3. **Check Cloudflare dashboard for errors**
4. **Review browser console for error messages**
5. **Test with Development Mode ON first**

---

**Once all checklist items are complete, your Odanet platform will serve all images from your professional CDN domain: cdn.odanet.com.tr!** 🚀

**Remember**: Turn off Development Mode after successful testing to enable full CDN caching benefits.
