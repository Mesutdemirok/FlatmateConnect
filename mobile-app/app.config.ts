import path from "path";
import "dotenv/config";

export default {
  expo: {
    name: "Odanet",
    slug: "odanet-mobile",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "odanet", // for deep linking & Google OAuth redirect
    icon: path.resolve(__dirname, "assets/icon.png"),
    userInterfaceStyle: "light",

    splash: {
      image: path.resolve(__dirname, "assets/splash.png"),
      resizeMode: "contain",
      backgroundColor: "#7F00FF", // Purple gradient base
    },

    assetBundlePatterns: ["**/*"],

    updates: {
      enabled: true,
      fallbackToCacheTimeout: 0,
      checkAutomatically: "ON_LOAD",
    },

    runtimeVersion: {
      policy: "sdkVersion",
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.odanet.app",
      buildNumber: "1",
      infoPlist: {
        NSCameraUsageDescription:
          "Odanet needs access to your camera for uploading room and profile photos.",
        NSPhotoLibraryUsageDescription:
          "Odanet needs access to your photos for profile and listing images.",
        NSPhotoLibraryAddUsageDescription:
          "Odanet needs permission to save photos to your gallery.",
      },
    },

    android: {
      package: "com.odanet.app",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: path.resolve(__dirname, "assets/adaptive-icon.png"),
        backgroundColor: "#7F00FF",
      },
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "CAMERA",
      ],
      softwareKeyboardLayoutMode: "pan",
    },

    web: {
      favicon: path.resolve(__dirname, "assets/favicon.png"),
      bundler: "metro",
      themeColor: "#7F00FF",
    },
    extra: {
      apiBaseUrl: "https://www.odanet.com.tr/api",
      googleAuthRedirect: "odanet://auth",
      env: process.env.NODE_ENV ?? "production",
      eas: {
        projectId: "a21f0bc7-a5a4-417c-9eea-3e7ad1915192",
      },
    },

    plugins: [
      "expo-router",
      "expo-web-browser",
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            minSdkVersion: 24,
            buildToolsVersion: "34.0.0",
          },
          ios: {
            deploymentTarget: "15.1",
          },
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow Odanet to access your photos to upload room and profile images.",
          cameraPermission:
            "Allow Odanet to access your camera for capturing listing photos.",
        },
      ],
    ],
  },
};
