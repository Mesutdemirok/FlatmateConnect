# Odanet Mobile App - Kurulum Rehberi

## 📱 Genel Bakış
React Native ve Expo ile geliştirilmiş Odanet mobil uygulaması.

## ✅ Tamamlanan Özellikler

### 1. İlanlar Ekranı (`app/(tabs)/index.tsx`)
- ✅ API'den ilan listesi çekme
- ✅ Arama özelliği (TextInput ile)
- ✅ Responsive ilan kartları
- ✅ Yükleme, hata ve boş durum yönetimi
- ✅ Aşağı çekerek yenileme

### 2. API Konfigürasyonu
- ✅ Backend API: `https://www.odanet.com.tr/api`
- ✅ Axios ile HTTP istekleri
- ✅ JWT token yönetimi (expo-secure-store)
- ✅ TanStack Query ile veri yönetimi

### 3. Placeholder Ekranlar
- ✅ Mesajlar: "Çok yakında" mesajı
- ✅ Profil: "Çok yakında" mesajı

## 🚀 Kurulum

### Bağımlılıkları Yükle
```bash
cd odanet-mobile
npm install
```

### Geliştirme Sunucusunu Başlat
```bash
npx expo start -c
```

Veya:
```bash
npm start
```

### Cihazda Test Etme

#### iOS
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Web
```bash
npm run web
```

## 📁 Dosya Yapısı

```
odanet-mobile/
├── app/                      # Ana uygulama dosyaları
│   ├── (auth)/              # Kimlik doğrulama ekranları
│   │   └── login.tsx
│   ├── (tabs)/              # Tab navigasyon ekranları
│   │   ├── index.tsx        # İlanlar listesi
│   │   ├── messages.tsx     # Mesajlar (placeholder)
│   │   ├── profile.tsx      # Profil (placeholder)
│   │   └── _layout.tsx      # Tab layout
│   └── _layout.tsx          # Ana layout
├── hooks/                    # Custom React hooks
│   ├── useListings.ts       # İlanları çeken hook
│   └── testApiConnection.ts # API bağlantı testi
├── lib/                      # Yardımcı kütüphaneler
│   ├── api.ts               # Axios instance
│   ├── auth.ts              # Auth yardımcıları
│   └── config.ts            # Konfigürasyon
├── components/               # Paylaşılan bileşenler
├── app.config.ts            # Expo konfigürasyonu
├── babel.config.js          # Babel konfigürasyonu
└── package.json             # Bağımlılıklar
```

## 🔧 Önemli Dosyalar

### `app.config.ts`
```typescript
export default {
  expo: {
    name: "Odanet",
    slug: "odanet",
    extra: {
      apiUrl: "https://www.odanet.com.tr/api",
    },
  },
};
```

### `hooks/useListings.ts`
```typescript
export function useListings(filter: ListingFilter = {}) {
  return useQuery({
    queryKey: ["listings", filter],
    queryFn: async () => {
      const { data } = await api.get("/listings", { params: filter });
      return data;
    },
  });
}
```

## 🧪 API Bağlantı Testi

API bağlantısını test etmek için:

```typescript
import { testApiConnection } from './hooks/testApiConnection';

// Uygulama başlatıldığında test et
testApiConnection();
```

## 📦 Ana Bağımlılıklar

- **Expo**: ~54.0.22
- **React Native**: 0.81.5
- **React**: 19.1.0
- **@tanstack/react-query**: Veri yönetimi
- **axios**: HTTP istekleri
- **expo-secure-store**: Token saklama
- **nativewind**: Tailwind CSS desteği

## 🎨 Styling

Uygulama **NativeWind** (Tailwind CSS for React Native) kullanıyor:

```tsx
<View className="flex-1 bg-gray-50 p-4">
  <Text className="text-2xl font-bold text-gray-900">
    Başlık
  </Text>
</View>
```

## 🔐 Kimlik Doğrulama

JWT token'lar `expo-secure-store` ile güvenli şekilde saklanıyor:

```typescript
// lib/api.ts
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🐛 Sorun Giderme

### Expo başlamıyor
```bash
# Cache'i temizle ve yeniden başlat
rm -rf .expo .expo-shared node_modules
npm install
npx expo start -c
```

### API bağlantı sorunu
1. `app.config.ts` dosyasındaki `apiUrl`'i kontrol edin
2. Backend sunucusunun çalıştığından emin olun
3. `testApiConnection()` fonksiyonunu çalıştırın

### TypeScript hataları
```bash
# node_modules'u yeniden yükle
npm install
```

## 📝 Gelecek Özellikler

- [ ] Mesajlaşma sistemi
- [ ] Profil yönetimi
- [ ] Favoriler
- [ ] Bildirimler
- [ ] Harita entegrasyonu
- [ ] Fotoğraf yükleme

## 🚢 Deployment

### EAS Build ile Production Build
```bash
# EAS CLI'yi yükle
npm install -g eas-cli

# EAS'e giriş yap
eas login

# Build oluştur
eas build --platform android
eas build --platform ios
```

## 📞 Destek

Sorularınız için: [GitHub Issues](https://github.com/your-repo/odanet-mobile/issues)
