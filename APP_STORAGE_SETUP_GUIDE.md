# ✅ App Storage Migration - Setup Guide

## 🎯 What's Been Done

I've installed Replit App Storage to fix the image persistence issue on your production domains (www.odanet.com.tr and odanet.com.tr).

### Files Created:
- `server/objectStorage.ts` - Cloud storage service
- `server/objectAcl.ts` - Access control for files
- `client/src/components/ObjectUploader.tsx` - Upload component
- Installed packages: `@uppy/core`, `@uppy/react`, `@uppy/dashboard`, `@uppy/aws-s3`, `@google-cloud/storage`

---

## 📋 NEXT STEPS - You Need To Do These

### Step 1: Create Storage Bucket (2 minutes)

1. **Open App Storage Tool**:
   - Look for "Object Storage" or "App Storage" in the left sidebar of Replit
   - Click on it

2. **Create Bucket**:
   - Click "Create new bucket"
   - Bucket name: `odanet-uploads`
   - Click "Create"

3. **Copy Bucket ID**:
   - After creating, click on the bucket
   - Go to "Settings"
   - You'll see a "Bucket ID" - copy it
   - Format looks like: `/odanet-uploads` or `/bucket-id-here`

### Step 2: Set Environment Variable

1. **Open Secrets/Environment Variables**:
   - Click the lock icon (🔒) in left sidebar
   - Or go to "Tools" → "Secrets"

2. **Add New Secret**:
   - Key: `PRIVATE_OBJECT_DIR`
   - Value: The bucket ID you copied (e.g., `/odanet-uploads`)
   - Click "Add Secret" or "Save"

### Step 3: Restart Your App

After adding the secret:
- Your app will auto-restart
- Or manually click "Stop" then "Run" in the workflow panel

---

## 🚧 What Happens Next

After you complete Steps 1-3 above, I will:

1. ✅ Update your image upload routes to use App Storage
2. ✅ Update listing creation forms to use new uploader
3. ✅ Update seeker profile image uploads
4. ✅ Test the system

---

## 📝 Important Notes

### ⚠️ Existing Images
- **Development environment images**: These are only in your preview, not in production
- **You'll need to re-upload** listing images after migration
- Production currently has NO images (that's why they're broken)

### ✅ After Migration
- Images will work on **both** www.odanet.com.tr AND odanet.com.tr
- Images **never disappear** - they're stored in Google Cloud Storage
- Works perfectly with Autoscale deployments

### 💰 Cost
- ~$0.03/GB/month for storage
- ~$0.10/GB for bandwidth
- Estimated cost for 1000 listings: **$0.15-0.50/month**

---

## 🆘 Troubleshooting

**Can't find App Storage tool?**
- Look for "Object Storage" in Tools menu
- Make sure you're on a paid Replit plan (App Storage requires paid plan)

**Getting "PRIVATE_OBJECT_DIR not set" error?**
- Make sure you added the secret correctly
- Restart the app after adding the secret
- Check the value starts with a slash: `/odanet-uploads`

---

## ✋ When You're Ready

**Let me know when you've completed Steps 1-3**, and I'll finish the migration by updating all the upload code!

Just say:
- "Done - bucket created" or
- "Bucket setup complete" or
- "Ready for next step"

And I'll immediately continue with updating the upload routes!
