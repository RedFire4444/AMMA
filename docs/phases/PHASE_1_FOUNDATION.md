# Phase 1: Foundation - Detailed Documentation

> **Status**: COMPLETED
> **Duration**: Weeks 1-4 (Sprint 1 + Sprint 2)
> **Last Updated**: 2026-04-05
> **Commit**: b7e11ed — 76 files changed, 3,344 insertions

---

## Phase Overview

Phase 1 established the entire project infrastructure from scratch: three-part architecture (React Native mobile app, React admin panel, Node.js/Express backend), database with 17 tables and RLS security policies, multi-method authentication (OTP + email + Google), navigation skeleton, onboarding flow, home screen, profile screen, and CI/CD pipeline.

**What was built**:
1. React Native CLI project with TypeScript, NativeWind v4, Zustand, React Navigation v7
2. Phone OTP + Email/Password + Google OAuth authentication
3. 3-screen onboarding flow (Welcome → Interests → Goal)
4. Home screen with greeting, stats, events, trending courses, daily quote
5. Profile screen with 6-card stats grid, premium upsell, settings list
6. Full Express.js backend with middleware stack (auth, admin, rate-limit, validation, error handling)
7. 17 Supabase database migrations with RLS policies, indexes, and streak functions
8. Admin panel scaffold (Vite + React + Tailwind) with login, sidebar, 10 placeholder pages
9. GitHub Actions CI/CD for mobile, backend, and admin

---

## Sprint 1 Implementation (Week 1-2)

