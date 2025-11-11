# Odanet Mobile App

React Native mobile application for Odanet (FlatmateConnect) built with Expo.

## Tech Stack

- **Framework**: Expo SDK 54 + React Native
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: TanStack Query (React Query)
- **API**: Axios (connecting to https://www.odanet.com.tr/api)
- **Auth**: Expo SecureStore for token management

## Features

- 🏠 Browse room listings
- 👤 User authentication (login/register)
- 📱 Native mobile experience
- 🎨 Matching design system with web app
- ⚡ Real-time data sync with backend

## Getting Started

### Install Dependencies

```bash
cd odanet-mobile
npm install
```

### Start Development Server

```bash
npm start
```

Then scan the QR code with:
- **iOS**: Expo Go app from App Store
- **Android**: Expo Go app from Play Store

### Run on Specific Platform

```bash
npm run android  # Android emulator/device
npm run ios      # iOS simulator (Mac only)
npm run web      # Web browser
```

## Project Structure

```
odanet-mobile/
├── app/              # Expo Router screens
│   ├── _layout.tsx   # Root layout with providers
│   ├── index.tsx     # Home screen
│   ├── listings.tsx  # Listings screen
│   ├── profile.tsx   # Profile screen
│   └── login.tsx     # Login/Register screen
├── components/       # Reusable components
│   └── ListingCard.tsx
├── hooks/            # Custom React hooks
│   ├── useAuth.ts    # Authentication hooks
│   └── useListings.ts # Listings data hooks
├── lib/              # Utilities
│   └── api.ts        # Axios API client
├── assets/           # Images and fonts
├── app.config.ts     # Expo configuration
├── babel.config.js   # Babel configuration
├── metro.config.js   # Metro bundler config
└── tailwind.config.js # Tailwind theme

## API Connection

The app connects to the Odanet backend at:
```
https://www.odanet.com.tr/api
```

All API calls are authenticated using JWT tokens stored in Expo SecureStore.

## Theming

The app uses the same color palette as the web application:
- Primary: #0EA5A7 (Turkuaz)
- Accent: #F97316 (Orange)
- Background: #F8FAFC (Light gray)

## Development Notes

- NativeWind is configured for Tailwind CSS support
- React Query handles all server state management
- Expo Router provides file-based routing
- All screens are TypeScript for type safety
