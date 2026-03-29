# MAM Meditation App - Team Work Assignments

> **Last Updated**: 2026-03-29

---

## Team Structure

### Team Lead (Code Review, Testing, Approval)
| Name | Role | Responsibilities |
|------|------|-----------------|
| **Navnit** | Team Lead | Reviews all code, runs tests, approves phase completion, manages GitHub, handles deployments |

### Backend Team
| Name | Focus Areas |
|------|------------|
| **Aayush Tolmare** | API development, database, Supabase, payment integration |
| **Krupal Warale** | API development, authentication, middleware, Edge Functions |

### Frontend Team
| Name | Focus Areas |
|------|------------|
| **Lavanya Veni** | Mobile app screens, React Native components, navigation |
| **Prachi Shirode** | Mobile app screens, meditation timer, media players |
| **Vineet Wathurkar** | Admin panel (React.js/Vite), dashboards, data tables |

---

## Workflow Per Phase

```
Frontend Team works    ──┐
                         ├──> Navnit reviews & tests ──> Phase sign-off ──> Next phase
Backend Team works     ──┘
```

**Rules**:
1. Both teams work in parallel on their assigned tasks within each sprint
2. Backend builds APIs first so frontend can integrate (API contracts agreed upfront)
3. Navnit reviews ALL pull requests before merge
4. Navnit runs the full test suite after merging
5. Phase moves forward ONLY after Navnit approves — no exceptions
6. If a blocker exists between teams, escalate to Navnit immediately

---

## Phase 1: Foundation (Weeks 1-4)

### Sprint 1 (Week 1-2)

#### Backend Team — Aayush & Krupal

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| B1.1 | Create Supabase project (dev environment) | Krupal | Not Started | — |
| B1.2 | Write all 13 database table migrations (001-013) | Aayush | Not Started | B1.1 |
| B1.3 | Write RLS policies migration (014) | Krupal | Not Started | B1.2 |
| B1.4 | Write indexes migration (015) | Aayush | Not Started | B1.2 |
| B1.5 | Write streak calculation PostgreSQL function (016) | Krupal | Not Started | B1.2 |
| B1.6 | Apply all migrations and verify in Supabase dashboard | Aayush | Not Started | B1.2-B1.5 |
| B1.7 | Write seed.sql with sample data (courses, quotes, events) | Krupal | Not Started | B1.6 |
| B1.8 | Initialize Express.js backend with TypeScript | Aayush | Not Started | — |
| B1.9 | Create middleware stack (helmet, cors, morgan, rate-limit) | Krupal | Not Started | B1.8 |
| B1.10 | Create auth middleware (JWT verification via Supabase) | Krupal | Not Started | B1.8, B1.1 |
| B1.11 | Create admin middleware (role-based access check) | Aayush | Not Started | B1.10 |
| B1.12 | Create Zod validator middleware | Aayush | Not Started | B1.8 |
| B1.13 | Create global error handler middleware | Krupal | Not Started | B1.8 |
| B1.14 | Create API response helpers (success/error envelope) | Aayush | Not Started | B1.8 |
| B1.15 | Create logger (Winston) configuration | Krupal | Not Started | B1.8 |
| B1.16 | Build POST /api/auth/request-otp endpoint | Krupal | Not Started | B1.9, B1.12 |
| B1.17 | Build POST /api/auth/verify-otp endpoint | Krupal | Not Started | B1.10, B1.12 |
| B1.18 | Write Zod validators for phone/OTP format | Aayush | Not Started | B1.12 |
| B1.19 | Implement OTP rate limiting (3 per phone per 10 min) | Aayush | Not Started | B1.9 |
| B1.20 | Create .env.example (never commit .env) | Krupal | Not Started | B1.8 |
| B1.21 | Write unit tests for auth validators | Aayush | Not Started | B1.18 |
| B1.22 | Write integration tests for auth endpoints | Krupal | Not Started | B1.16, B1.17 |

**Backend Sprint 1 Deliverable**: Working API server with auth endpoints, full database schema, RLS policies

---

