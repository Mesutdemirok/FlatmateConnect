# 🚀 Güvenli Deployment Rehberi - email_verified_at Kolonu

## ✅ MEVCUT DURUM: GÜVENLİ

### Database Durumu (Production)
```
Column: email_verified_at
Type: timestamp without time zone
Nullable: YES ✓
```

**Kullanıcı Verileri:**
- 19 kullanıcı mevcut
- Tümü korunuyor (verified=false, count=19)
- HİÇBİR DROP COLUMN işlemi YOK

### Kod Şeması (shared/schema.ts:36)
```typescript
emailVerifiedAt: timestamp("email_verified_at"), // Nullable by default ✓
```

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ 1. Schema Doğrulaması
```bash
# Kod şemasında email_verified_at var mı?
grep -n "email_verified_at" shared/schema.ts
# ✓ Line 36: emailVerifiedAt: timestamp("email_verified_at")
```

### ✅ 2. Database Senkronizasyonu
```sql
-- Development database'de kolon var mı?
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'email_verified_at';
-- ✓ email_verified_at | YES
```

### ✅ 3. Drizzle Push Kontrolü
```bash
npm run db:push -- --verbose
```
**Beklenen Çıktı:** `email_verified_at` için değişiklik YOK

**UYARI:** Eğer "DROP COLUMN email_verified_at" görürseniz → DURDUR ve kontrol et!

---

## 🔒 GÜVENLI DEPLOYMENT ADIMLARI

### Adım 1: Son Doğrulama (Development)

```bash
# Test 1: Schema kontrolü
npm run db:push

# Test 2: OAuth akışı testi
# Browser'da /giris → Google ile giriş → /profil'e düşmeli
```

### Adım 2: Build Testi
```bash
# Production build oluştur
npm run build

# Hata olup olmadığını kontrol et
echo "Build status: $?"
```

### Adım 3: Deploy Config Kontrolü
**.replit dosyası:**
```toml
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]
```

### Adım 4: Deployment
Replit UI'da **"Deploy"** butonuna bas.

**İzlenecek Loglar:**
```
✅ Build başarılı
✅ Database connection OK
✅ Server running on port 5000
```

---

## 🧪 POST-DEPLOYMENT DOĞRULAMA

### 1. Database Kontrolü (Production)
```sql
-- Kolon hala var mı?
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'email_verified_at';

-- Kullanıcı verileri korundu mu?
SELECT COUNT(*) FROM users;
-- Beklenen: 19+ (önceki + yeniler)

-- Verified kullanıcı sayısı
SELECT email_verified_at IS NOT NULL AS verified, COUNT(*)
FROM users
GROUP BY verified;
```

### 2. OAuth Akış Testi
1. Production URL'e git: `https://[your-app].replit.app/giris`
2. "Google ile devam et" butonuna tıkla
3. Google OAuth tamamla
4. **Beklenen:** `/profil` sayfasına yönlendir
5. **Kontrol:** Kullanıcı oturumu açık mı?

### 3. API Endpoint Testleri
```bash
# Public endpoints
curl https://[your-app].replit.app/api/listings?limit=3

# Health check
curl https://[your-app].replit.app/api/health
```

---

## ⚠️ SORUN GİDERME

### Senaryo 1: "email_verified_at does not exist" Hatası
**Neden:** Drizzle schema ve database senkronize değil

**Çözüm:**
```bash
# Development'ta:
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at timestamp;

# Production'da:
# Replit Console → SQL editor → yukarıdaki komutu çalıştır
```

### Senaryo 2: OAuth Callback 404
**Neden:** `/auth/callback` route kayıtlı değil

**Kontrol:**
```bash
grep -n "auth/callback" client/src/App.tsx
# ✓ Line 70: <Route path="/auth/callback" component={AuthCallback} />
```

### Senaryo 3: Google Sonrası Sonsuz Loading
**Neden:** JWT cookie set edilmiyor veya refreshUser çalışmıyor

**Log Kontrolü:**
```bash
# Server logs'da ara:
"✅ JWT token generated for user"
"🔄 Redirecting to frontend"
```

---

## 📊 KABUL KRİTERLERİ

### ✅ Deployment Başarılı Sayılır:

- [ ] **Database:** `email_verified_at` kolonu var (nullable)
- [ ] **Kullanıcılar:** Tüm mevcut kullanıcılar korundu
- [ ] **OAuth:** Google sign-in/sign-up → `/profil` yönlendirir
- [ ] **Public API:** `/api/listings` misafir kullanıcılara 200 döner
- [ ] **No Errors:** Server logs'da critical error yok

### ❌ Deployment Geri Alınmalı:

- [ ] `ALTER TABLE "users" DROP COLUMN "email_verified_at"` görüldü
- [ ] Kullanıcı sayısı azaldı (19'dan az)
- [ ] OAuth callback 404 veriyor
- [ ] Critical database error

---

## 🎯 ÖNEMLİ NOTLAR

1. **Migration Yöntemi:** Bu proje `drizzle-kit push` kullanıyor (dosya tabanlı migration YOK)
2. **Güvenli Değişiklik:** `email_verified_at` zaten var, hiçbir DROP işlemi olmayacak
3. **Backward Compatible:** Nullable kolon olduğu için mevcut data etkilenmiyor
4. **Rollback Plan:** Eğer sorun çıkarsa, Replit'te önceki deployment'a dön

---

## 📝 SON KONTROL LİSTESİ

```bash
# 1. Schema doğru mu?
✅ shared/schema.ts:36 → emailVerifiedAt: timestamp("email_verified_at")

# 2. Database'de var mı?
✅ Production: SELECT * FROM information_schema.columns WHERE column_name='email_verified_at'

# 3. OAuth route kayıtlı mı?
✅ client/src/App.tsx:70 → <Route path="/auth/callback" ...>

# 4. Environment variables set mi?
✅ GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, JWT_SECRET

# 5. Build başarılı mı?
✅ npm run build → Success

# DEPLOYMENT HAZIR! 🚀
```
