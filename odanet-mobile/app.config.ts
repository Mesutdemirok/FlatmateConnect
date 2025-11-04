export default {
  expo: {
    name: "Odanet",
    slug: "odanet",
    scheme: "odanet",
    newArchEnabled: true,
    plugins: ["expo-router"],
    extra: {
      apiUrl: "https://www.odanet.com.tr/api",
    },
  },
} as const;