#### Frontend Team — Lavanya, Prachi & Vineet

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| F1.1 | Initialize React Native CLI project with TypeScript | Lavanya | Not Started | — |
| F1.2 | Configure TypeScript strict mode + path aliases | Lavanya | Not Started | F1.1 |
| F1.3 | Set up ESLint + Prettier with project rules | Vineet | Not Started | F1.1 |
| F1.4 | Create full src/ directory structure | Lavanya | Not Started | F1.1 |
| F1.5 | Install and configure NativeWind v4 | Prachi | Not Started | F1.1 |
| F1.6 | Configure tailwind.config.js with design tokens | Prachi | Not Started | F1.5 |
| F1.7 | Add custom fonts (Inter, Playfair Display) | Prachi | Not Started | F1.1 |
| F1.8 | Create theme/index.ts with color constants | Prachi | Not Started | F1.6 |
| F1.9 | Install React Navigation v7 + dependencies | Lavanya | Not Started | F1.1 |
| F1.10 | Create navigation type definitions (types.ts) | Lavanya | Not Started | F1.9 |
| F1.11 | Build RootNavigator (auth check flow) | Lavanya | Not Started | F1.10 |
| F1.12 | Build AuthNavigator (Login > OTP > Onboarding) | Lavanya | Not Started | F1.11 |
| F1.13 | Build MainTabNavigator (5 tabs with icons) | Lavanya | Not Started | F1.11 |
| F1.14 | Build custom tab bar component (design system) | Prachi | Not Started | F1.13 |
| F1.15 | Build stack navigators (Home, Courses, Journey, Events, Profile) | Lavanya | Not Started | F1.13 |
| F1.16 | Create Supabase client config (services/supabase.ts) | Prachi | Not Started | F1.1 |
| F1.17 | Create auth.service.ts (requestOTP, verifyOTP) | Prachi | Not Started | F1.16, B1.16 |
| F1.18 | Create authStore (Zustand) — user, isAuthenticated, login/logout | Prachi | Not Started | F1.17 |
| F1.19 | Build LoginScreen (phone input, country code, send OTP) | Lavanya | Not Started | F1.12 |
| F1.20 | Build OTPScreen (6-digit input, auto-verify, resend timer) | Lavanya | Not Started | F1.19 |
| F1.21 | Integrate react-native-keychain for secure token storage | Prachi | Not Started | F1.18 |
| F1.22 | Set up GitHub Actions CI workflow (lint, type-check, test) | Vineet | Not Started | F1.3 |
| F1.23 | Set up Husky pre-commit hooks | Vineet | Not Started | F1.22 |
| F1.24 | Write component tests for LoginScreen, OTPScreen | Prachi | Not Started | F1.19, F1.20 |

**Frontend Sprint 1 Deliverable**: Working RN app with auth flow (login > OTP > redirects to main tabs), CI pipeline

---

#### Navnit (Lead) — Sprint 1 Review

| # | Review Task | Status |
|---|------------|--------|
| R1.1 | Review all backend PRs (schema, auth endpoints, middleware) | Not Started |
| R1.2 | Review all frontend PRs (RN setup, navigation, auth screens) | Not Started |
| R1.3 | Run full test suite (backend + frontend) | Not Started |
| R1.4 | Verify OTP flow end-to-end (mobile → API → Supabase) | Not Started |
| R1.5 | Verify RLS policies block unauthorized access | Not Started |
| R1.6 | Verify CI pipeline passes on test PR | Not Started |
| R1.7 | Sign off Sprint 1 | Not Started |

---

### Sprint 2 (Week 3-4)

#### Backend Team — Aayush & Krupal

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| B2.1 | Build GET /api/users/me endpoint (profile + stats) | Aayush | Not Started | B1.10 |
| B2.2 | Build PATCH /api/users/me endpoint (update profile) | Aayush | Not Started | B2.1 |
| B2.3 | Build GET /api/home/feed endpoint (aggregates all home data) | Krupal | Not Started | B1.10 |
| B2.4 | Implement avatar upload to Cloudflare R2 | Aayush | Not Started | B2.2 |
| B2.5 | Write RLS policy integration tests (full test matrix) | Krupal | Not Started | B1.3 |
| B2.6 | Write unit tests for profile validators | Aayush | Not Started | B2.1 |
| B2.7 | Write integration tests for profile and home feed APIs | Krupal | Not Started | B2.1, B2.3 |

**Backend Sprint 2 Deliverable**: Profile CRUD API, home feed aggregation API, RLS fully verified

---

