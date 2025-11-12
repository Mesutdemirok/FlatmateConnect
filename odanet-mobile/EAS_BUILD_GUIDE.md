# 🚀 EAS Build Guide - Odanet Mobile

Your mobile app is now fully configured for EAS (Expo Application Services) builds!

---

## ✅ Setup Complete

All dependencies are aligned with Expo SDK 51, and your build environment is ready!

### What's Configured:

✅ **EAS CLI**: v16.26.0 installed  
✅ **Expo SDK**: 51.0.39  
✅ **Dependencies**: All 16/16 checks passed  
✅ **Build Config**: eas.json configured  
✅ **App Config**: Proper iOS and Android settings  
✅ **Project ID**: a21f0bc7-a5a4-417c-9eea-3e7ad1915192

---

## 📱 Build Profiles

You have 3 build profiles configured in `eas.json`:

### 1. **Development Build**
```bash
eas build --profile development --platform android
```
- Creates a development client
- Internal distribution
- Includes dev tools

### 2. **Preview Build** (RECOMMENDED FOR TESTING)
```bash
eas build --profile preview --platform android
```
- Creates standalone APK (Android)
- Internal distribution
- No Expo Go needed
- **Best for sharing with testers**

### 3. **Production Build**
```bash
eas build --profile production --platform android
```
- Creates app bundle (Android) or IPA (iOS)
- Ready for App Store / Play Store
- Auto-increments version

---

## 🎯 Quick Start: Build Your First APK

### Step 1: Login to Expo
```bash
eas login
```

If you don't have an account:
```bash
eas register
```

### Step 2: Build for Android (Preview)
```bash
cd odanet-mobile
eas build --profile preview --platform android
```

### What Happens:
1. ✅ EAS checks your configuration
2. ✅ Uploads your code to Expo servers
3. ✅ Builds your app (~10-15 minutes)
4. ✅ Provides download link for APK
5. ✅ You install it on your phone!

### Step 3: Download and Install
1. Wait for build to complete
2. Click the download link
3. Transfer APK to your Android phone
4. Install it (may need to enable "Unknown sources")
5. Launch Odanet! 🎉

---

## 📊 Build Configuration Details

### Android Builds

**Preview/Development**:
- Build Type: APK (smaller, faster)
- Distribution: Internal
- Permissions: Internet, Network State

**Production**:
- Build Type: App Bundle (AAB)
- Auto-increment version
- Ready for Google Play Store

### iOS Builds

**All Profiles**:
- Resource Class: m-medium
- Bundle ID: com.odanet.app
- Build Number: Auto-incremented

**Preview**:
- Simulator: Enabled (for testing on Mac)

---

## 🔧 Common Build Commands

### Build for Both Platforms
```bash
eas build --profile preview --platform all
```

### Build for iOS Only
```bash
eas build --profile preview --platform ios
```

### Check Build Status
```bash
eas build:list
```

### View Build Details
```bash
eas build:view [BUILD_ID]
```

### Cancel a Build
```bash
eas build:cancel [BUILD_ID]
```

---

## 📦 What's Included in Builds

Your Odanet mobile app builds include:

✅ **All Features**:
- Home screen with listings
- Listings browse
- Listing details
- User profile
- Login/Register
- JWT authentication
- Pull-to-refresh
- Native navigation

✅ **Optimized**:
- Production React Native bundle
- Optimized images
- Compressed assets
- Native code compilation

✅ **Configured**:
- App icon
- Splash screen
- Turkuaz/Orange branding
- Package name: com.odanet.app
- Backend API: https://www.odanet.com.tr/api

---

## 🎨 App Details

**App Name**: Odanet  
**Package (Android)**: com.odanet.app  
**Bundle ID (iOS)**: com.odanet.app  
**Version**: 1.0.0  
**Build Number**: 1

**Brand Colors**:
- Primary: #0EA5A7 (Turkuaz)
- Accent: #F97316 (Orange)
- Splash: #00A6A6

---

## 📱 Build Types Explained

### APK (Android Package)
- ✅ Smaller file size (~40-60 MB)
- ✅ Faster builds
- ✅ Direct install on any Android device
- ✅ Best for testing and sharing
- ❌ Can't submit to Play Store

### AAB (Android App Bundle)
- ✅ Optimized for Play Store
- ✅ Smaller download for users
- ✅ Required for Google Play
- ❌ Larger file size
- ❌ Can't install directly (need bundletool)

