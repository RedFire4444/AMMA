# Phase 2: Core Features - Detailed Documentation

> **Status**: COMPLETED
> **Duration**: Weeks 5-10 (Sprint 3 + Sprint 4 + Sprint 5)
> **Prerequisites**: Phase 1 completed and all tests passing
> **Last Updated**: 2026-04-05
> **Commit**: Phase 2 implementation — ~65 files, ~6,000+ LOC
> **Last Updated**: -

---

## Phase Overview

Phase 2 builds the primary user-facing features that make the app valuable: course browsing and video/audio playback, the meditation timer with ambient sounds, the habit tracking and streak system, the content directory, events, and push notifications. The admin panel gets full content management capabilities.

**By the end of Phase 2, a user can**:
1. Browse and filter courses by difficulty and category
2. Enroll in a course and watch/listen to lessons with progress tracking
3. Use the meditation timer with ambient sounds
4. See their meditation streak and journey stats
5. Read today's spiritual quote
6. Browse the content directory with search
7. View and register for upcoming events
8. Receive push notifications

**Admin can**:
1. Create, edit, delete, and publish courses
2. Upload lesson media (video/audio) to cloud storage
3. Manage daily quotes (CRUD + bulk upload)
4. Create and manage events
5. Send push notifications (broadcast + targeted)

---

## Sprint 3 Deliverables (Week 5-6): Courses & Lessons

### Mobile App
- [ ] CoursesScreen with grid/list view toggle
- [ ] Filter pills (difficulty, category, free/premium)
- [ ] Sort options (popular, newest, duration)
- [ ] Infinite scroll pagination
- [ ] CourseDetailScreen with hero image, description, lesson list
- [ ] Enrollment flow with "Enroll" / "Continue" button
- [ ] Progress bar on enrolled courses
- [ ] LessonScreen with video player (react-native-video v6+)
- [ ] LessonScreen with audio player (react-native-track-player)
- [ ] Player controls: play/pause, seek, playback speed
- [ ] Background audio support
- [ ] Lock screen controls for audio
- [ ] Auto-advance to next lesson
- [ ] Progress update on lesson completion
- [ ] CourseCard reusable component
- [ ] LessonItem reusable component

### Backend API
- [ ] GET /api/courses - Pagination, filters, sorting
- [ ] GET /api/courses/:id - Detail with lessons array
- [ ] POST /api/courses/:id/enroll - Create enrollment
- [ ] PATCH /api/enrollments/:id/progress - Update progress

### React Query Hooks
- [ ] useCourses(filters) - Paginated list
- [ ] useCourse(id) - Single course with lessons
- [ ] useEnrollment(courseId) - User's enrollment
- [ ] useEnrollMutation() - Enroll mutation
- [ ] useUpdateProgressMutation() - Progress update

### Admin Panel
- [ ] CoursesPage data table (sortable, filterable)
- [ ] Create/Edit course modal form
- [ ] Publish/unpublish toggle
- [ ] Delete with confirmation dialog
- [ ] LessonsPage nested under course
- [ ] Lesson create/edit modal with media upload
- [ ] Lesson reordering (drag-and-drop)
- [ ] Media upload to Cloudflare R2

---

## Sprint 4 Deliverables (Week 7-8): Meditation, Habits, Quotes

### Meditation Timer
- [ ] Full-screen meditation UI (dark gradient background)
- [ ] Large circular timer display (mm:ss)
- [ ] Breathing animation (pulsing circle)
- [ ] Duration presets: 3, 5, 10, 15, 20, 30 min + custom
- [ ] Ambient sound picker: Nature, Rain, Ocean, Birds, Singing Bowl, Silence
- [ ] Start / Pause / Stop controls
- [ ] Session type selector (Free, Guided, Breathing)
- [ ] Background timer support
- [ ] Gentle bell at session end
- [ ] Session auto-logged on completion
- [ ] meditationStore (Zustand) for timer state

### Streak & Habit Tracking
- [ ] streak.service.ts - Streak calculation logic
- [ ] PostgreSQL calculate_user_streak() function
- [ ] POST /api/sessions - Log session + update streak
- [ ] GET /api/habits/streak - Get streak + stats
- [ ] POST /api/habits/checkin - Manual daily check-in
- [ ] Nightly streak cron Edge Function
- [ ] Timezone-aware streak calculation