#### Frontend Team — Lavanya, Prachi & Vineet

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| F2.1 | Build WelcomeScreen (onboarding step 1) | Lavanya | Not Started | F1.12 |
| F2.2 | Build InterestsScreen (category grid selector) | Lavanya | Not Started | F2.1 |
| F2.3 | Build GoalScreen (duration slider, notification toggle) | Prachi | Not Started | F2.2 |
| F2.4 | Build page indicators + skip button for onboarding | Prachi | Not Started | F2.1 |
| F2.5 | Connect onboarding to PATCH /api/users/me | Prachi | Not Started | F2.3, B2.2 |
| F2.6 | Build HomeScreen — header with greeting + notification bell | Lavanya | Not Started | F1.13 |
| F2.7 | Build QuoteCard component (Playfair Display) | Prachi | Not Started | F1.8 |
| F2.8 | Build StreakWidget component (count + 7-day dots) | Prachi | Not Started | F1.8 |
| F2.9 | Build Quick Start Meditation button | Prachi | Not Started | F2.6 |
| F2.10 | Build trending videos carousel (horizontal FlatList) | Lavanya | Not Started | F2.6 |
| F2.11 | Build live events banner (conditional display) | Lavanya | Not Started | F2.6 |
| F2.12 | Build featured podcasts section | Lavanya | Not Started | F2.6 |
| F2.13 | Add pull-to-refresh + skeleton loading to HomeScreen | Prachi | Not Started | F2.6 |
| F2.14 | Connect HomeScreen to GET /api/home/feed | Prachi | Not Started | F2.6, B2.3 |
| F2.15 | Build ProfileScreen (avatar, name, phone, stats, settings list) | Lavanya | Not Started | F1.15 |
| F2.16 | Build profile edit flow (name, avatar camera/gallery picker) | Lavanya | Not Started | F2.15, B2.2 |
| F2.17 | Initialize Vite admin project with React + TypeScript | Vineet | Not Started | — |
| F2.18 | Configure Tailwind CSS for admin with project tokens | Vineet | Not Started | F2.17 |
| F2.19 | Initialize Shadcn/UI components (Button, Input, Table, Dialog, etc.) | Vineet | Not Started | F2.18 |
| F2.20 | Build admin layout (Sidebar + Header + PageWrapper) | Vineet | Not Started | F2.19 |
| F2.21 | Set up React Router v7 with nested routes | Vineet | Not Started | F2.20 |
| F2.22 | Build admin login page (email/password via Supabase Auth) | Vineet | Not Started | F2.21 |
| F2.23 | Build protected route wrapper (redirect if not admin) | Vineet | Not Started | F2.22 |
| F2.24 | Create placeholder pages for all 10 admin sections | Vineet | Not Started | F2.21 |
| F2.25 | Write component tests for onboarding and home screen | Prachi | Not Started | F2.5, F2.14 |

**Frontend Sprint 2 Deliverable**: Onboarding flow, Home screen with live data, Profile screen, Admin panel scaffold with auth

---

#### Navnit (Lead) — Sprint 2 Review

| # | Review Task | Status |
|---|------------|--------|
| R2.1 | Review all backend PRs (profile API, home feed, RLS tests) | Not Started |
| R2.2 | Review all frontend PRs (onboarding, home, profile, admin) | Not Started |
| R2.3 | Run full test suite | Not Started |
| R2.4 | Test onboarding end-to-end (interests + goal saves to DB) | Not Started |
| R2.5 | Test home screen renders all sections with real data | Not Started |
| R2.6 | Test profile edit updates DB correctly | Not Started |
| R2.7 | Test admin login + protected routes | Not Started |
| R2.8 | **Sign off Phase 1** — write PHASE_1_FOUNDATION.md | Not Started |

---

## Phase 2: Core Features (Weeks 5-10)

### Sprint 3 (Week 5-6): Courses & Lessons

#### Backend Team — Aayush & Krupal

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| B3.1 | Build GET /api/courses (pagination, filters, sorting) | Aayush | Not Started | — |
| B3.2 | Build GET /api/courses/:id (detail with lessons array) | Aayush | Not Started | B3.1 |
| B3.3 | Build POST /api/courses/:id/enroll | Krupal | Not Started | B3.2 |
| B3.4 | Build PATCH /api/enrollments/:id/progress | Krupal | Not Started | B3.3 |
| B3.5 | Build admin course CRUD endpoints (POST, PUT, DELETE) | Aayush | Not Started | B3.1 |
| B3.6 | Build admin lesson CRUD endpoints with media upload to R2 | Krupal | Not Started | B3.5 |
| B3.7 | Build storage.service.ts (Cloudflare R2 upload/signed URLs) | Krupal | Not Started | — |
| B3.8 | Write Zod validators for course/lesson payloads | Aayush | Not Started | B3.1 |
| B3.9 | Write unit + integration tests for course APIs | Aayush | Not Started | B3.1-B3.4 |
| B3.10 | Write integration tests for admin course/lesson APIs | Krupal | Not Started | B3.5, B3.6 |

---

