import path from "path";

export default {
  expo: {
    name: "Odanet",
    slug: "odanet-mobile",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "odanet",
    icon: path.resolve(__dirname, "assets/icon.png"),
    userInterfaceStyle: "light",

    splash: {
      image: path.resolve(__dirname, "assets/splash.png"),
      resizeMode: "contain",
      backgroundColor: "#00A6A6",
    },

    updates: {
      url: "https://u.expo.dev/a21f0bc7-a5a4-417c-9eea-3e7ad1915192",
      fallbackToCacheTimeout: 0,
    },

    assetBundlePatterns: ["**/*"],

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.odanet.app",
      buildNumber: "1",
    },

    android: {
      adaptiveIcon: {
        foregroundImage: path.resolve(__dirname, "assets/adaptive-icon.png"),
        backgroundColor: "#00A6A6",
      },
      package: "com.odanet.app",
      versionCode: 1,
      permissions: ["INTERNET", "ACCESS_NETWORK_STATE"],
      softwareKeyboardLayoutMode: "pan",
    },

    web: {
      favicon: path.resolve(__dirname, "assets/favicon.png"),
      bundler: "metro",
    },

    extra: {
      eas: {
        projectId: "a21f0bc7-a5a4-417c-9eea-3e7ad1915192",
      },
      apiBaseUrl: "https://www.odanet.com.tr/api",
    },

    plugins: [
      "expo-router",
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
    ],

    runtimeVersion: {
      policy: "sdkVersion",
    },
  },
};