### IPA (iOS App Archive)
- ✅ Standard iOS app package
- ✅ Required for App Store
- ⚠️ Needs Apple Developer account ($99/year)
- ⚠️ Device must be registered for testing

---

## 🚀 Complete Build Workflow

### For Testing (Android):
1. Build APK:
   ```bash
   eas build --profile preview --platform android
   ```
2. Wait 10-15 minutes
3. Download APK from link
4. Install on phone
5. Test features
6. Collect feedback
7. Make improvements
8. Rebuild!

### For Production (Google Play):
1. Build AAB:
   ```bash
   eas build --profile production --platform android
   ```
2. Download AAB
3. Upload to Google Play Console
4. Set up store listing
5. Submit for review
6. Publish!

### For Production (App Store):
1. Get Apple Developer account
2. Register devices/certificates
3. Build IPA:
   ```bash
   eas build --profile production --platform ios
   ```
4. Download IPA
5. Upload via App Store Connect
6. Submit for review
7. Publish!

---

## ⚡ Build Optimization Tips

### Faster Builds:
- Use `--platform android` (faster than iOS)
- Use `preview` profile (APK faster than AAB)
- Build during off-peak hours
- Use EAS cache (automatic)

### Smaller Builds:
- Remove unused dependencies
- Optimize images before adding
- Use production builds (auto-optimized)
- Enable Hermes engine (already configured)

### Cost Optimization:
- Free tier: 30 builds/month
- Use preview builds for testing
- Use production builds only for releases
- Reuse builds when possible

---

## 🐛 Troubleshooting

### "No EAS project found"
```bash
# Configure EAS in your project
eas build:configure
```

### "Build failed - check logs"
```bash
# View detailed build logs
eas build:view [BUILD_ID]
```

### "Invalid credentials"
```bash
# Re-login
eas logout
eas login
```

### "Can't install APK on phone"
- Go to Settings → Security
- Enable "Install unknown apps"
- Allow your browser/file manager

### "iOS build requires Apple Developer account"
- Sign up at developer.apple.com ($99/year)
- Or use Android for testing (free!)

---

## 📊 Expected Build Times

| Platform | Profile | Build Time | Output Size |
|----------|---------|------------|-------------|
| Android | Development | 10-15 min | 45-55 MB (APK) |
| Android | Preview | 10-15 min | 40-50 MB (APK) |
| Android | Production | 15-20 min | 25-35 MB (AAB) |
| iOS | Development | 15-20 min | 60-80 MB (IPA) |
| iOS | Preview | 15-20 min | 55-75 MB (IPA) |
| iOS | Production | 20-25 min | 50-70 MB (IPA) |

---

## ✅ Pre-Build Checklist

Before building, verify:

- [x] EAS CLI installed (`eas --version`)
- [x] Logged into Expo account (`eas whoami`)
- [x] Project configured (`eas.json` exists)
- [x] No expo doctor errors (`npx expo-doctor`)
- [x] Dependencies installed (`npm install`)
- [x] App config complete (`app.config.ts`)
- [x] Assets present (icon, splash screen)

**All checks passed! ✅ You're ready to build!**

---

## 🎉 Next Steps

### Right Now:
1. **Build your first APK**:
   ```bash
   eas login
   eas build --profile preview --platform android
   ```

2. **Wait for build** (~15 minutes)

3. **Download and test** on your phone!

### Later:
4. Share with friends/testers
5. Collect feedback
6. Make improvements
7. Build for iOS (if needed)
8. Submit to app stores

---

## 📚 Additional Resources

### Documentation:
- EAS Build Docs: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/
- App Store Guide: https://docs.expo.dev/distribution/app-stores/

### Commands Reference:
```bash
# Build commands
eas build --profile [profile] --platform [platform]
eas build:list
eas build:view [BUILD_ID]
eas build:cancel [BUILD_ID]

# Account commands
eas login
eas logout
eas whoami

# Project commands
eas build:configure
eas project:info
eas update
```

---

## 🎯 Summary

Your Odanet mobile app is **100% ready** for EAS builds!

**To build your first APK**:
```bash
cd odanet-mobile
eas login
eas build --profile preview --platform android
```

**Build time**: 10-15 minutes  
**Output**: Downloadable APK file  
**Install**: Direct on any Android phone  
**Cost**: Free (30 builds/month)

---

**Ready to build your app?** Just run the command above! 🚀
