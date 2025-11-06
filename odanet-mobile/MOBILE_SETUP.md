# 📱 Odanet Mobile App Setup Guide

## ✅ Project Successfully Created

Your Expo React Native mobile app for Odanet has been set up and is ready to run!

## 📦 What's Installed

### Core Dependencies (777 packages)
- **Expo SDK 54** - Latest Expo framework
- **React 19.1.0** - Latest React
- **React Native 0.81** - Latest RN for Expo SDK 54
- **Expo Router 6.x** - File-based routing
- **NativeWind 4.x** - Tailwind CSS for React Native
- **TanStack Query** - Server state management
- **Axios** - API client
- **Expo SecureStore** - Secure token storage

### Features Implemented
- ✅ Home screen with latest listings preview
- ✅ Full listings browse page
- ✅ User profile page
- ✅ Login/Register screen
- ✅ API connection to https://www.odanet.com.tr/api
- ✅ JWT authentication flow
- ✅ Odanet brand theme (matching web app)
- ✅ Pull-to-refresh on listings
- ✅ Loading states and error handling

## 🚀 How to Run

### Method 1: Start Development Server

```bash
cd odanet-mobile
npm start
```

This will start the Expo Metro bundler and show a QR code.

### Method 2: Run on Specific Platform

```bash
# Android (requires Android Studio or device)
npm run android

# iOS (requires Mac with Xcode)
npm run ios

# Web browser
npm run web
```

### Method 3: Use Expo Go App

1. Install **Expo Go** on your phone:
   - iOS: Download from App Store
   - Android: Download from Play Store

2. Start the dev server:
   ```bash
   cd odanet-mobile
   npm start
   ```

3. Scan the QR code:
   - iOS: Use Camera app
   - Android: Use Expo Go app scanner

## 📱 App Structure

```
odanet-mobile/
├── app/                    # Screens (Expo Router)
│   ├── _layout.tsx        # Root layout with React Query
│   ├── index.tsx          # Home screen
│   ├── listings.tsx       # All listings
│   ├── profile.tsx        # User profile
│   └── login.tsx          # Authentication
├── components/
│   └── ListingCard.tsx    # Reusable listing card
├── hooks/
│   ├── useAuth.ts         # Auth hooks (login, register, logout)
│   └── useListings.ts     # Listings data hooks
├── lib/
│   └── api.ts             # Axios API client
├── assets/                # Images and icons
├── app.config.ts          # Expo configuration
├── babel.config.js        # Babel plugins
├── metro.config.js        # Metro bundler config
└── tailwind.config.js     # Tailwind theme
```

## 🎨 Design System

The mobile app uses the same color palette as the Odanet web app:

- **Primary**: `#0EA5A7` (Turkuaz)
- **Accent**: `#F97316` (Orange)
- **Secondary**: `#0F172A` (Dark Navy)
- **Background**: `#F8FAFC` (Light gray)

Use Tailwind classes like `bg-primary`, `text-accent`, etc.

## 🔌 API Integration

The app connects to your production backend:

```typescript
// lib/api.ts
const apiUrl = "https://www.odanet.com.tr/api";
```

### Available Hooks

```typescript
// Authentication
const { data: user } = useCurrentUser();
const login = useLogin();
const register = useRegister();
const logout = useLogout();

// Listings
const { data: listings } = useListings();
const { data: listing } = useListing(id);
```

## 🔒 Authentication Flow

1. User logs in via `/login` screen
2. JWT token is stored in Expo SecureStore
3. Token is automatically attached to all API requests
4. User data is cached in React Query
5. On logout, token is removed and cache is cleared

## 📝 Adding New Screens

Create a new file in the `app/` directory:

```typescript
// app/favorites.tsx
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Favorites() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-2xl font-bold">My Favorites</Text>
      </View>
    </SafeAreaView>
  );
}
```

It will automatically be available at `/favorites` route!

## 🎯 Next Steps

1. **Replace placeholder assets**: Add real icons and splash screens in `assets/`
2. **Test on real device**: Use Expo Go to test on your phone
3. **Add more features**:
   - Listing details page
   - Favorites functionality
   - Messaging system
   - Profile editing
   - Image upload
4. **Build for production**: Run `expo build` when ready

## 🐛 Troubleshooting

### QR Code won't scan
- Make sure your phone and computer are on the same Wi-Fi network
- Try using tunnel mode: `npx expo start --tunnel`

### Module not found errors
```bash
cd odanet-mobile
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Metro bundler cache issues
```bash
npx expo start --clear
```

### TypeScript errors
The project uses TypeScript but will still run with type errors. Fix them gradually.

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [TanStack Query Docs](https://tanstack.com/query/latest)

## ✅ Checklist

- [x] Project structure created
- [x] All dependencies installed (777 packages)
- [x] API client configured
- [x] Authentication hooks implemented
- [x] Home, Listings, Profile, Login screens created
- [x] Design system matching web app
- [x] React Query setup for data fetching
- [x] Expo Router for navigation
- [ ] Test on physical device
- [ ] Add real app icons
- [ ] Build production version

---

**Status**: ✅ Ready to run!  
**Command**: `cd odanet-mobile && npm start`  
**Backend**: https://www.odanet.com.tr/api