#### Frontend Team — Lavanya, Prachi & Vineet

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| F3.1 | Build CourseCard reusable component | Prachi | Not Started | — |
| F3.2 | Build CoursesScreen (grid/list toggle, filter pills, sort) | Lavanya | Not Started | F3.1 |
| F3.3 | Add infinite scroll pagination to CoursesScreen | Lavanya | Not Started | F3.2, B3.1 |
| F3.4 | Build CourseDetailScreen (hero, description, lesson list, enroll) | Lavanya | Not Started | F3.2, B3.2 |
| F3.5 | Build LessonItem reusable component | Prachi | Not Started | — |
| F3.6 | Build LessonScreen — video player (react-native-video v6) | Prachi | Not Started | F3.5 |
| F3.7 | Build LessonScreen — audio player (react-native-track-player) | Prachi | Not Started | F3.6 |
| F3.8 | Add playback controls (play/pause, seek, speed 0.5x-2x) | Prachi | Not Started | F3.6, F3.7 |
| F3.9 | Add background audio + lock screen controls | Prachi | Not Started | F3.7 |
| F3.10 | Add auto-advance to next lesson on completion | Prachi | Not Started | F3.8 |
| F3.11 | Create React Query hooks (useCourses, useCourse, useEnrollment) | Lavanya | Not Started | B3.1-B3.4 |
| F3.12 | Connect enrollment + progress update to API | Lavanya | Not Started | F3.11 |
| F3.13 | Build admin CoursesPage (data table, create/edit modal, publish) | Vineet | Not Started | B3.5 |
| F3.14 | Build admin LessonsPage (CRUD, media upload, drag-reorder) | Vineet | Not Started | B3.6 |
| F3.15 | Write component tests for CourseCard, LessonItem, player | Prachi | Not Started | F3.1, F3.5 |

---

#### Navnit (Lead) — Sprint 3 Review

| # | Review Task | Status |
|---|------------|--------|
| R3.1 | Review backend course/lesson APIs | Not Started |
| R3.2 | Review frontend course screens and player | Not Started |
| R3.3 | Review admin course/lesson management | Not Started |
| R3.4 | Test full flow: browse → enroll → play → progress updates | Not Started |
| R3.5 | Test video playback (streaming, seek, speed) | Not Started |
| R3.6 | Test audio background playback + lock screen | Not Started |
| R3.7 | Test admin course/lesson CRUD + media upload | Not Started |
| R3.8 | Run full test suite | Not Started |
| R3.9 | Sign off Sprint 3 | Not Started |

---

### Sprint 4 (Week 7-8): Meditation Timer, Habits, Quotes

#### Backend Team — Aayush & Krupal

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| B4.1 | Build POST /api/sessions (log meditation session) | Aayush | Not Started | — |
| B4.2 | Build streak.service.ts (streak calculation logic) | Krupal | Not Started | — |
| B4.3 | Implement calculate_user_streak() PostgreSQL function | Krupal | Not Started | B4.2 |
| B4.4 | Build GET /api/habits/streak (streak + stats) | Aayush | Not Started | B4.2 |
| B4.5 | Build POST /api/habits/checkin (daily check-in with mood) | Aayush | Not Started | B4.2 |
| B4.6 | Build nightly streak cron Edge Function (streak-reset/) | Krupal | Not Started | B4.3 |
| B4.7 | Add timezone-aware date handling to streak logic | Krupal | Not Started | B4.2 |
| B4.8 | Build admin quote CRUD endpoints | Aayush | Not Started | — |
| B4.9 | Build bulk CSV quote import endpoint | Aayush | Not Started | B4.8 |
| B4.10 | Write unit tests for streak calculation (>95% coverage) | Krupal | Not Started | B4.2 |
| B4.11 | Write integration tests for session, habit, quote APIs | Aayush | Not Started | B4.1, B4.4, B4.8 |

---

