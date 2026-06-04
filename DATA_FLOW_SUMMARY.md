# Data Flow Summary - MAA Meditation App

## Overview
This document describes how user data flows from Supabase → Backend API → Mobile App, ensuring that when a user logs in on any device, they see all their associated data.

---

## ✅ Fixed Data Flow

### 1. **Authentication Flow**
```
User Login → Backend /api/auth/email-login → Supabase Auth
                ↓
        Returns JWT tokens
                ↓
        Mobile stores tokens in SecureStore
                ↓
        RootNavigator checks isAuthenticated
                ↓
        Navigates to Onboarding or Main App
```

**Files involved:**
- `mobile/src/services/auth.service.ts` - API calls
- `mobile/src/store/authStore.ts` - State management
- `mobile/src/navigation/RootNavigator.tsx` - Navigation logic (FIXED: now checks `isAuthenticated` instead of `session`)

---

### 2. **Profile Data Flow**
```
ProfileMain Screen loads
        ↓
Calls userService.getProfile()
        ↓
GET /api/users/me (with JWT token)
        ↓
Backend fetches from Supabase:
  - User profile (users table)
  - Total sessions (meditation_sessions table)
  - Total duration (sum of duration_minutes)
  - Longest session (max duration_minutes)
  - Current streak (calculate_streak RPC function)
        ↓
Returns combined profile + stats
        ↓
ProfileMain displays:
  - Member Since
  - Longest Streak ✅ (from backend)
  - Total Duration ✅ (from backend)
  - Sessions ✅ (from backend)
  - Longest Session ✅ (from backend)
  - Monthly Progress ✅ (calculated from backend data)
```

**Files modified:**
- `backend/src/controllers/users.controller.ts` - Enhanced `getMe()` to fetch stats
- `mobile/src/services/user.service.ts` - Added new fields to UserProfile interface
- `mobile/src/screens/ProfileMain.tsx` - Now displays real data instead of hardcoded zeros

---

### 3. **Journey/Habits Data Flow**
```
JourneyMain Screen loads
        ↓
Calls habitsService.getAllHabits()
        ↓
GET /api/habits/all (with JWT token)
        ↓
Backend fetches from Supabase:
  - Habit logs (habit_logs table)
  - Streaks for all habits (calculate_streak RPC)
  - Heatmap data (last 30 days)
        ↓
Returns streaks + logs
        ↓
JourneyMain displays:
  - Meditation streak ✅
  - Exercise streak ✅
  - Cold Shower streak ✅
  - Early Wakeup streak ✅
  - Heatmap grids for each habit ✅
  - Performance tracker ✅
```

**Files involved:**
- `mobile/src/services/habits.service.ts` - API calls
- `mobile/src/screens/JourneyMain.tsx` - Displays habit data
- `backend/src/controllers/habits.controller.ts` - Fetches from Supabase

---

### 4. **Home Feed Data Flow**
```
HomeMain Screen loads
        ↓
Calls homeService.getHomeFeed()
        ↓
GET /api/home/feed (with JWT token)
        ↓
Backend fetches from Supabase:
  - Daily quote (daily_quotes table)
  - Trending courses (courses table)
  - Upcoming events (events table)
  - User greeting (users table)
  - Meditation streak (calculate_streak RPC)
  - Total minutes (meditation_sessions table)
        ↓
Returns aggregated feed
        ↓
HomeMain displays:
  - Personalized greeting ✅
  - Daily quote ✅
  - Total time stat ✅
  - Current streak stat ✅
  - Trending courses ✅
  - Upcoming events ✅
```

**Files involved:**
- `mobile/src/services/home.service.ts` - API calls
- `mobile/src/screens/HomeMain.tsx` - Displays feed data
- `backend/src/controllers/home.controller.ts` - Aggregates data

---

## 🔄 Cross-Device Sync

### How it works:
1. **User logs in on Device A**
   - Completes meditation session
   - Logs habit (exercise)
   - Data saved to Supabase via backend API

2. **User logs in on Device B**
   - Same email/phone credentials
   - Backend returns same user_id
   - All screens fetch data using user_id
   - Sees all data from Device A ✅

### Key Points:
- ✅ All data is stored in Supabase (single source of truth)
- ✅ Backend uses `req.user.id` from JWT token to fetch user-specific data
- ✅ Mobile app doesn't store any persistent data locally (except JWT tokens)
- ✅ Pull-to-refresh on any screen fetches latest data from backend

---

## 📊 Data Sources by Screen

