# Backend Setup Guide

## Backend Status

### ✅ Localhost Backend
- **URL:** `http://localhost:3000/api`
- **Status:** Working
- **Use for:** Local development

### ✅ Render Backend  
- **URL:** `https://project-maa.onrender.com/api`
- **Status:** Fully operational (100% tests passed)
- **Response Time:** ~218ms average
- **Use for:** Production/Testing on physical devices without adb

---

## Mobile App Configuration

### For Physical Android Device (USB + adb reverse)

1. **Setup adb reverse:**
   ```bash
   adb reverse tcp:3000 tcp:3000
   adb reverse tcp:8081 tcp:8081
   ```

2. **Update `mobile/.env`:**
   ```env
   API_BASE_URL=http://localhost:3000/api
   ```

3. **Rebuild the app:**
   ```bash
   cd mobile
   npm run android
   ```

### For Android Emulator

**Update `mobile/.env`:**
```env
API_BASE_URL=http://10.0.2.2:3000/api
```

### For iOS Simulator

**Update `mobile/.env`:**
```env
API_BASE_URL=http://localhost:3000/api
```

### For Physical Device over Wi-Fi

**Update `mobile/.env`:**
```env
API_BASE_URL=http://YOUR_LAPTOP_IP:3000/api
# Example: API_BASE_URL=http://10.98.239.179:3000/api
```

### For Production/Render Backend

**Update `mobile/.env`:**
```env
API_BASE_URL=https://project-maa.onrender.com/api
```

---

## Testing Backend

### Test Localhost Backend
```bash
curl http://localhost:3000/api/health
```

### Test Render Backend
```bash
cd MAA-Meditation-App/MAA-Project/backend
npm run test:render
```

---

## Starting Local Backend

```bash
cd MAA-Meditation-App/MAA-Project/backend
npm run dev
```

Backend will start on `http://0.0.0.0:3000` (accessible from all network interfaces)

---

## Important Notes

1. **After changing `.env` file, you MUST rebuild the React Native app** for changes to take effect
2. **adb reverse** only works when device is connected via USB
3. **Render backend** is always available and doesn't require local backend running
4. **CORS** is not needed for mobile apps (only for web browsers)

---

## Troubleshooting

### Network Error on Mobile App

1. Check if backend is running:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Verify adb reverse is set up:
   ```bash
   adb reverse --list
   ```

3. Check mobile `.env` file has correct URL

4. Rebuild the mobile app after changing `.env`

### Backend Not Starting

1. Check if port 3000 is already in use
2. Verify `.env` file exists in backend directory
3. Check Supabase credentials are set

### Render Backend Issues

Run the test script:
```bash
cd MAA-Meditation-App/MAA-Project/backend
npm run test:render
```

---

## Current Setup Summary

✅ **Backend:** Listening on `0.0.0.0:3000`
✅ **Mobile App:** Using `http://localhost:3000/api` with adb reverse
✅ **Render Backend:** `https://project-maa.onrender.com/api` (fully operational)
✅ **Auth Flow:** Fixed (RootNavigator now checks `isAuthenticated`)
✅ **Connection:** Working perfectly

---

## Quick Commands

```bash
# Start local backend
cd MAA-Meditation-App/MAA-Project/backend && npm run dev

# Setup adb reverse
adb reverse tcp:3000 tcp:3000 && adb reverse tcp:8081 tcp:8081

# Test Render backend
cd MAA-Meditation-App/MAA-Project/backend && npm run test:render

# Run mobile app
cd mobile && npm run android

# Check adb devices
adb devices

# Check adb reverse
adb reverse --list
```
