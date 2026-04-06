# MAA Meditation App - Design Updates (Post-Figma Review)

> **Date**: 2026-04-02
> **Reason**: Figma mockups reviewed — new features and layout changes identified
> **Impact**: Implementation plan, database schema, navigation structure, and user flows updated

---

## Summary of Changes

After reviewing the Figma designs, the following changes are being made to the original implementation plan. The core architecture (React Native CLI + Express + Supabase) remains unchanged. The forest green + off-white color scheme stays as planned — colors are secondary to layout and functionality.

---

## 1. Authentication — Updated

### Original Plan
- Phone OTP only (Supabase Auth + MSG91/Twilio)

### Updated Plan
- Phone OTP (primary — unchanged)
- **Email/Password login** (new — Supabase Auth supports natively)
- **Google OAuth** (new — Supabase Auth supports natively)
- Login screen shows: Phone OTP (default) + "Or use your email instead" + Google Sign-In button

### Implementation Impact
- **Backend**: No new endpoints needed — Supabase Auth handles email + Google OAuth out of the box
- **Mobile**: Login screen updated with email/Google options, auth.service.ts extended
- **Admin**: No change (admin stays email/password only)
- **Database**: No schema change — Supabase Auth manages provider linking internally

### Phase Affected: Phase 1, Sprint 1 (tasks B1.16, B1.17, F1.17, F1.19)

---

## 2. Navigation Tab Structure — Updated

### Original Plan
```
Home | Courses | Meditate | Events | Profile
```

### Updated Plan
```
My Journey | Courses | Home (center) | Directory | Profile
```

### Key Differences
| Change | Detail |
|--------|--------|
| **Home is now center tab** | Center position emphasizes home as the hub |
| **My Journey replaces Meditate tab** | Combines meditation timer + habit tracking + vision board into one journey section |
| **Directory replaces Events tab** | Content directory is a primary tab; events are accessed from Home |
| **Events moved to Home** | Live/upcoming events shown as banners on Home screen |
| **Meditation timer accessed from** | My Journey tab or Quick Start on Home screen |

### Implementation Impact
- **Mobile**: `MainTabNavigator.tsx` updated, stack navigators reorganized
- **No backend changes**

### Phase Affected: Phase 1, Sprint 1 (task F1.13)

---

## 3. My Journey — Expanded

### Original Plan
- Meditation-only habit tracking
- Single streak counter
- Monthly heatmap
- Weekly trend chart

### Updated Plan
My Journey is now a comprehensive daily sadhana tracker with multiple habits:

**Habit Trackers (heatmap grid per habit)**:
| Habit | Icon | Trackable |
|-------|------|-----------|
| Meditation | Om symbol | Yes — existing |
| Exercise | Dumbbell | Yes — new |
| Cold Shower | Water drop | Yes — new |
| Early Wakeup | Sunrise | Yes — new |
| *Custom habits* | User-defined | Yes — new |

Each habit shows:
- Monthly heatmap grid (filled = completed, empty = missed)
- Current streak badge (e.g., "12 Days")
- "+ Log Today" button

**Performance Tracker**:
- Weekly productivity line chart (self-rated 1-5 scale)

**Daily Affirmation**:
- Rotating spiritual affirmation card (replaces generic daily quote on journey)

**Vision Board**:
- User uploads inspirational images
- Grid display with "+ Add" button
- Stored in Cloudflare R2

**Day Journey** (new):
- Time-based activity suggestions throughout the day
- Morning Breathing (6:00 AM - 8:00 AM)
- Afternoon Freshness (1:00 PM - 3:00 PM)
- Night Music/Wind-down (9:00 PM - 11:00 PM)
- Tapping a Day Journey card opens the relevant content/timer

### Database Changes Required
```sql
-- Rename/expand habit_logs to support multiple habit types
ALTER TABLE public.habit_logs ADD COLUMN habit_type TEXT DEFAULT 'meditation'
  CHECK (habit_type IN ('meditation', 'exercise', 'cold_shower', 'early_wakeup', 'custom'));
ALTER TABLE public.habit_logs ADD COLUMN habit_name TEXT; -- for custom habits
ALTER TABLE public.habit_logs DROP CONSTRAINT habit_logs_user_id_log_date_key;
ALTER TABLE public.habit_logs ADD CONSTRAINT habit_logs_unique UNIQUE(user_id, log_date, habit_type);

-- New table: Vision Board
CREATE TABLE public.vision_board (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- New table: Day Journey Templates
CREATE TABLE public.day_journey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  time_slot TEXT CHECK (time_slot IN ('morning', 'afternoon', 'evening', 'night')),
  start_time TIME,
  end_time TIME,
  content_id UUID REFERENCES public.content_directory(id),
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- New table: Performance Ratings
CREATE TABLE public.performance_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating_date DATE NOT NULL,
  productivity_rating INTEGER CHECK (productivity_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, rating_date)
);
```

