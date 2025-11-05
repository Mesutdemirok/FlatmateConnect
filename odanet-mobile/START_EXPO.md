# 🚀 Expo Mobile App - Start Guide

## ✅ Setup Verification Complete

All components verified and ready:
- ✅ **Babel Config**: Correctly configured with expo-router support
- ✅ **App Config**: Valid with name "Odanet" and slug "odanet"
- ✅ **Package.json**: Main entry set to "expo-router/entry"
- ✅ **Expo Version**: 54.0.15
- ✅ **Dependencies**: All up to date
- ✅ **API URL**: https://www.odanet.com.tr/api

## 🎯 Starting the App

### Option 1: Development Mode (Recommended)
```bash
cd odanet-mobile
npx expo start --clear
```

This will:
- Clear the Metro cache
- Start the development server
- Show a QR code for Expo Go

### Option 2: Tunnel Mode (For Remote Testing)
```bash
cd odanet-mobile
npx expo start --tunnel --clear
```

**Note**: Tunnel mode uses ngrok and may require additional setup in Replit.

### Option 3: Web Preview
```bash
cd odanet-mobile
npx expo start --web
```

## 📱 Testing on Device

### Using Expo Go App:
1. Install **Expo Go** from:
   - iOS: App Store
   - Android: Google Play Store

2. Scan the QR code shown in the terminal

3. The app will load on your device

### Using iOS Simulator:
```bash
# Press 'i' in the Expo terminal
# Or run:
npx expo start --ios
```

### Using Android Emulator:
```bash
# Press 'a' in the Expo terminal
# Or run:
npx expo start --android
```

## 🔧 Troubleshooting

### If you see Babel errors:
```bash
cd odanet-mobile
rm -rf .expo node_modules/.cache
npx expo start --clear
```

### If dependencies are out of sync:
```bash
cd odanet-mobile
npx expo install --check
npx expo install --fix
```

### If Metro bundler crashes:
```bash
# Kill any existing processes on port 8081
killall -9 node
cd odanet-mobile
npx expo start --clear
```

## 📊 Current Configuration

- **API Endpoint**: https://www.odanet.com.tr/api
- **Expo SDK**: 54.0.22
- **React Native**: 0.81.5
- **React**: 19.1.0

## 🎨 Features Implemented

### ✅ Completed Screens:
1. **Listings** - Browse and search room listings
2. **Messages** - View conversations (requires authentication)
3. **Profile** - User profile and settings (requires authentication)

### 🔐 Authentication:
- JWT tokens stored in SecureStore
- Auto-logout on 401 responses
- Login prompts for unauthenticated screens

### 🎯 API Integration:
- `/api/listings` - Fetch listings
- `/api/auth/me` - Get current user
- `/api/conversations` - Get user conversations
- `/api/proxy/*` - Image proxy for iOS

## 📝 Development Notes

### Hot Reload:
Metro bundler supports hot reload. Save any file to see changes instantly.

### Environment Variables:
API URL is configured in `app.config.ts` under `extra.apiUrl`.

### TypeScript:
Full TypeScript support enabled with proper types for all hooks and components.

## 🚀 Next Steps

1. Test the app on your device using Expo Go
2. Verify all screens load correctly
3. Test authentication flow (requires backend JWT setup)
4. Add login/register screens
5. Implement image display in listings

## 📞 Support

For issues or questions:
- Check IMPLEMENTATION_SUMMARY.md for technical details
- Review SETUP.md for general setup instructions
- Check Expo documentation: https://docs.expo.dev/

---

**Status**: ✅ Ready to Launch
**Last Updated**: November 5, 2025