### React Native Project Setup
- React Native 0.84.1 with TypeScript strict mode
- NativeWind v4 configured with forest green design tokens (#1B4332, #2D6A4F, #40916C)
- Custom fonts loaded (Inter for body, Playfair Display for headings)
- Path aliases via babel-plugin-module-resolver (@components/*, @screens/*, etc.)
- ESLint + Prettier configured with React Native ruleset
- Husky pre-commit hooks with lint-staged

### Database Schema (17 migrations)
- 001-013: Core tables (users, courses, lessons, enrollments, meditation_sessions, habit_logs, events, event_registrations, subscriptions, payments, notifications, daily_quotes, content_directory)
- 014: Row Level Security policies for all tables
- 015: Performance indexes on all foreign keys and frequently queried columns
- 016: PostgreSQL functions (calculate_streak, get_user_streaks, get_habit_stats)
- 017: Onboarding fields + email nullable for OTP users

### Backend API
- Express.js with helmet, CORS, morgan, rate-limiting, JSON parsing
- Auth middleware (JWT verification via Supabase)
- Admin middleware (role-based access control)
- Zod validator middleware for input validation
- Global error handler with standard response envelope
- Endpoints: POST /auth/request-otp, POST /auth/verify-otp, POST /auth/email-login, POST /auth/email-signup

### Authentication Flow
- **Phone OTP**: Enter phone → receive SMS OTP → verify → JWT issued → stored in Keychain
- **Email/Password**: Enter email + password → Supabase Auth → JWT issued
- **Google OAuth**: One-tap Google sign-in via Supabase OAuth provider
- Auth store (Zustand): user, session, isLoading, onboardingComplete, restoreSession
- Session persistence via react-native-keychain (Keychain on iOS, Keystore on Android)
- Auto-restore session on app launch with token refresh

### Navigation Structure
- RootNavigator: 3-way conditional (not auth → AuthNav, auth+no onboard → OnboardingNav, auth+onboarded → MainTabNav)
- AuthNavigator: Login → OTP (stack)
- OnboardingNavigator: Welcome → Interests → Goal (stack)
- MainTabNavigator: My Journey | Courses | Home (center) | Directory | Profile
- Custom tab bar with center Home emphasis
- Type-safe navigation with TypeScript generics

### CI/CD Pipeline
- `.github/workflows/ci.yml` — Mobile: lint, type-check, test on PR
- `.github/workflows/backend-ci.yml` — Backend: type-check, test on PR
- `.github/workflows/admin-ci.yml` — Admin: build verification on PR

---

## Sprint 2 Implementation (Week 3-4)

### Onboarding Flow (3 Screens)
- **WelcomeScreen**: MAM branding with flower logo, "Begin your journey within" heading, "Get Started" CTA, Skip button (sets defaults: meditation+mindfulness interests, 10 min goal), page indicator dots
- **InterestsScreen**: 8 interest category chips in 2-column grid (Meditation, Yoga, Pranayama, Chanting, Sleep, Stress Relief, Focus, Spirituality), multi-select with min 1 validation, Next/Skip buttons
- **OnboardingGoal**: 6 duration pills (3, 5, 10, 15, 20, 30 min), notification toggle with description, "Start My Journey" CTA, completes onboarding via PATCH /api/users/me

### Home Screen
- Time-based greeting (Good Morning/Afternoon/Evening + user name)
- Stats pills (Total Time, Day Streak) in horizontal scroll
- Upcoming events banner (horizontal FlatList with LIVE badge)
- Trending videos carousel (course cards with duration overlay)
- Daily affirmation card (Playfair Display, author attribution)
- Pull-to-refresh with RefreshControl
- Skeleton loading states while data fetches
- GET /api/home/feed aggregates: quote, courses, events, streak, greeting

### Profile Screen
- Avatar with initial letter, name, level badge (Beginner/Intermediate/Advanced)
- "Edit Profile" link
- 6-card stats grid: Member Since, Longest Streak, Total Duration, Sessions, Longest Session, Monthly Progress
- Premium upsell card (for free users) with feature highlights
- Settings list: Subscription, Notifications, Invite a Friend, Terms & Privacy, Helpdesk, Logout, Delete Account
- Logout with confirmation alert, clears Keychain + Zustand store

### Admin Panel Scaffold
- Vite + React 18 + TypeScript + Tailwind CSS project
- Forest green design tokens matching mobile app
- Sidebar with lucide-react icons and NavLink active states
- AdminLayout wrapper (sidebar + content area with header)
- ProtectedRoute with async Supabase session check
- Login page (email/password via Supabase Auth)
- 10 placeholder pages with proper headings and "Coming in Phase 2" messages
- React Router v7 with nested routes and root redirect

---

## Architecture Decisions

### 1. React Native CLI vs Expo
**Decision**: Bare React Native CLI workflow (not Expo).
**Rationale**: Full native module access needed for Keychain, background audio, push notifications, and payment SDKs. CLI workflow gives direct access to Xcode/Android Studio for native configuration.

### 2. Supabase as Backend-as-a-Service (Hybrid)
**Decision**: Use Supabase for database, auth, and storage, but maintain a custom Express API server for business logic.
**Rationale**: Supabase provides hosted Postgres with RLS, built-in auth (OTP, email, OAuth), and Edge Functions. The custom Express server handles complex aggregation (home feed), payment processing, and middleware that Supabase's auto-generated API can't provide.

### 3. Three-Way Navigator Conditional
**Decision**: RootNavigator uses 3-way conditional (not auth → auth flow, auth but no onboarding → onboarding, auth + onboarded → main app).
**Rationale**: Separating onboarding into its own navigator prevents the back button from returning to login after OTP verification. Users complete onboarding once, then never see it again.

### 4. Forest Green Design System
**Decision**: Primary #1B4332 (forest green) with warm off-white background #FAFAF5.
**Rationale**: Evokes calm, nature, and wellness — appropriate for a meditation app. High contrast ratio (4.5:1+) meets WCAG 2.1 AA compliance.

---

## Files Created in Phase 1

### Mobile (28 files)
- App.tsx, 10 screens, 4 navigation files, 2 services, 1 store, 1 component, 2 utils, 1 theme, 1 type def
- Configuration: tailwind.config.js, tsconfig.json, babel.config.js, metro.config.js, jest.config.js, .eslintrc.js, .prettierrc

### Backend (25 files)
- server.ts, 2 controllers, 3 routes, 1 service, 5 middleware, 1 validator, 3 utils
- 17 SQL migration files + seed.sql

### Admin (25 files)
- package.json, vite.config.ts, tsconfig.json, tailwind.config.ts, postcss.config.js
- App.tsx, main.tsx, index.css, 11 pages, 3 layout components, 2 services

### CI/CD (3 files)
- ci.yml, backend-ci.yml, admin-ci.yml

---

## Testing Summary

| Category | Tests Written | Tests Passing |
|----------|-------------|--------------|
| LoginScreen | 7 | 7 |
| OTPScreen | 4 | 4 |
| OnboardingWelcome | 5 | 5 |
| OnboardingInterests | 6 | 6 |
| OnboardingGoal | 4 | 4 |
| HomeMain | 4 | 4 |
| ProfileMain | 5 | 5 |
| RootNavigator | 3 | 3 |
| Backend Auth Integration | 4 | 4 |
| Backend Auth Validators | 3 | 3 |
| **Total** | **45** | **45** |

---

## Challenges & Solutions

| Challenge | Solution | Lesson Learned |
|-----------|----------|---------------|
| RootNavigator hardcoded `isAuthenticated = false` | Subscribed to Zustand authStore with session + onboardingComplete | Always wire state management from the start |
| NativeWind template literal interpolation not supported | Use ternary conditionals: `className={condition ? 'a' : 'b'}` | NativeWind v4 differs from web Tailwind |
| Navigation type mismatch (phoneNumber vs phone) | Unified to `phone` across types.ts and all screens | Define types first, then implement screens |
| Theme colors were placeholder blue | Centralized in tailwind.config.js + theme/index.ts, changed once | Single source of truth for design tokens |
| Users table email was NOT NULL but OTP users have no email | Migration 017: ALTER COLUMN email DROP NOT NULL | Plan for multiple auth providers from the start |

---

## Interview Talking Points

### Topics You Can Discuss After Phase 1:

1. **Multi-Method Authentication Architecture**
   - Phone OTP + Email/Password + Google OAuth in one app
   - Supabase Auth handles all three providers with unified JWT
   - Secure token storage (Keychain/Keystore, never AsyncStorage)
   - Session restoration on app launch with auto-refresh
   - Rate limiting: 3 OTP requests per phone per 10 minutes

2. **React Navigation v7 Architecture**
   - Three-way conditional navigator (auth/onboarding/main)
   - Type-safe navigation with TypeScript generics
   - Custom tab bar with center emphasis pattern
   - Separate navigators for auth, onboarding, and main flows

3. **Database Design with Row Level Security**
   - 17 PostgreSQL tables with UUID primary keys
   - RLS policies ensuring user data isolation
   - PostgreSQL functions for streak calculation (window functions)
   - Performance indexes on all foreign keys

4. **Supabase Hybrid Architecture**
   - Supabase for DB + Auth + Storage (managed services)
   - Custom Express API for business logic (home feed aggregation, payment processing)
   - Edge Functions for serverless workloads (webhooks, crons)
   - Why hybrid > pure Supabase or pure custom backend

5. **CI/CD Pipeline Design**
   - GitHub Actions matrix for multi-project monorepo
   - Separate workflows for mobile, backend, admin
   - Pre-commit hooks with lint-staged for code quality
   - Branch protection rules enforcing PR reviews