### New API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/habits/all | Get all habit types with streaks |
| POST | /api/habits/log | Log any habit type for today |
| GET | /api/vision-board | Get user's vision board images |
| POST | /api/vision-board | Upload vision board image |
| DELETE | /api/vision-board/:id | Remove vision board image |
| GET | /api/day-journey | Get today's day journey schedule |
| POST | /api/performance/rate | Submit daily productivity rating |
| GET | /api/performance/weekly | Get weekly performance data |

### Phase Affected: Phase 2, Sprint 4 (expanded scope)

---

## 4. Content Directory — Enhanced

### Original Plan
- Search + category tabs (Videos, Audio, Articles)
- Content cards with type, title, duration

### Updated Plan
- Search bar + filter icon (advanced filters)
- **Spiritual-specific categories**: All, Bhajans, Meditations, Satsangs, Discourses, Stories
- Content cards now show: thumbnail, title, **duration overlay**, **view count**, **bookmark icon**
- **Persistent mini audio player** at bottom when audio is playing (shows: thumbnail, title, artist, pause/play)
- Bookmark/save functionality

### Database Changes Required
```sql
-- Add view_count to content_directory (already exists, just use it)
-- Update category values
ALTER TABLE public.content_directory DROP CONSTRAINT IF EXISTS content_directory_type_check;
ALTER TABLE public.content_directory ADD CONSTRAINT content_directory_type_check
  CHECK (type IN ('video', 'audio', 'article'));

-- Update categories to spiritual-specific
-- (category column is TEXT, no constraint change needed — just use new values)

-- New table: Bookmarks
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content_directory(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_id)
);
```

### New API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/directory/:id/bookmark | Bookmark content |
| DELETE | /api/directory/:id/bookmark | Remove bookmark |
| GET | /api/directory/bookmarks | Get user's bookmarked content |
| POST | /api/directory/:id/view | Increment view count |

### Phase Affected: Phase 2, Sprint 5

---

## 5. Home Screen — Updated Layout

### Original Plan
- Greeting + notification bell
- Daily quote card
- Streak widget
- Quick start meditation button
- Trending videos carousel
- Live events banner
- Featured podcasts
- Course recommendations

### Updated Plan (matching Figma)
1. **Header**: "Good Morning/Afternoon/Evening, {Name}" + notification bell
2. **Live Event Banner**: Horizontal carousel of live/upcoming events with LIVE badge
3. **Stats Pills**: Total Time | Day Streak | (scrollable)
4. **Trending Videos**: Horizontal carousel with duration overlay
5. **Day Journey**: Horizontal cards (Morning Breathing, Afternoon Freshness, etc.)
6. **Daily Quote/Affirmation**: Amma quote card with share button
7. Events are now embedded in Home, not a separate tab

### Implementation Impact
- Home feed API returns additional data (day journey, stats pills)
- Events section integrated into home feed
- No separate Events tab needed

### Phase Affected: Phase 1 Sprint 2 (home screen), Phase 2 Sprint 5 (events embedded in home)

---

## 6. Profile Screen — Updated

### Original Plan
- Avatar, name, phone
- Stats row (3 items)
- Settings list

### Updated Plan (matching Figma)
- Avatar + Name + Level badge (Beginner/Intermediate/Advanced)
- "Edit Profile" link
- **6-card stats grid**:
  | Stat | Example |
  |------|---------|
  | Member Since | 2023 |
  | Longest Streak | 42 Days |
  | Total Duration | 120h |
  | Sessions | 342 |
  | Longest Session | 90m |
  | Monthly Progress | 85% |
- Premium upsell card (for free users)
- Settings list: Subscription, Notifications, **Invite a Friend** (new), Terms & Privacy, Helpdesk, Logout, **Delete Account** (new)

### New Features
**Invite a Friend**:
- Generate shareable deep link
- Track referrals (optional new table)

**Delete Account**:
- Required by Apple App Store guidelines
- Confirmation modal with "type DELETE to confirm"
- Backend: soft delete or hard delete with data purge

