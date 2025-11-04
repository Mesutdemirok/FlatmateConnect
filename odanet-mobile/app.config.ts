export default {
  expo: {
    name: "Odanet",
    slug: "odanet",
    scheme: "odanet",
    newArchEnabled: true,
    plugins: ["expo-router"],
    extra: {
      // BURAYA kendi Laravel API adresinizi yazın
      apiUrl: "https://YOUR-LARAVEL-API-BASE",
    },
  },
} as const;
