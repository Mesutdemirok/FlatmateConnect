import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Odanet Mobile",
  slug: "odanet-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "odanet",
  platforms: ["ios", "android"],
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#008080"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.odanet.mobile"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#008080"
    },
    package: "com.odanet.mobile"
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-secure-store"
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://www.odanet.com.tr/api"
  }
});