### Database Changes
```sql
-- Add level to users table
ALTER TABLE public.users ADD COLUMN level TEXT DEFAULT 'beginner'
  CHECK (level IN ('beginner', 'intermediate', 'advanced'));

-- Level calculated based on total meditation hours:
-- beginner: 0-50h, intermediate: 50-200h, advanced: 200h+
```

### New API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users/invite | Generate invite deep link |
| DELETE | /api/users/me | Delete user account + all data |

### Phase Affected: Phase 1 Sprint 2 (profile), Phase 3 Sprint 6 (invite + delete)

---

## 7. Course Detail Screen — Enhanced

### Original Plan
- Description, instructor, lesson list, enroll button

### Updated Plan (matching Figma)
- Hero image with play button overlay (video preview)
- Title, instructor avatar + name
- Rating (4.9) + review count (1.2k reviews) + duration (21 Days) + language (English)
- **Three tabs**: Overview | Curriculum | Reviews
- Overview: Description + "What you'll learn" bullet list
- Curriculum: Expandable lesson list with lock icons on premium/unenrolled lessons
- Reviews: User reviews with ratings
- **Sticky footer**: Price label (Free / $29) + "Enroll Now" button

### Database Changes
```sql
-- Add language and review_count to courses
ALTER TABLE public.courses ADD COLUMN language TEXT DEFAULT 'English';
ALTER TABLE public.courses ADD COLUMN review_count INTEGER DEFAULT 0;

-- New table: Course Reviews
CREATE TABLE public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);
```

### New API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/courses/:id/reviews | Get course reviews |
| POST | /api/courses/:id/reviews | Submit a review (enrolled users only) |

### Phase Affected: Phase 2, Sprint 3

---

## 8. Features Removed

| Feature | Reason |
|---------|--------|
| Daily Achievements (step tracker) | Removed per Navnit's decision — not core to meditation app |

---

## Complete New Database Tables Summary

| Table | Purpose | Phase |
|-------|---------|-------|
| vision_board | User's inspirational image board | Phase 2 |
| day_journey | Time-based activity templates | Phase 2 |
| performance_ratings | Daily productivity self-rating | Phase 2 |
| bookmarks | Saved/bookmarked content | Phase 2 |
| course_reviews | User reviews on courses | Phase 2 |

Total tables: 13 original + 5 new = **18 tables**

---

## Complete New API Endpoints Summary

| Method | Endpoint | Phase |
|--------|----------|-------|
| POST | /api/auth/email-login | Phase 1 |
| POST | /api/auth/google | Phase 1 |
| GET | /api/habits/all | Phase 2 |
| POST | /api/habits/log | Phase 2 |
| GET | /api/vision-board | Phase 2 |
| POST | /api/vision-board | Phase 2 |
| DELETE | /api/vision-board/:id | Phase 2 |
| GET | /api/day-journey | Phase 2 |
| POST | /api/performance/rate | Phase 2 |
| GET | /api/performance/weekly | Phase 2 |
| POST | /api/directory/:id/bookmark | Phase 2 |
| DELETE | /api/directory/:id/bookmark | Phase 2 |
| GET | /api/directory/bookmarks | Phase 2 |
| POST | /api/directory/:id/view | Phase 2 |
| GET | /api/courses/:id/reviews | Phase 2 |
| POST | /api/courses/:id/reviews | Phase 2 |
| POST | /api/users/invite | Phase 3 |
| DELETE | /api/users/me | Phase 3 |

Total endpoints: 20 original + 18 new = **38 endpoints**

---

## Updated Sprint Scope Summary

| Sprint | Original Tasks | Added Tasks |
|--------|---------------|-------------|
| Sprint 1 | Auth (OTP only) | + Email login + Google OAuth |
| Sprint 2 | Home + Profile | + Updated home layout + 6-card profile stats + level badge |
| Sprint 3 | Courses | + Reviews tab + sticky footer + "What you'll learn" |
| Sprint 4 | Meditation + Habits | + Multi-habit trackers + Vision Board + Day Journey + Performance tracker |
| Sprint 5 | Directory + Events | + Bookmarks + View counts + Mini player + Events embedded in Home |
| Sprint 6 | Payments | + Invite a Friend + Delete Account |
| Sprint 7-9 | Unchanged | No additions |

---

*This document is the authority on what changed from the original plan. All team members should review this before starting their assigned tasks.*
