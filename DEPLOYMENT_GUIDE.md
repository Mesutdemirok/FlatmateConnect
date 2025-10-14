# 🚀 Odanet Deployment Guide - Custom Domain Fix

## Problem Summary
- ✅ Replit preview works: `flatmate-connect-1-mesudemirok.replit.app`
- ❌ Custom domain fails to load data: `https://www.odanent.com.tr`
- **Root Cause**: Custom domain was serving only static files, not the Express backend

## ✅ What's Fixed
1. **Deployment Configuration** - Set to "autoscale" to run the Express server
2. **CORS Configuration** - Added support for www.odanent.com.tr and odanent.com.tr
3. **Build Scripts** - Configured to build both frontend and backend

## 📋 How to Deploy (Step-by-Step)

### Step 1: Deploy to Production
1. Click the **"Deploy"** button in Replit (top right)
2. Choose **"Autoscale"** deployment type (already configured)
3. Wait for the build to complete
4. Replit will provide a deployment URL

### Step 2: Connect Your Custom Domain
1. Go to your deployment settings in Replit
2. Click **"Add Custom Domain"**
3. Enter: `www.odanent.com.tr`
4. Follow the DNS instructions Replit provides

### Step 3: DNS Configuration
Make sure your DNS records point to Replit's deployment:
```
Type: CNAME
Name: www
Value: [Replit provides this - usually ends in .replit.app]
TTL: Auto or 3600
```

### Step 4: Verify It Works
After deployment (and DNS propagation - can take 5-60 minutes):

1. **Test the API directly**:
   ```
   https://www.odanent.com.tr/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Test listings**:
   ```
   https://www.odanent.com.tr/api/listings
   ```
   Should return JSON with listings

3. **Open the website**:
   ```
   https://www.odanent.com.tr
   ```
   Should load with all data visible

## 🔧 Technical Details

### Deployment Configuration
```
Type: Autoscale
Build: npm run build
Run: npm run start
Port: 5000
```

### CORS Domains Allowed
- ✅ https://www.odanent.com.tr
- ✅ https://odanent.com.tr
- ✅ localhost (development)

### What the Build Does
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Production**: Single Express server serves both frontend & API

## 🐛 Troubleshooting

### If data still doesn't load:

**1. Check API Endpoint**
Open browser console (F12) → Network tab
- Look for `/api/listings` requests
- Check if they return 200 or error status

**2. Clear Cache**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

**3. Verify DNS**
```bash
nslookup www.odanent.com.tr
```
Should point to Replit's servers

**4. Check Deployment Logs**
In Replit deployment dashboard:
- Click on your deployment
- View logs for errors
- Ensure Express server started successfully

### Common Issues:

❌ **"Cannot GET /api/listings"**
→ Backend not running - redeploy with "Autoscale" type

❌ **CORS Error**
→ Already fixed - redeploy to apply changes

❌ **404 on custom domain**
→ DNS not configured or still propagating - wait up to 1 hour

❌ **Works on www but not without www**
→ Add CNAME for root domain or use URL redirect

## 🎯 Quick Test Commands

```bash
# Test API health
curl https://www.odanent.com.tr/api/health

# Test listings (should return JSON)
curl https://www.odanent.com.tr/api/listings

# Test seekers (should return JSON)
curl https://www.odanent.com.tr/api/seekers/public
```

## ✅ Success Checklist
- [ ] Deployed to Replit with "Autoscale" type
- [ ] Custom domain added in Replit settings
- [ ] DNS CNAME record configured
- [ ] Waited for DNS propagation (5-60 min)
- [ ] `/api/health` returns `{"status":"ok"}`
- [ ] Website loads with all data visible

---

**Need help?** Check Replit deployment logs or contact Replit support for DNS/domain issues.
