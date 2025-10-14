# 🔧 Fix Custom Domain - Point to Node.js Server

## Current Situation
- ✅ **Replit Preview Works**: flatmate-connect-1-mesudemirok.replit.app (runs Express server)
- ❌ **Custom Domain Broken**: www.odanent.com.tr (serves only static files)
- **Root Cause**: Custom domain points to wrong deployment type

## 📋 Step-by-Step Fix (5 Minutes)

### Step 1: Access Deployment Settings
1. Click **"Deploy"** button in Replit (top right)
2. You'll see your existing deployments listed

### Step 2: Identify the Problem Deployment
Look for a deployment that says:
- Type: **"Static"** or **"Hosting"** ❌ (this is the broken one)
- Connected to: www.odanent.com.tr

### Step 3: Create Correct Deployment

#### Option A: Delete Old & Create New (Recommended)
1. **Delete the static deployment**:
   - Click "..." menu on the static deployment
   - Select "Delete deployment"
   
2. **Create new Autoscale deployment**:
   - Click **"Create deployment"** or **"+ New deployment"**
   - Select **"Autoscale"** (NOT "Static" or "Hosting")
   - Build command: `npm run build` (already configured)
   - Run command: `npm run start` (already configured)
   - Click **"Deploy"**

3. **Connect your custom domain**:
   - Once deployed, click on the deployment
   - Go to **"Custom Domains"** or **"Domains"** tab
   - Click **"Add custom domain"**
   - Enter: `www.odanent.com.tr`
   - Follow DNS instructions if needed

#### Option B: Update Existing Deployment (If Available)
1. Click on your static deployment
2. Look for **"Deployment Type"** or **"Settings"**
3. Change from **"Static"** to **"Autoscale"**
4. Save and redeploy

### Step 4: Verify It Works
Wait 2-3 minutes, then test:

1. **Test API directly**:
   ```
   https://www.odanent.com.tr/api/health
   ```
   ✅ Should return: `{"status":"ok"}`

2. **Test listings**:
   ```
   https://www.odanent.com.tr/api/listings
   ```
   ✅ Should return JSON array with listings

3. **Open website**:
   ```
   https://www.odanent.com.tr
   ```
   ✅ Should show listings and seeker cards

## 🎯 What Each Deployment Type Does

### ❌ Static Deployment (Current - WRONG)
```
www.odanent.com.tr → Static files only
                  → No /api routes
                  → No database access
                  → Only HTML/CSS/JS files
```

### ✅ Autoscale Deployment (Need This - CORRECT)
```
www.odanent.com.tr → Express Node.js server
                  → Handles /api routes
                  → Database connections
                  → Serves frontend + backend
```

## 🔍 Visual Guide

When creating deployment, you should see:

```
┌─────────────────────────────────┐
│  Choose Deployment Type         │
├─────────────────────────────────┤
│                                 │
│  ● Autoscale ← SELECT THIS!    │
│    Run your server on demand    │
│    Best for web apps with APIs  │
│                                 │
│  ○ Static                       │
│    Host static files only       │
│    (HTML, CSS, JavaScript)      │
│                                 │
│  ○ Reserved VM                  │
│    Always-on server             │
│                                 │
└─────────────────────────────────┘
```

## ✅ Success Checklist

After completing steps above:
- [ ] Deleted old static deployment
- [ ] Created new Autoscale deployment
- [ ] Custom domain (www.odanent.com.tr) connected
- [ ] `/api/health` returns `{"status":"ok"}`
- [ ] `/api/listings` returns data
- [ ] Website loads with all listings visible

## 🐛 Troubleshooting

### "I don't see Autoscale option"
- Look for: "Application", "Web Service", or "Server"
- Avoid: "Static Site", "Hosting", "Static Files"

### "Custom domain not working after change"
- Wait 5-10 minutes for DNS propagation
- Clear browser cache (Ctrl+Shift+R)
- Check deployment logs for errors

### "Deployment failed"
- Check build logs for errors
- Ensure PostgreSQL database is running
- Environment variables are set

## 📞 Need Help?

If stuck, check:
1. **Deployment Logs**: Click on deployment → View logs
2. **Replit Docs**: https://docs.replit.com/hosting/deployments
3. **Support**: Contact Replit support for domain issues

---

**The configuration in your code is perfect - you just need to point your custom domain to an Autoscale deployment instead of Static!**
