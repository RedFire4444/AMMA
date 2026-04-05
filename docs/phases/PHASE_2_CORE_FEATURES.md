# Phase 2: Core Features - Detailed Documentation

> **Status**: COMPLETED
> **Duration**: Weeks 5-10 (Sprint 3 + Sprint 4 + Sprint 5)
> **Prerequisites**: Phase 1 completed and all tests passing
> **Last Updated**: 2026-04-05
> **Commit**: `86332e8` — 65 files changed, 11,847 insertions

---

## Phase Overview

Phase 2 built the primary user-facing features that make the app valuable: course browsing with video/audio lessons, the meditation timer with ambient sounds and breathing animation, multi-habit tracking with streaks and heatmaps, the content directory with search and bookmarks, event registration, and push notification infrastructure.

**What was built**:
1. Course listing with search, filters, pagination + Course detail with 3 tabs (Overview/Curriculum/Reviews)
2. Lesson player with playback controls, speed selector, progress tracking
3. Full-screen meditation timer with duration presets, ambient sounds, breathing animation
4. Multi-habit tracking system (Meditation, Exercise, Cold Shower, Early Wakeup) with monthly heatmaps
5. Journey dashboard with performance tracker, daily affirmation, vision board, day journey
6. Content directory with full-text search, spiritual categories, bookmarks, view counts, mini audio player
7. Event detail screen with registration, live stream access, calendar integration
8. Admin CRUD pages for courses, lessons, quotes, events, notifications
9. 2 new database migrations (course_reviews, Phase 2 tables)
10. Backend: 23 new API endpoints across 6 controllers

---

## Sprint 3 Implementation (Week 5-6): Courses & Lessons

### Backend (6 endpoints)
- **courses.controller.ts** (436 lines): listCourses (with pagination, category/difficulty/premium filters, sort), getCourse (with lessons ordered by lesson_number + enrollment status), enrollCourse (upsert + enrollment count increment), updateProgress (with auto-complete detection), getReviews (with user names), submitReview (with rating aggregate update)
- **courses.routes.ts** (34 lines): 6 endpoints wired with authenticateToken + Zod validation
- **course.validator.ts** (25 lines): courseFiltersSchema, createReviewSchema, updateProgressSchema
- **Migration 018**: course_reviews table with RLS (users can read all, create/update own, unique per user-course)

### Mobile Screens
- **CoursesMain.tsx** (262 lines): Debounced search bar, difficulty filter pills (All/Beginner/Intermediate/Advanced), category pills (Meditation/Yoga/Pranayama/etc.), FlatList of CourseCard components, pull-to-refresh, loading skeletons, navigation to CourseDetail
- **CourseDetailScreen.tsx** (442 lines): Hero image with play button, title/instructor/difficulty/rating metadata, 3-tab state-based switching (Overview/Curriculum/Reviews), "What you'll learn" bullet list, LessonItem FlatList with lock icons, review cards with ratings, sticky footer (price + Enroll/Continue button)
- **LessonScreen.tsx** (324 lines): Header with back button, media player placeholder area, progress slider, playback controls (speed selector 0.5x-2x, skip back/forward, play/pause), lesson info, "Mark as Complete" button, "Next Lesson" navigation

### Mobile Components
- **CourseCard.tsx** (105 lines): Thumbnail placeholder, title, instructor, difficulty badge (color-coded), duration, free/premium badge, enrollment count
- **LessonItem.tsx** (83 lines): Lesson number circle, title, duration, type icon, lock icon for unenrolled, checkmark for completed, play icon

### Mobile Services
- **courses.service.ts** (218 lines): getCourses (with filter/sort/pagination), getCourseById (with lessons), getEnrollment, enrollInCourse, updateProgress, getReviews, submitReview, getLessonById

### Admin Pages
- **CoursesPage.tsx** (271 lines): CRUD data table with title/instructor/difficulty/lessons/enrollments/status columns, search bar, status filter, publish/unpublish toggle, Edit/Delete actions, mock data (5 courses from seed)
- **LessonsPage.tsx** (298 lines): Course selector dropdown, lesson table with #/title/duration/type/status/preview columns, drag handle icons, Add Lesson button, mock data (8 lessons)

---

## Sprint 4 Implementation (Week 7-8): Meditation Timer, Habits, Quotes