#### Frontend Team — Lavanya, Prachi & Vineet

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| F4.1 | Build MeditationTimerScreen (full-screen, dark gradient) | Prachi | Not Started | — |
| F4.2 | Build circular timer display (mm:ss) | Prachi | Not Started | F4.1 |
| F4.3 | Build breathing animation (pulsing circle) | Prachi | Not Started | F4.1 |
| F4.4 | Build duration preset selector (3, 5, 10, 15, 20, 30 min) | Prachi | Not Started | F4.1 |
| F4.5 | Build ambient sound picker (Nature, Rain, Ocean, etc.) | Prachi | Not Started | F4.1 |
| F4.6 | Implement background timer (works when app backgrounded) | Prachi | Not Started | F4.2 |
| F4.7 | Add gentle bell sound at session end | Prachi | Not Started | F4.6 |
| F4.8 | Create meditationStore (Zustand) for timer state | Prachi | Not Started | F4.1 |
| F4.9 | Connect session completion to POST /api/sessions | Prachi | Not Started | F4.6, B4.1 |
| F4.10 | Build JourneyScreen — streak display (large number + visual) | Lavanya | Not Started | — |
| F4.11 | Build 7-day calendar dots component | Lavanya | Not Started | F4.10 |
| F4.12 | Build monthly heatmap (contribution graph) | Lavanya | Not Started | F4.10 |
| F4.13 | Build stats row (total sessions, minutes, avg duration) | Lavanya | Not Started | F4.10 |
| F4.14 | Build weekly trend bar chart | Lavanya | Not Started | F4.10 |
| F4.15 | Build daily check-in card with mood selector | Lavanya | Not Started | F4.10 |
| F4.16 | Connect JourneyScreen to GET /api/habits/streak | Lavanya | Not Started | F4.10, B4.4 |
| F4.17 | Connect check-in to POST /api/habits/checkin | Lavanya | Not Started | F4.15, B4.5 |
| F4.18 | Build admin QuotesPage (data table, CRUD, CSV upload) | Vineet | Not Started | B4.8 |
| F4.19 | Write component tests for timer, journey dashboard | Lavanya | Not Started | F4.10, F4.1 |

---

#### Navnit (Lead) — Sprint 4 Review

| # | Review Task | Status |
|---|------------|--------|
| R4.1 | Review backend session, habit, streak, quote APIs | Not Started |
| R4.2 | Review frontend meditation timer | Not Started |
| R4.3 | Review frontend journey dashboard | Not Started |
| R4.4 | Test timer: countdown, background, bell, session logged | Not Started |
| R4.5 | Test streak: consecutive days, missed day, reset | Not Started |
| R4.6 | Test journey stats match database records | Not Started |
| R4.7 | Test admin quote CRUD + CSV upload | Not Started |
| R4.8 | Verify streak calculation has >95% test coverage | Not Started |
| R4.9 | Run full test suite | Not Started |
| R4.10 | Sign off Sprint 4 | Not Started |

---

### Sprint 5 (Week 9-10): Directory, Events, Notifications

