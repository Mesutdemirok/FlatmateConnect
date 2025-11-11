# 🧪 Quick Mobile App Test

## ✅ Status Check

**Expo Server**: ✅ Running on port 8081  
**QR Code**: ✅ Displayed in terminal  
**Backend API**: ✅ https://www.odanet.com.tr/api  
**Package Versions**: ✅ Fixed and compatible  

---

## 📱 3 Ways to View Your App

### Option 1: Phone (Best Experience)
```
1. Install "Expo Go" from App Store or Play Store
2. Scan QR code with Camera (iOS) or Expo Go (Android)
3. App loads automatically!
```

### Option 2: Web Browser (Quick Test)
```
Press 'w' in the terminal → Opens in browser
```

### Option 3: Tunnel (If Wi-Fi Issues)
```
Ctrl+C (stop server)
npx expo start --tunnel
Scan new QR code
```

---

## 🎯 What to Test When App Opens

✅ **Home Screen**
- See "Merhaba! 👋" welcome
- See "İlanları Gör" and "Profilim" buttons
- See latest listings (if any exist in database)

✅ **Listings Page**
- Tap "İlanları Gör" button
- Pull down to refresh
- Tap a listing card to see details

✅ **Profile Page**  
- Tap "Profilim"
- Should show login screen (if not logged in)

✅ **Login**
- Try entering email and password
- Should connect to backend API

---

## 🐛 If Something Goes Wrong

**App won't load?**
- Check phone and computer are on same Wi-Fi
- Try tunnel mode: `npx expo start --tunnel`

**Blank screen?**
- Pull down to refresh in Expo Go
- Press 'r' in terminal to reload

**Backend errors?**
- App is connecting to production: https://www.odanet.com.tr/api
- Check if backend is running

---

## 📊 Expected Results

When you open the app, you should see:
```
┌─────────────────────────┐
│   🎨 Odanet Mobile      │
├─────────────────────────┤
│                         │
│  Merhaba! 👋           │
│  Odanet'e hoş geldiniz │
│                         │
│  [🏠 İlanları Gör]     │
│  [👤 Profilim]         │
│                         │
│  Son İlanlar            │
│  ┌──────────────────┐  │
│  │ Listing Card     │  │
│  └──────────────────┘  │
│                         │
└─────────────────────────┘
```

With your brand colors:
- Primary: Turkuaz (#0EA5A7)
- Accent: Orange (#F97316)

---

**Ready to test!** Your app is waiting for you to scan the QR code 📱