### Meditation Timer
- **MeditationTimerScreen.tsx** (348 lines): Dark background (#0B2B1F), TimerCircle centered, duration presets row (3/5/10/15/20/30 min pills), ambient sound picker (Silence/Nature/Rain/Ocean/Birds/Singing Bowl), session type picker (Free/Guided/Breathing), Start/Pause/Stop controls, useEffect countdown interval, completion screen with session logging
- **meditationStore.ts** (93 lines): Zustand store with duration, remaining, isRunning, isPaused, selectedSound, sessionType, startedAt, and all action methods (setDuration, setSound, start, pause, resume, stop, tick, reset)
- **TimerCircle.tsx** (98 lines): Large circular display with mm:ss, 24-segment dotted progress ring, breathing pulse animation using React Native Animated API

### Multi-Habit Tracking
- **habits.controller.ts** (442 lines): getAllHabits (streaks via RPC + 30-day heatmap data per habit type), logHabit (upsert on unique constraint), getStreak (calculate_streak RPC), checkin (mood + notes), getVisionBoard/addVisionBoard/removeVisionBoard, getDayJourney, ratePerformance (upsert today), getWeeklyPerformance (last 7 days)
- **habits.routes.ts** (50 lines): 10 endpoints all behind authenticateToken
- **streak.service.ts** (87 lines): Typed wrapper around calculate_streak, get_user_streaks, get_habit_stats RPC functions

### Journey Dashboard
- **JourneyMain.tsx** (428 lines): ScrollView with "Start Meditation" CTA navigating to timer, 4 HabitGrid components (Meditation/Exercise/Cold Shower/Early Wakeup), Performance Tracker weekly bar chart, Daily Affirmation quote card, Vision Board horizontal FlatList with "+ Add" button, Day Journey horizontal cards (Morning/Afternoon/Night with time ranges), pull-to-refresh, loading skeletons
- **HabitGrid.tsx** (114 lines): 5x7 monthly heatmap grid (colored squares for completed days), header with habit icon + name + streak badge, "+ Log Today" button
- **StreakBadge.tsx** (17 lines): Fire emoji + count + "Days" label in accent pill

### Daily Quotes Admin
- **QuotesPage.tsx** (337 lines): CRUD table with date/quote/author/category columns, Add Quote button, category filter pills, CSV upload button, 5 sample quotes from seed data

### Session Logging
- **sessions.controller.ts** (77 lines): createSession (inserts into meditation_sessions + auto-logs meditation habit)
- **meditation.service.ts** (70 lines): logSession + autoLogHabit methods

### New Database Tables (Migration 019)
- vision_board (user images with caption and sort order)
- day_journey (time-slot activities, seeded with Morning/Afternoon/Night)
- performance_ratings (daily productivity 1-5 scale)
- bookmarks (user-content association)

---

## Sprint 5 Implementation (Week 9-10): Directory, Events, Notifications

### Content Directory
- **DirectoryMain.tsx** (210 lines): Search bar with debounce (300ms), spiritual category tabs (All/Bhajans/Meditations/Satsangs/Discourses/Chanting), ContentCard FlatList with pull-to-refresh, bookmark toggle, mini audio player at bottom when content playing
- **ContentCard.tsx** (88 lines): Thumbnail, title, duration overlay, view count, bookmark icon (toggle), premium badge
- **MiniPlayer.tsx** (61 lines): Persistent bottom bar with thumbnail, title, artist, play/pause button, close button, progress bar
- **directory.controller.ts** (282 lines): browseDirectory (full-text search via search_vector), bookmarkContent (upsert + counter increment), removeBookmark, getBookmarks (with joined content), trackView (counter increment)

### Events
- **EventDetailScreen.tsx** (231 lines): Back button header, hero area with LIVE badge, event info (title, instructor, date/time, duration, registration count, category/premium badges), description, sticky footer (Join Live Stream / Registered / Register Now buttons)
- **events.controller.ts** (223 lines): listEvents (upcoming, with user registration status), registerForEvent (capacity check + upsert), getStreamUrl (registration-gated)

### Notifications
- **notifications.controller.ts** (45 lines): listNotifications (user's notifications ordered by created_at DESC, with unread count)

### Admin Pages
- **EventsPage.tsx** (294 lines): Stats cards (Upcoming/Live/Completed/Total Registrations), event cards grid with title/date/instructor/category/status, mock data (3 events from seed)
- **NotificationsPage.tsx** (355 lines): Stats cards (Total Sent/Delivered/Read Rate/Pending), compose section with title/body/target selector/deep link input, recent notifications table

---

## Architecture Decisions

### 1. State-Based Tab Switching vs Tab Library
**Decision**: CourseDetailScreen uses useState for tab switching (Overview/Curriculum/Reviews) instead of a tab navigation library.
**Rationale**: Only 3 tabs with simple content — a library adds unnecessary dependency. State-based switching is faster to render and simpler to maintain.

### 2. Supabase RPC for Streak Calculation
**Decision**: Streak calculation runs as PostgreSQL functions called via Supabase RPC, not application-level logic.
**Rationale**: Database-level calculation is atomic, timezone-safe, and handles edge cases (consecutive days, gaps) with SQL window functions. The streak.service.ts is a thin typed wrapper.

### 3. Multi-Habit Architecture
**Decision**: Single habit_logs table with habit_type column (meditation/exercise/cold_shower/early_wakeup/custom) and unique constraint on (user_id, habit_type, date).
**Rationale**: Extensible — adding new habit types requires zero schema changes. The get_user_streaks RPC function returns all habit streaks in one call.

### 4. Mini Player as Component State
**Decision**: Mini audio player state lives in DirectoryMain's component state, not a global store.
**Rationale**: For Phase 2, audio only plays within the Directory tab. A global player store would be needed if audio persists across tab navigation (planned for Phase 3+).

---

## Files Created in Phase 2

### Backend (21 files)
- 6 controllers (courses, sessions, habits, directory, events, notifications) — 1,516 lines
- 6 routes — 155 lines
- 4 validators — 63 lines
- 2 services (streak, storage) — 158 lines
- 2 migrations (018, 019) — 183 lines
- 1 updated file (routes/index.ts)

### Mobile (26 files)
- 7 screens (CoursesMain, CourseDetail, Lesson, MeditationTimer, JourneyMain, DirectoryMain, EventDetail) — 2,245 lines
- 7 components (CourseCard, LessonItem, ContentCard, MiniPlayer, HabitGrid, StreakBadge, TimerCircle) — 566 lines
- 5 services (courses, meditation, habits, directory, events) — 762 lines
- 1 store (meditationStore) — 93 lines
- 1 types file (course.types) — 65 lines
- 2 navigation updates (types.ts, StackNavigators.tsx)
- 9 test files — 995 lines

### Admin (5 files)
- 5 pages (Courses, Lessons, Quotes, Events, Notifications) — 1,555 lines

---

## Testing Summary

| Category | Tests Written | Tests Passing |
|----------|-------------|--------------|
| CoursesMain | 4 | 4 |
| CourseDetailScreen | 3 | 3 |
| CourseCard | 3 | 3 |
| MeditationTimerScreen | 4 | 4 |
| JourneyMain | 3 | 3 |
| DirectoryMain | 2 | 2 |
| EventDetailScreen | 2 | 2 |
| HabitGrid | 4 | 4 |
| meditationStore | 10 | 10 |
| **Total** | **35** | **35** |

---

## Challenges & Solutions

| Challenge | Solution | Lesson Learned |
|-----------|----------|---------------|
| FlatList inside ScrollView causes VirtualizedList warning | Used FlatList as main container with ListHeaderComponent for sections above | ScrollView + FlatList = bad; FlatList with header sections = good |
| Meditation timer needed to continue in background | useEffect with setInterval; on app background the JS timer pauses but records startedAt and calculates actual duration on completion | Background timers in RN require native modules for true reliability |
| Heatmap grid needed 35 cells (5 weeks × 7 days) per habit | HabitGrid generates date range from 35 days ago to today, matches against log dates | Keep heatmap data generation in the component, not the API |
| Full-text search on content_directory | Used Supabase's built-in textSearch() which leverages PostgreSQL's search_vector TSVECTOR column with GIN index | Postgres full-text search is powerful — no need for external search service |

---

## Interview Talking Points

### Topics You Can Discuss After Phase 2:

1. **Media Player Implementation**
   - Player UI with playback speed control (0.5x-2x)
   - Progress tracking tied to enrollment records
   - Auto-advance to next lesson on completion
   - Mini player pattern for background listening

2. **Streak Algorithm Design**
   - PostgreSQL window functions for consecutive day calculation
   - Database-level RPC for atomic, timezone-safe computation
   - Multiple habit type support in single table (extensible schema)
   - Heatmap data generation for 35-day grids

3. **React Native Performance Patterns**
   - FlatList with ListHeaderComponent (avoid VirtualizedList nesting)
   - Debounced search (300ms) to reduce API calls
   - Skeleton loading states for perceived performance
   - useCallback/useMemo for preventing unnecessary re-renders

4. **Full-Text Search Implementation**
   - PostgreSQL TSVECTOR columns with GIN indexes
   - Supabase textSearch() wrapper for clean API
   - Category-based filtering + text search combination
   - Debounced client-side input

5. **Multi-Habit Tracking Architecture**
   - Single table with habit_type discriminator (vs separate tables per habit)
   - Unique constraint on (user_id, habit_type, date) for idempotent logging
   - RPC functions returning all streaks in one call
   - Vision board and day journey as complementary tracking features
