# 🔄 Move Domain from Old Project to FlatmateConnect-1

## Current Situation
- ❌ **Domain**: www.odanent.com.tr is linked to **"Create Next App"** (old project)
- ✅ **Need**: Link domain to **"FlatmateConnect-1"** (this project)

## 📋 Step-by-Step Instructions

### PART 1: Remove Domain from Old Project (5 minutes)

1. **Open the old "Create Next App" project**
   - Go to your Replit dashboard
   - Find and click on the **"Create Next App"** project

2. **Navigate to Deployments**
   - Click the **"Deploy"** tab/button
   - You'll see the deployment with www.odanent.com.tr

3. **Remove the custom domain**
   - Click on the deployment
   - Go to **"Settings"** or **"Domains"** tab
   - Find **www.odanent.com.tr** in the list
   - Click **"Remove"**, **"Delete"**, or **"Unlink"** next to the domain
   - Confirm the removal

   > **Note**: This won't delete your DNS records, just unlinks the domain from that deployment

### PART 2: Add Domain to FlatmateConnect-1 (5 minutes)

1. **Return to this project (FlatmateConnect-1)**
   - Go back to your Replit dashboard
   - Open **"FlatmateConnect-1"** project (the one you're working on now)

2. **Create/Open Autoscale Deployment**
   - Click the **"Deploy"** button
   
   **If you already have an Autoscale deployment:**
   - Click on it to open settings
   
   **If you DON'T have an Autoscale deployment yet:**
   - Click **"+ New Deployment"** or **"Create Deployment"**
   - Select **"Autoscale"** (NOT "Static")
   - Build command: `npm run build`
   - Run command: `npm run start`
   - Click **"Deploy"** and wait for it to finish

3. **Add Custom Domain**
   - Once in the deployment, go to **"Settings"** or **"Domains"** tab
   - Click **"Link a domain"** or **"Add custom domain"**
   - Enter: `www.odanent.com.tr`
   - Click **"Add"** or **"Link"**

4. **Verify DNS Settings (if prompted)**
   - Replit will show you DNS records (A record and TXT record)
   - **Check if these match your current DNS settings**
   
   **If the IP address changed:**
   - Update the A record in your domain registrar
   - Your A record should point to the new Replit IP
   
   **If the IP is the same:**
   - No DNS changes needed! The domain will switch automatically

### PART 3: Wait for Activation (5-30 minutes)

1. **DNS Propagation**
   - If you updated DNS: Wait 5-60 minutes
   - If DNS unchanged: Wait 2-5 minutes

2. **Verify It Works**
   Test these URLs:
   
   ```bash
   # Test API health
   https://www.odanent.com.tr/api/health
   # Should return: {"status":"ok"}
   
   # Test listings
   https://www.odanent.com.tr/api/listings
   # Should return: JSON array with listings
   
   # Test website
   https://www.odanent.com.tr
   # Should show Odanet with all data
   ```

## 🎯 Quick Visual Guide

```
BEFORE:
┌──────────────────────────────────────┐
│ Create Next App (old project)       │
│   └─ www.odanent.com.tr ❌          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ FlatmateConnect-1 (this project)     │
│   └─ No custom domain                │
└──────────────────────────────────────┘

AFTER:
┌──────────────────────────────────────┐
│ Create Next App (old project)       │
│   └─ (no domain)                     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ FlatmateConnect-1 (this project)     │
│   └─ www.odanent.com.tr ✅          │
│   └─ Autoscale Deployment            │
│   └─ Express Server Running          │
└──────────────────────────────────────┘
```

## 🔍 Finding Your Projects

If you can't find the old project:

1. **From Replit Dashboard:**
   - Go to https://replit.com/~
   - Look through "My Repls"
   - Search for "Create Next App" or "Next"

2. **From Domain Settings:**
   - Some registrars show which server the domain points to
   - You might see "flatmate-connect" or similar in DNS records

## 🐛 Troubleshooting

### "I can't find the old Create Next App project"
- Check your Replit account's project list
- Try searching for "Next" or looking at older projects
- If you deleted it, the domain might auto-release (wait 24 hours)

### "The domain is still showing the old site"
- **Clear browser cache**: Ctrl+Shift+R or Cmd+Shift+R
- **Check DNS propagation**: Use https://dnschecker.org
- **Wait longer**: DNS can take up to 48 hours (usually 5-30 minutes)

### "Replit says domain is already in use"
- Make sure you removed it from the old project first
- Wait 5-10 minutes after removal
- Try again

### "Which IP should my A record point to?"
- Replit will show you the correct IP when you add the domain
- If it's the same IP as before, no DNS changes needed
- Common Replit IPs are in the 34.x.x.x range

## ✅ Success Checklist

- [ ] Removed www.odanent.com.tr from "Create Next App" project
- [ ] Created/verified Autoscale deployment in FlatmateConnect-1
- [ ] Added www.odanent.com.tr to FlatmateConnect-1 deployment
- [ ] Verified DNS settings (if IP changed)
- [ ] Waited for DNS propagation (5-30 min)
- [ ] Tested https://www.odanent.com.tr/api/health
- [ ] Tested https://www.odanent.com.tr (full site with data)

## 📞 Need Help?

- **Replit Support**: Contact them about domain transfer issues
- **DNS Help**: Check your domain registrar's support docs
- **Project Issues**: Make sure this project has an Autoscale deployment

---

**Summary**: Remove domain from old project → Add to FlatmateConnect-1 → Wait for DNS → Test!