### Journey Dashboard
- [ ] JourneyScreen with current streak display
- [ ] Longest streak record
- [ ] 7-day calendar (dots for meditation days)
- [ ] Monthly heatmap (contribution graph)
- [ ] Stats: Total sessions, Total minutes, Average duration
- [ ] Weekly trend bar chart
- [ ] Daily check-in card with mood selector

### Daily Quotes
- [ ] Quote displayed on home screen (from /api/home/feed)
- [ ] Date-based quote matching in database
- [ ] Admin QuotesPage CRUD
- [ ] Bulk CSV upload for quotes

---

## Sprint 5 Deliverables (Week 9-10): Directory, Events, Notifications

### Content Directory
- [ ] ContentDirectoryScreen with search bar
- [ ] Debounced full-text search
- [ ] Category tabs: All, Videos, Audio, Articles
- [ ] Tag-based filtering
- [ ] Content cards with type icon, title, duration, premium badge
- [ ] Unified media player for video/audio
- [ ] Premium lock icon for free users
- [ ] GET /api/directory endpoint with search/filter/pagination

### Events
- [ ] EventsScreen with upcoming events list
- [ ] Event card: image, title, date/time, instructor, registered count
- [ ] "Register" button (idempotent)
- [ ] EventDetailScreen with full info
- [ ] "Add to Calendar" integration
- [ ] "Join Live" button for live events
- [ ] GET /api/events endpoint
- [ ] POST /api/events/:id/register endpoint
- [ ] GET /api/events/:id/stream endpoint
- [ ] Admin EventsPage CRUD

### Push Notifications
- [ ] Firebase project created
- [ ] @react-native-firebase/messaging installed
- [ ] APNs configured (iOS)
- [ ] FCM configured (Android)
- [ ] Permission request on app launch
- [ ] FCM token stored in user profile
- [ ] firebase-admin SDK in backend
- [ ] Notification types: reminder, streak, event, content
- [ ] Admin NotificationsPage for dispatch
- [ ] GET /api/notifications endpoint

---

## Architecture Decisions

*To be filled after implementation*

---

## Implementation Details

*To be filled after implementation with per-feature technical walkthrough*

---

## Testing Summary

| Category | Tests Written | Tests Passing | Coverage |
|----------|-------------|--------------|----------|
| Course API Tests | - | - | - |
| Enrollment Flow Tests | - | - | - |
| Player Component Tests | - | - | - |
| Timer Logic Tests | - | - | - |
| Streak Calculation Tests | - | - | - |
| Habit API Tests | - | - | - |
| Directory API Tests | - | - | - |
| Events API Tests | - | - | - |
| Notification Tests | - | - | - |
| **Total** | **-** | **-** | **-** |

---

## Challenges & Solutions

*To be filled after implementation*

---

## Interview Talking Points

### Topics You Can Discuss After Phase 2:

1. **Media Player Implementation**
   - HLS adaptive bitrate streaming for video
   - Background audio playback on iOS/Android
   - Lock screen controls integration
   - Player state management across screen transitions

2. **Streak Algorithm Design**
   - Consecutive day calculation using PostgreSQL window functions
   - Timezone-aware date boundaries
   - Nightly cron for data integrity
   - Edge cases: midnight crossover, travel between timezones

3. **React Query Caching Strategy**
   - Stale-while-revalidate for content feeds
   - Optimistic updates for enrollment/progress
   - Query invalidation patterns
   - Infinite query pagination

4. **Full-Text Search Implementation**
   - PostgreSQL full-text search vs application-level filtering
   - Debounced search input pattern
   - Search result ranking

5. **Push Notification Architecture**
   - FCM token lifecycle management
   - Notification categories and deep linking
   - Server-side notification scheduling
   - Permission request UX best practices

6. **Real-Time Features with Supabase**
   - Real-time subscriptions for live events
   - Presence tracking for live event participants
   - Optimistic UI updates

---

## Screenshots

*To be added after implementation*
