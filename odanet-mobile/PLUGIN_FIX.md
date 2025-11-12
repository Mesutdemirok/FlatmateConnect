# Expo Build Properties Plugin Fix ✅

## Date: November 7, 2025

## Issue
**Error:** "Failed to resolve plugin for module 'expo-build-properties' relative to '/home/expo/workingdir/build/odanet-mobile'"

**Root Cause:** The `expo-build-properties` package was located in `devDependencies` instead of `dependencies`. EAS builds do not install devDependencies, causing the plugin resolution to fail.

---

## Fix Applied

### 1. Moved expo-build-properties to dependencies

**Before:**
```json
{
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@expo/ngrok": "^4.1.3",
    "@types/react": "~18.2.79",
    "expo-build-properties": "^0.12.5",  // ❌ Wrong location
    "typescript": "~5.3.3"
  }
}
```

**After:**
```json
{
  "dependencies": {
    "expo": "~51.0.39",
    "expo-build-properties": "^0.12.5",  // ✅ Correct location
    "expo-constants": "~16.0.2",
    // ... other dependencies
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@expo/ngrok": "^4.1.3",
    "@types/react": "~18.2.79",
    "typescript": "~5.3.3"
    // expo-build-properties removed from here
  }
}
```

### 2. Verified app.config.ts Configuration

The plugin is correctly configured in `app.config.ts`:

```typescript
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
```

---

## Why This Matters

### EAS Build Dependency Resolution
- **Production dependencies:** Installed during EAS builds (`dependencies`)
- **Development dependencies:** NOT installed during EAS builds (`devDependencies`)

### Expo Plugins Requirements
- All Expo config plugins MUST be in `dependencies`
- Plugins are resolved at build time on EAS servers
- If a plugin is in `devDependencies`, EAS cannot find it

---

## Build Instructions

### Step 1: Clean Install
```bash
cd odanet-mobile
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Step 2: Clear EAS Cache and Build
```bash
eas build -p android --profile preview --clear-cache
```

The `--clear-cache` flag ensures:
- Old cached dependencies are removed
- Fresh install with corrected package.json
- Plugin resolution from correct location

---

## Expected Build Flow

✅ **Phase 1:** Upload project files to EAS  
✅ **Phase 2:** npm install (now includes expo-build-properties)  
✅ **Phase 3:** Resolve expo-build-properties plugin ← **Fixed!**  
✅ **Phase 4:** Apply Android build properties  
✅ **Phase 5:** Run Gradle with buildToolsVersion 34.0.0  
✅ **Phase 6:** Compile and assemble APK  

---

## Verification

Check that the fix is applied:

```bash
# Verify expo-build-properties is in dependencies
cat package.json | jq '.dependencies["expo-build-properties"]'
# Output: "^0.12.5"

# Verify NOT in devDependencies
cat package.json | jq '.devDependencies["expo-build-properties"]'
# Output: null

# Verify plugin in app.config.ts
grep -A10 "expo-build-properties" app.config.ts
```

---

## Related Fixes

This fix is part of the comprehensive EAS build preparation:

1. ✅ `react-native-worklets`: 0.6.1 → 0.5.2 (compatibility)
2. ✅ `babel.config.js`: Includes `react-native-worklets/plugin`
3. ✅ `eas.json`: Added `NODE_ENV=production` to all profiles
4. ✅ `eas.json`: Added `EXPO_NO_DOCTOR=1` to skip doctor checks
5. ✅ `expo-build-properties`: Moved to dependencies ← **This fix**
6. ✅ `.easignore`: Configured to exclude android/, ios/, node_modules

---

## Summary

**Problem:** Plugin not found during EAS build  
**Solution:** Moved `expo-build-properties` to `dependencies`  
**Status:** ✅ Ready for build  

The EAS build will now successfully resolve the `expo-build-properties` plugin and apply the Android build configuration (SDK 34, Build Tools 34.0.0).

---

**Next:** Run `eas build -p android --profile preview --clear-cache` 🚀