| Screen | Data Source | Backend Endpoint | Supabase Tables |
|--------|-------------|------------------|-----------------|
| **ProfileMain** | User profile + stats | `GET /api/users/me` | `users`, `meditation_sessions`, `habit_logs` |
| **JourneyMain** | Habits + streaks | `GET /api/habits/all` | `habit_logs`, RPC: `calculate_streak` |
| **HomeMain** | Aggregated feed | `GET /api/home/feed` | `daily_quotes`, `courses`, `events`, `users`, `meditation_sessions` |
| **CoursesMain** | Course list | `GET /api/courses` | `courses` |
| **CourseDetail** | Course + lessons | `GET /api/courses/:id` | `courses`, `lessons`, `enrollments` |
| **DirectoryMain** | Content library | `GET /api/directory` | `content_directory` |
| **EventsMain** | Events list | `GET /api/events` | `events` |

---

## 🔐 Authentication & Authorization

### How user data is secured:
1. **JWT Token** stored in SecureStore (encrypted on device)
2. **Every API request** includes `Authorization: Bearer <token>` header
3. **Backend middleware** (`authenticateToken`) verifies token with Supabase
4. **User ID extracted** from verified token: `req.user.id`
5. **All queries filtered** by user_id to ensure users only see their own data

### Example:
```typescript
// Backend: users.controller.ts
const userId = req.user?.id; // From JWT token

// Fetch only this user's sessions
const { data } = await supabase
  .from('meditation_sessions')
  .select('*')
  .eq('user_id', userId); // ← Ensures data isolation
```

---

## 🚀 Testing Data Flow

### Test Scenario 1: New User
1. Sign up with email/password
2. Complete onboarding (interests + goal)
3. Check ProfileMain → Should show:
   - ✅ Member Since: 2026
   - ✅ All stats: 0 (no sessions yet)

### Test Scenario 2: Existing User
1. Log meditation session (15 minutes)
2. Log habit (meditation)
3. Refresh ProfileMain → Should show:
   - ✅ Sessions: 1
   - ✅ Total Duration: 0h (15 min < 1 hour)
   - ✅ Longest Streak: 1 Day
4. Refresh JourneyMain → Should show:
   - ✅ Meditation streak: 1
   - ✅ Heatmap: Today marked as completed

### Test Scenario 3: Cross-Device
1. **Device A**: Log in, complete session
2. **Device B**: Log in with same credentials
3. Check ProfileMain → Should show same session count ✅
4. Check JourneyMain → Should show same streak ✅

---

## 📝 Summary of Changes Made

### Backend Changes:
1. ✅ **`users.controller.ts`** - Enhanced `getMe()` to fetch and return:
   - `total_sessions`
   - `total_duration_minutes`
   - `longest_session_minutes`
   - `current_streak`

2. ✅ **`auth.middleware.ts`** - Fixed to use `SUPABASE_SERVICE_ROLE_KEY`

3. ✅ **`server.ts`** - Changed to listen on `0.0.0.0` (all interfaces)

### Mobile Changes:
1. ✅ **`RootNavigator.tsx`** - Fixed to check `isAuthenticated` instead of `session`

2. ✅ **`user.service.ts`** - Added new fields to `UserProfile` interface:
   - `total_duration_minutes`
   - `longest_session_minutes`

3. ✅ **`ProfileMain.tsx`** - Now fetches and displays real stats from backend

### No Changes Needed:
- ✅ `JourneyMain.tsx` - Already fetching data correctly
- ✅ `HomeMain.tsx` - Already fetching data correctly
- ✅ All service files - Already using backend API correctly

---

## ✅ Verification Checklist

- [x] User can log in and see their profile
- [x] Profile stats are fetched from backend (not hardcoded)
- [x] Journey screen shows real habit streaks
- [x] Home screen shows personalized greeting and stats
- [x] Data persists across app restarts (via backend)
- [x] Data syncs across devices (same user_id)
- [x] Pull-to-refresh updates all data
- [x] Backend uses JWT token to identify user
- [x] All queries filtered by user_id for security

---

## 🎯 Result

**All data flow is now working correctly!**

When a user logs in:
1. ✅ Backend verifies JWT token
2. ✅ Extracts user_id from token
3. ✅ Fetches all user-specific data from Supabase
4. ✅ Returns data to mobile app
5. ✅ Mobile app displays data on all screens
6. ✅ Same data visible on any device with same login

**No additional components needed - just proper data flow integration! 🚀**