#### Backend Team — Aayush & Krupal

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| B5.1 | Build GET /api/directory (search, filters, pagination) | Aayush | Not Started | — |
| B5.2 | Implement full-text search on content_directory table | Aayush | Not Started | B5.1 |
| B5.3 | Build GET /api/events (list upcoming, sorted by date) | Krupal | Not Started | — |
| B5.4 | Build POST /api/events/:id/register (idempotent) | Krupal | Not Started | B5.3 |
| B5.5 | Build GET /api/events/:id/stream (registered users only) | Krupal | Not Started | B5.4 |
| B5.6 | Set up firebase-admin SDK for FCM push | Aayush | Not Started | — |
| B5.7 | Build notification.service.ts (send push via FCM) | Aayush | Not Started | B5.6 |
| B5.8 | Build GET /api/notifications (user's notification list) | Krupal | Not Started | — |
| B5.9 | Build admin event CRUD endpoints | Krupal | Not Started | B5.3 |
| B5.10 | Build admin notification dispatch endpoint | Aayush | Not Started | B5.7 |
| B5.11 | Write integration tests for directory, events, notification APIs | Aayush & Krupal | Not Started | All above |

---

#### Frontend Team — Lavanya, Prachi & Vineet

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| F5.1 | Build ContentDirectoryScreen (search, category tabs, grid) | Lavanya | Not Started | — |
| F5.2 | Add debounced search input | Lavanya | Not Started | F5.1 |
| F5.3 | Build content cards (type icon, title, duration, premium badge) | Prachi | Not Started | — |
| F5.4 | Connect directory to unified media player | Prachi | Not Started | F3.6, F3.7 |
| F5.5 | Add premium lock icon for free users | Prachi | Not Started | F5.3 |
| F5.6 | Build EventsScreen (upcoming events list) | Lavanya | Not Started | — |
| F5.7 | Build event card component (image, title, date, instructor) | Lavanya | Not Started | F5.6 |
| F5.8 | Build EventDetailScreen (full info, register, calendar, join live) | Lavanya | Not Started | F5.7 |
| F5.9 | Connect events to API (list, register, stream) | Lavanya | Not Started | F5.8, B5.3-B5.5 |
| F5.10 | Set up @react-native-firebase/messaging | Prachi | Not Started | — |
| F5.11 | Implement FCM permission request + token registration | Prachi | Not Started | F5.10 |
| F5.12 | Store FCM token in user profile | Prachi | Not Started | F5.11 |
| F5.13 | Handle notification tap + deep linking | Prachi | Not Started | F5.11 |
| F5.14 | Build admin EventsPage (CRUD, registrations view) | Vineet | Not Started | B5.9 |
| F5.15 | Build admin NotificationsPage (compose, target, send) | Vineet | Not Started | B5.10 |
| F5.16 | Write component tests for directory, events, notification | Lavanya | Not Started | F5.1, F5.6 |

---

#### Navnit (Lead) — Sprint 5 Review

| # | Review Task | Status |
|---|------------|--------|
| R5.1 | Review backend directory, events, notification APIs | Not Started |
| R5.2 | Review frontend directory, events, notification screens | Not Started |
| R5.3 | Review admin events + notification pages | Not Started |
| R5.4 | Test directory search returns relevant results | Not Started |
| R5.5 | Test event registration end-to-end | Not Started |
| R5.6 | Test push notification delivery to test device | Not Started |
| R5.7 | Test admin event CRUD + notification dispatch | Not Started |
| R5.8 | Run full test suite | Not Started |
| R5.9 | **Sign off Phase 2** — write PHASE_2_CORE_FEATURES.md | Not Started |

---

## Phase 3: Monetization & Polish (Weeks 11-14)

### Sprint 6 (Week 11-12): Payments & Subscriptions

#### Backend Team — Aayush & Krupal

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| B6.1 | Set up Razorpay test account + SDK | Aayush | Not Started | — |
| B6.2 | Build POST /api/payments/create-order (Razorpay order) | Aayush | Not Started | B6.1 |
| B6.3 | Build POST /api/payments/verify (signature verification) | Aayush | Not Started | B6.2 |
| B6.4 | Build Razorpay webhook Edge Function (payment-webhook/) | Krupal | Not Started | B6.1 |
| B6.5 | Implement subscription creation on successful payment | Krupal | Not Started | B6.3 |
| B6.6 | Build GET /api/subscriptions/status | Krupal | Not Started | B6.5 |
| B6.7 | Build subscription.middleware.ts (premium content gating) | Krupal | Not Started | B6.6 |
| B6.8 | Apply gating middleware to premium course/content/event routes | Aayush | Not Started | B6.7 |
| B6.9 | Handle subscription expiry + grace period logic | Krupal | Not Started | B6.5 |
| B6.10 | Write unit tests for signature verification (>90% coverage) | Aayush | Not Started | B6.3 |
| B6.11 | Write integration tests for full payment flow (test mode) | Krupal | Not Started | B6.2-B6.6 |

---

#### Frontend Team — Lavanya, Prachi & Vineet

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| F6.1 | Build PaywallScreen (feature comparison, plan cards, pricing) | Lavanya | Not Started | — |
| F6.2 | Add "Save 37%" badge on annual plan | Lavanya | Not Started | F6.1 |
| F6.3 | Integrate react-native-razorpay checkout modal | Prachi | Not Started | B6.2 |
| F6.4 | Connect payment flow: create-order → checkout → verify | Prachi | Not Started | F6.3, B6.2, B6.3 |
| F6.5 | Handle payment success/failure UI states | Prachi | Not Started | F6.4 |
| F6.6 | Create useSubscription() hook with isPremium flag | Prachi | Not Started | B6.6 |
| F6.7 | Add lock icon overlay + "Upgrade" CTA on premium content | Lavanya | Not Started | F6.6 |
| F6.8 | Build SubscriptionScreen (status, expiry, billing history) | Lavanya | Not Started | B6.6 |
| F6.9 | Build admin SubscriptionsPage (revenue, conversions, churn) | Vineet | Not Started | B6.6 |
| F6.10 | Write component tests for paywall, subscription screens | Lavanya | Not Started | F6.1, F6.8 |

---

#### Navnit (Lead) — Sprint 6 Review

| # | Review Task | Status |
|---|------------|--------|
| R6.1 | Review backend payment, subscription, gating code | Not Started |
| R6.2 | Review frontend paywall, subscription, checkout integration | Not Started |
| R6.3 | Test full payment flow in Razorpay test mode | Not Started |
| R6.4 | Test premium gating (locked for free, unlocked for premium) | Not Started |
| R6.5 | Test webhook handles payment.captured + payment.failed | Not Started |
| R6.6 | Test subscription expiry blocks premium access | Not Started |
| R6.7 | Verify signature verification has >90% test coverage | Not Started |
| R6.8 | Run full test suite | Not Started |
| R6.9 | Sign off Sprint 6 | Not Started |

---

### Sprint 7 (Week 13-14): Streaming, Offline, Performance, Monitoring

#### Backend Team — Aayush & Krupal

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| B7.1 | Implement signed stream URL generation (Cloudflare Stream) | Krupal | Not Started | — |
| B7.2 | Add registration check to stream URL endpoint | Krupal | Not Started | B7.1 |
| B7.3 | Build download authorization endpoint (premium check) | Aayush | Not Started | — |
| B7.4 | Set up Sentry on backend (error tracking, performance) | Aayush | Not Started | — |
| B7.5 | Add API response compression (gzip) | Krupal | Not Started | — |
| B7.6 | Run database query optimization (EXPLAIN ANALYZE on slow queries) | Aayush | Not Started | — |
| B7.7 | Build admin analytics endpoints (aggregate Mixpanel data) | Krupal | Not Started | — |
| B7.8 | Write integration tests for streaming + download auth | Krupal | Not Started | B7.1-B7.3 |

---

#### Frontend Team — Lavanya, Prachi & Vineet

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| F7.1 | Build live stream player (HLS via react-native-video) | Prachi | Not Started | B7.1 |
| F7.2 | Add live indicator badge + participant count on events | Prachi | Not Started | F7.1 |
| F7.3 | Build download manager component (queue, progress) | Prachi | Not Started | B7.3 |
| F7.4 | Implement offline content storage (react-native-fs) | Prachi | Not Started | F7.3 |
| F7.5 | Add download limits per plan (25 monthly, unlimited annual) | Prachi | Not Started | F7.4 |
| F7.6 | Performance: FlatList optimization (windowSize, batch) | Lavanya | Not Started | — |
| F7.7 | Performance: Image optimization (WebP, FastImage) | Lavanya | Not Started | — |
| F7.8 | Performance: React.memo + useMemo on heavy components | Lavanya | Not Started | — |
| F7.9 | Performance: Bundle size analysis + code splitting | Lavanya | Not Started | — |
| F7.10 | Set up @sentry/react-native (crash + performance tracing) | Prachi | Not Started | — |
| F7.11 | Add error boundary components | Prachi | Not Started | F7.10 |
| F7.12 | Measure cold start time (target <3s on mid-range) | Lavanya | Not Started | F7.6-F7.9 |
| F7.13 | Build admin analytics dashboard (Recharts, DAU/MAU, retention) | Vineet | Not Started | B7.7 |
| F7.14 | Write performance benchmark tests | Lavanya | Not Started | F7.12 |

---

#### Navnit (Lead) — Sprint 7 Review

| # | Review Task | Status |
|---|------------|--------|
| R7.1 | Review backend streaming, download, monitoring code | Not Started |
| R7.2 | Review frontend streaming, offline, performance work | Not Started |
| R7.3 | Review admin analytics dashboard | Not Started |
| R7.4 | Test live stream playback end-to-end | Not Started |
| R7.5 | Test offline download + playback without network | Not Started |
| R7.6 | Verify cold start <3s on test device | Not Started |
| R7.7 | Verify 60fps scrolling on course/directory lists | Not Started |
| R7.8 | Verify Sentry captures test crash + performance trace | Not Started |
| R7.9 | Run full test suite | Not Started |
| R7.10 | **Sign off Phase 3** — write PHASE_3_MONETIZATION.md | Not Started |

---

## Phase 4: Testing & Launch (Weeks 15-18)

### Sprint 8 (Week 15-16): QA, Bug Fixes, Beta

#### Backend Team — Aayush & Krupal

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| B8.1 | Run security audit (OWASP ZAP) on all API endpoints | Aayush | Not Started | — |
| B8.2 | Run npm audit + fix vulnerabilities | Krupal | Not Started | — |
| B8.3 | Load test APIs (simulate 100 concurrent users) | Aayush | Not Started | — |
| B8.4 | Fix all P0/P1 backend bugs from QA | Aayush & Krupal | Not Started | — |
| B8.5 | Write regression tests for fixed bugs | Aayush & Krupal | Not Started | B8.4 |

---

#### Frontend Team — Lavanya, Prachi & Vineet

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| F8.1 | Write E2E tests for critical flows (Detox/Maestro) | Prachi | Not Started | — |
| F8.2 | Run device matrix testing (5 devices, see Phase 4 doc) | Lavanya | Not Started | — |
| F8.3 | UI polish pass — ensure design system consistency | Lavanya | Not Started | — |
| F8.4 | Accessibility testing (contrast, screen reader, dynamic type) | Lavanya | Not Started | — |
| F8.5 | Fix all P0/P1 frontend bugs from QA | Lavanya & Prachi | Not Started | — |
| F8.6 | Set up beta distribution (TestFlight + Firebase App Dist) | Prachi | Not Started | — |
| F8.7 | Collect and triage beta feedback | Lavanya | Not Started | F8.6 |
| F8.8 | Fix admin panel UI inconsistencies | Vineet | Not Started | — |

---

#### Navnit (Lead) — Sprint 8 Review

| # | Review Task | Status |
|---|------------|--------|
| R8.1 | Review security audit results | Not Started |
| R8.2 | Review all bug fix PRs | Not Started |
| R8.3 | Run full E2E test suite on 2+ devices | Not Started |
| R8.4 | Verify crash-free rate >99.5% | Not Started |
| R8.5 | Verify no P0 bugs remaining | Not Started |
| R8.6 | Review beta feedback triage | Not Started |
| R8.7 | Sign off Sprint 8 | Not Started |

---

### Sprint 9 (Week 17-18): Final Fixes & Launch

#### Backend Team — Aayush & Krupal

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| B9.1 | Create production Supabase project | Krupal | Not Started | — |
| B9.2 | Run all migrations on production database | Aayush | Not Started | B9.1 |
| B9.3 | Load production seed data (initial quotes, categories) | Aayush | Not Started | B9.2 |
| B9.4 | Configure production environment variables | Krupal | Not Started | B9.1 |
| B9.5 | Deploy backend to production server | Krupal | Not Started | B9.4 |
| B9.6 | Verify production health check + API responses | Aayush | Not Started | B9.5 |
| B9.7 | Set up Sentry production DSN | Krupal | Not Started | B9.5 |

---

#### Frontend Team — Lavanya, Prachi & Vineet

| # | Task | Assignee | Status | Depends On |
|---|------|----------|--------|------------|
| F9.1 | Fix remaining P1 bugs from beta feedback | Lavanya & Prachi | Not Started | — |
| F9.2 | Generate App Store screenshots (6.7" + 5.5") | Lavanya | Not Started | — |
| F9.3 | Generate Play Store screenshots + feature graphic | Lavanya | Not Started | — |
| F9.4 | Write app descriptions and keywords | Lavanya | Not Started | — |
| F9.5 | Build iOS production archive via Fastlane | Prachi | Not Started | — |
| F9.6 | Build Android production bundle via Fastlane | Prachi | Not Started | — |
| F9.7 | Submit iOS app to App Store Connect | Prachi | Not Started | F9.5 |
| F9.8 | Submit Android app to Google Play Console | Prachi | Not Started | F9.6 |
| F9.9 | Deploy admin panel to Vercel production | Vineet | Not Started | B9.5 |
| F9.10 | Configure custom domain for admin panel | Vineet | Not Started | F9.9 |

---

#### Navnit (Lead) — Sprint 9 Review & Launch

| # | Review Task | Status |
|---|------------|--------|
| R9.1 | Final review of all remaining PRs | Not Started |
| R9.2 | Verify production database has all tables + data | Not Started |
| R9.3 | Verify production API health check | Not Started |
| R9.4 | Verify admin panel on production URL | Not Started |
| R9.5 | Review app store listings (screenshots, descriptions) | Not Started |
| R9.6 | Test full user flow on production environment | Not Started |
| R9.7 | Verify Sentry monitoring is active | Not Started |
| R9.8 | **Sign off Phase 4** — write PHASE_4_LAUNCH.md | Not Started |
| R9.9 | **Project launch** | Not Started |

---

## Summary: Task Count Per Person

| Person | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Total |
|--------|---------|---------|---------|---------|-------|
| **Aayush** (Backend) | 11 | 12 | 8 | 7 | 38 |
| **Krupal** (Backend) | 11 | 10 | 9 | 6 | 36 |
| **Lavanya** (Frontend) | 12 | 14 | 8 | 7 | 41 |
| **Prachi** (Frontend) | 12 | 14 | 12 | 5 | 43 |
| **Vineet** (Admin Panel) | 4 | 6 | 3 | 4 | 17 |
| **Navnit** (Lead/Review) | 7 | 10 | 10 | 8 | 35 |

> **Note**: Vineet's count is lower because admin panel work is focused. If workload feels unbalanced, Vineet can assist Lavanya/Prachi on mobile UI components during lighter admin sprints.

---

*This document is the authority on who does what. Update task statuses as work progresses. No phase advances without Navnit's sign-off.*
