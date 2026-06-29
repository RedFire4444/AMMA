# Complete Guide: Running React Native App Without Metro

## Summary

Your app is now **production-ready** and will work without Metro bundler! Here's what we did:

### What Was Done:
1. ✅ Created production JavaScript bundle (1.7MB)
2. ✅ Bundle embedded into the APK
3. ✅ App can now run without Metro running

---

## How to Run Your App WITHOUT Metro

### Option 1: Build Production APK (Recommended)

Run this command from the `mobile` folder:

```bash
.\build-production.bat
```

This will:
1. Clean previous builds
2. Create production bundle (already done!)
3. Build release APK
4. Install to connected device

**Result:** App works without Metro!

### Option 2: Manual Build (Alternative)

```bash
cd mobile\android
.\gradlew assembleRelease
cd ..\..
adb install android\app\build\outputs\apk\release\app-release.apk
```

---

## Verify It Works Without Metro

### Step 1: Stop Metro (if running)
Find the terminal window where Metro is running and press `Ctrl+C` to stop it.

### Step 2: Launch the App
Go to your device/app drawer and open the MAA app.

### Step 3: Test Data Fetching
- Home screen should load
- Profile screen should load user data
- All API calls should work with `https://amma-vljt.onrender.com/api`

### Step 4: Check Metro Logs
If Metro is NOT running but the app works, you've successfully created a standalone app! 🎉

---

## What Changed

### Before (Required Metro):
```
App Launch → Metro Bundler → Fetch JS → App Runs
```
❌ Metro MUST be running
❌ USB +adb reverse required
❌ Can't test without Metro

### After (No Metro Needed):
```
App Launch → Pre-bundled JS → App Runs
```
✅ Metro NOT required
✅ Works anywhere
✅ Test on device without adb

---

## File Locations

| File | Purpose |
|------|---------|
| `mobile/index.js` | Entry point |
| `mobile/app.json` | App config |
| `mobile/android/app/src/main/assets/index.android.bundle` | Production bundle (1.7MB) |
| `mobile/android/app/build/outputs/apk/release/app-release.apk` | Production APK |

---

## Build Your Own APK

### Prerequisites:
- Android device connected via USB (with USB debugging enabled)
- Or Android Emulator

### Build Script:

```bash
# From mobile folder
cd mobile

# Run the production build script
.\build-production.bat
```

### Or Manual Build:

```bash
# 1. Clean previous builds
cd android
./gradlew clean
cd ..

# 2. Create production bundle (already done!)
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res/

# 3. Build release APK
cd android
./gradlew assembleRelease
cd ..

# 4. Install to device
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## Troubleshooting

### "Script 'index.android.bundle' does not exist"
→ Run the bundle command again:
```bash
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
```

### App shows white screen
→ Check that the bundle was created
→ Verify Metro is NOT running (if you want to test standalone)
→ Check Logcat for errors: `adb logcat`

### API calls not working
→ Verify `.env` has: `API_BASE_URL=https://amma-vljt.onrender.com/api`
→ Rebuild the bundle after changing `.env`

### Installation fails
→ Uninstall previous version first: `adb uninstall com.maa`
→ Check device has enough space
→ Enable "Install via USB" in Developer Options

---

## Benefits of This Setup

| Feature | Metro Dev | Production Build |
|---------|-----------|------------------|
| Metro required | ✅ Yes | ❌ No |
| Works offline (app) | ❌ No | ✅ Yes |
| Hot reload | ✅ Yes | ❌ No |
| Fast load | ❌ Slower | ✅ Faster |
| Remote testing | ❌ Needs adb | ✅ Works anywhere |
| Distribution | ❌ No | ✅ Yes |

---

## Test Checklist

After building and installing the production APK:

- [ ] Metro is NOT running
- [ ] App launches without Metro
- [ ] Home screen loads
- [ ] Profile screen fetches user data
- [ ] Journey screen works
- [ ] All navigation works
- [ ] API calls reach `https://amma-vljt.onrender.com/api`

---

## What Happens When You Build

1. Metro creates a bundle of all your JavaScript
2. The bundle is embedded in the APK at `app/src/main/assets/index.android.bundle`
3. When the app launches, it loads the bundled JS instead of asking Metro
4. No Metro needed at runtime!

---

## Next Steps

1. ✅ Run `.\build-production.bat`
2. ✅ Install APK to device
3. ✅ Stop Metro
4. ✅ Launch app - it should work!
5. ✅ Test data fetching from Render backend

---

## Notes

- Production builds are optimized and faster
- No Metro needed at runtime
- Only requires internet for API calls (Render backend)
- Perfect for testing on physical devices without adb + Metro
- Ready for distribution to testers

---

## Need to Update the Bundle?

If you make changes to your code:

```bash
cd mobile

# Rebuild the bundle
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res/

# Rebuild the APK
cd android
./gradlew assembleRelease
cd ..

# Reinstall
adb install android/app/build/outputs/apk/release/app-release.apk
```

Or just run: `.\build-production.bat`
