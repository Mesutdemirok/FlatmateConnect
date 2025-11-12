# 📱 How to View Your Odanet Mobile App

## ✅ Your App is Ready!

The Expo dev server is running and showing a QR code. Here's how to see your app on your phone:

---

## 📲 Method 1: View on Your Phone (Recommended)

### Step 1: Install Expo Go App

**On iPhone:**
1. Open the **App Store**
2. Search for "**Expo Go**"
3. Install the app (it's free)

**On Android:**
1. Open the **Google Play Store**
2. Search for "**Expo Go**"
3. Install the app (it's free)

### Step 2: Scan the QR Code

**On iPhone:**
1. Open the **Camera** app (not Expo Go)
2. Point it at the QR code in your terminal
3. A notification will appear - tap it
4. Your app will open in Expo Go!

**On Android:**
1. Open the **Expo Go** app
2. Tap "**Scan QR Code**"
3. Point it at the QR code in your terminal
4. Your app will load!

### ⚠️ Important Requirements

- Your **phone** and **computer** must be on the **same Wi-Fi network**
- Make sure your computer's firewall isn't blocking port 8081
- If the QR code doesn't work, try the tunnel mode (see below)

---

## 🌐 Method 2: Use Tunnel Mode (If Same Wi-Fi Doesn't Work)

If you're having network issues:

1. **Stop the current server** (press Ctrl+C in terminal)
2. **Start with tunnel mode**:
   ```bash
   cd odanet-mobile
   npx expo start --tunnel
   ```
3. Wait for a new QR code to appear
4. Scan the new QR code with Expo Go

Tunnel mode works even if you're on different networks!

---

## 💻 Method 3: View in Web Browser

You can also test the app in your web browser:

1. With the Expo server running, press **`w`** in the terminal
2. Or open: http://localhost:8081
3. The app will open in your browser (some native features won't work)

---

## 📱 Method 4: Use Android/iOS Emulator

**Android Emulator** (requires Android Studio):
- Press **`a`** in the terminal while Expo is running

**iOS Simulator** (Mac only, requires Xcode):
- Press **`i`** in the terminal while Expo is running

---

## 🔍 What You Should See

When the app loads in Expo Go, you should see:

1. **Home Screen** with:
   - "Merhaba! 👋" welcome message
   - Quick action buttons (İlanları Gör, Profilim)
   - Latest listings

2. **Navigation**:
   - Tap "İlanları Gör" to browse all listings
   - Tap "Profilim" to see profile (will ask you to login)
   - Tap any listing card to see details

3. **Features to Test**:
   - Pull down to refresh listings
   - Tap "Tüm İlanları Gör" button
   - Try logging in (if you have test credentials)

---

## ⚡ Troubleshooting

### QR Code Won't Scan
- Make sure your phone camera has permission
- Try getting closer or farther from screen
- Make sure screen brightness is up
- Use tunnel mode: `npx expo start --tunnel`

### "Unable to Connect"
- Check both devices are on same Wi-Fi
- Restart your phone's Wi-Fi
- Restart the Expo server (Ctrl+C, then `npm start`)
- Use tunnel mode

### App Crashes or Shows Errors
- Pull down to refresh in Expo Go
- Press **`r`** in terminal to reload
- Clear Expo cache: `npx expo start --clear`

### Changes Not Showing
- Pull down to refresh in Expo Go
- Press **`r`** in terminal to reload
- Save your files again to trigger hot reload

---

## 🎯 Quick Start Checklist

- [ ] Expo Go app installed on phone
- [ ] Phone and computer on same Wi-Fi
- [ ] Expo server running (`npm start`)
- [ ] QR code scanned with Camera (iOS) or Expo Go (Android)
- [ ] App loaded successfully

---

## 📞 Current Server Status

Your server is running at:
```
exp://172.31.77.66:8081
```

You can also manually enter this URL in Expo Go if QR scanning doesn't work.

---

## 🚀 Next Steps After Viewing

Once you see the app:
1. Test browsing listings
2. Try the login flow
3. Check the profile page
4. Test pull-to-refresh
5. Verify the design matches expectations

---

**Remember**: The app is connecting to your live backend at `https://www.odanet.com.tr/api`, so all data you see is real!
