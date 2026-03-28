# MAM Spiritual Wellness & Meditation App - Master Implementation Plan

> **Project**: MAM Meditation App
> **Team Lead**: Navnit
> **Team**: Prachi Shirode, Aayush Tolmare, Lavanya Veni, Krupal Warale, Vineet Wathurkar
> **Document Version**: 1.0 | March 2026
> **Total Duration**: 18 weeks (4 Phases, 9 Sprints)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Structure & Monorepo Layout](#2-folder-structure--monorepo-layout)
3. [Technology Stack Summary](#3-technology-stack-summary)
4. [Development Workflow & Safety Protocols](#4-development-workflow--safety-protocols)
5. [Phase 1: Foundation (Weeks 1-4)](#5-phase-1-foundation-weeks-1-4)
6. [Phase 2: Core Features (Weeks 5-10)](#6-phase-2-core-features-weeks-5-10)
7. [Phase 3: Monetization & Polish (Weeks 11-14)](#7-phase-3-monetization--polish-weeks-11-14)
8. [Phase 4: Testing & Launch (Weeks 15-18)](#8-phase-4-testing--launch-weeks-15-18)
9. [Database Schema Reference](#9-database-schema-reference)
10. [API Endpoint Reference](#10-api-endpoint-reference)
11. [Testing Strategy](#11-testing-strategy)
12. [Documentation Protocol](#12-documentation-protocol)

---

## 1. Project Overview

### 1.1 What We Are Building

A cross-platform mobile application (iOS + Android) for spiritual wellness and meditation, targeting the Indian and South Asian market. The system consists of three parts:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Mobile App** | React Native CLI 0.76+ | User-facing iOS/Android app |
| **Admin Panel** | React.js (Vite) | Content management, analytics, user admin |
| **Backend API** | Node.js + Express + Supabase | RESTful API, auth, business logic |

### 1.2 Core Features (MVP)

1. **Authentication** - Phone OTP login via Supabase Auth
2. **Home Feed** - Daily quotes, trending videos, live events banner, streak widget
3. **Courses & Lessons** - Browse, enroll, video/audio player with progress tracking
4. **Meditation Timer** - Timer with ambient sounds, session logging
5. **Habit Tracking** - Streaks, daily check-ins, journey dashboard
6. **Content Directory** - Searchable library of videos, audio, articles
7. **Events** - Listing, registration, live streaming
8. **Payments** - Razorpay (India) + Stripe (international), subscription management
9. **Admin Panel** - Full CRUD for all content, users, events, analytics dashboard
10. **Push Notifications** - FCM for reminders, events, new content

### 1.3 Design System

| Element | Value |
|---------|-------|
| Primary Color | `#1B4332` (Deep forest green) |
| Secondary Color | `#2D6A4F` (Medium green) |
| Accent Color | `#40916C` (Soft green) |
| Background | `#FAFAF5` (Warm off-white) |
| Surface | `#FFFFFF` (Pure white) |
| Text Primary | `#1A1A2E` (Near black) |
| Text Secondary | `#6B7280` (Gray) |
| Body Font | Inter |
| Heading Font | Playfair Display |
| Spacing Unit | 4px base (4, 8, 12, 16, 20, 24, 32, 48, 64) |
| Border Radius | 12px cards, 8px buttons, 24px pills |

---

## 2. Folder Structure & Monorepo Layout

```
MAM-Project/
├── mobile/                          # React Native CLI mobile app
│   ├── src/
│   │   ├── assets/                  # Images, fonts, sounds
│   │   │   ├── fonts/
│   │   │   ├── images/
│   │   │   └── sounds/              # Ambient meditation sounds
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # Buttons, Cards, Inputs, Typography
│   │   │   ├── layout/              # Header, SafeArea, TabBar
│   │   │   ├── meditation/          # Timer, AmbientSoundPicker
│   │   │   ├── course/              # CourseCard, LessonItem, Player
│   │   │   ├── home/                # QuoteCard, StreakWidget, EventBanner
│   │   │   └── shared/              # Loading, Error, Empty states
│   │   ├── screens/                 # Screen components (1 per route)
│   │   │   ├── auth/                # LoginScreen, OTPScreen, OnboardingScreen
│   │   │   ├── home/                # HomeScreen
│   │   │   ├── courses/             # CoursesScreen, CourseDetailScreen, LessonScreen
│   │   │   ├── meditation/          # MeditationTimerScreen
│   │   │   ├── journey/             # JourneyScreen (habit tracking)
│   │   │   ├── directory/           # ContentDirectoryScreen
│   │   │   ├── events/              # EventsScreen, EventDetailScreen
│   │   │   └── profile/             # ProfileScreen, SettingsScreen, SubscriptionScreen
│   │   ├── navigation/              # React Navigation setup
│   │   │   ├── RootNavigator.tsx    # Auth vs Main flow
│   │   │   ├── AuthNavigator.tsx    # Login > OTP > Onboarding
│   │   │   ├── MainTabNavigator.tsx # Bottom tabs
│   │   │   ├── HomeStack.tsx
│   │   │   ├── CoursesStack.tsx
│   │   │   ├── JourneyStack.tsx
│   │   │   ├── EventsStack.tsx
│   │   │   ├── ProfileStack.tsx
│   │   │   └── types.ts            # Navigation type definitions
│   │   ├── services/                # API & external service integrations
│   │   │   ├── api.ts              # Axios/fetch instance with interceptors
│   │   │   ├── supabase.ts         # Supabase client initialization
│   │   │   ├── auth.service.ts     # OTP request/verify, session management
│   │   │   ├── courses.service.ts
│   │   │   ├── meditation.service.ts
│   │   │   ├── habits.service.ts
│   │   │   ├── events.service.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── directory.service.ts
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useCourses.ts       # React Query hooks for courses
│   │   │   ├── useMeditation.ts
│   │   │   ├── useStreak.ts
│   │   │   ├── useEvents.ts
│   │   │   ├── useSubscription.ts
│   │   │   └── useNotifications.ts
│   │   ├── store/                   # Zustand state management
│   │   │   ├── authStore.ts        # Auth state, user profile
│   │   │   ├── meditationStore.ts  # Timer state, ambient sounds
│   │   │   ├── settingsStore.ts    # Theme, notification prefs, language
│   │   │   └── index.ts
│   │   ├── types/                   # TypeScript type definitions
│   │   │   ├── user.types.ts
│   │   │   ├── course.types.ts
│   │   │   ├── meditation.types.ts
│   │   │   ├── event.types.ts
│   │   │   ├── payment.types.ts
│   │   │   ├── api.types.ts        # API response envelope types
│   │   │   └── navigation.types.ts
│   │   ├── utils/                   # Pure utility functions
│   │   │   ├── formatters.ts       # Date, time, currency formatting
│   │   │   ├── validators.ts       # Phone number, OTP validation (Zod)
│   │   │   └── constants.ts        # Colors, spacing, API URLs
│   │   ├── theme/                   # NativeWind theme configuration
│   │   │   └── index.ts
│   │   └── App.tsx                  # Root component
│   ├── __tests__/                   # Test files
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── screens/
│   │   └── utils/
│   ├── android/                     # Android native project
│   ├── ios/                         # iOS native project
│   ├── app.json
│   ├── babel.config.js
│   ├── metro.config.js
│   ├── tailwind.config.js           # NativeWind config
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── .eslintrc.js
│   ├── .prettierrc
│   └── package.json
│
├── admin/                           # React.js Admin Panel (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Shadcn/UI components
│   │   │   ├── layout/             # Sidebar, Header, PageWrapper
│   │   │   ├── tables/             # Data tables (TanStack Table)
│   │   │   ├── forms/              # Form components
│   │   │   └── charts/             # Recharts dashboard widgets
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx    # Analytics overview
│   │   │   ├── UsersPage.tsx        # User management
│   │   │   ├── CoursesPage.tsx      # Course CRUD
│   │   │   ├── LessonsPage.tsx      # Lesson CRUD within courses
│   │   │   ├── ContentPage.tsx      # Content directory management
│   │   │   ├── EventsPage.tsx       # Event CRUD
│   │   │   ├── QuotesPage.tsx       # Daily quotes management
│   │   │   ├── NotificationsPage.tsx # Push notification dispatch
│   │   │   ├── SubscriptionsPage.tsx # Subscription analytics
│   │   │   └── SettingsPage.tsx     # Admin settings
│   │   ├── hooks/
│   │   ├── services/
│   │   │   ├── api.ts              # Axios instance for admin API
│   │   │   ├── supabase.ts         # Admin Supabase client
│   │   │   └── *.service.ts        # Service modules per domain
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── .eslintrc.cjs
│   └── package.json
│
├── backend/                         # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── index.ts            # Route aggregator
│   │   │   ├── auth.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── courses.routes.ts
│   │   │   ├── sessions.routes.ts   # Meditation sessions
│   │   │   ├── habits.routes.ts
│   │   │   ├── events.routes.ts
│   │   │   ├── payments.routes.ts
│   │   │   ├── subscriptions.routes.ts
│   │   │   ├── notifications.routes.ts
│   │   │   ├── directory.routes.ts
│   │   │   ├── home.routes.ts       # Home feed endpoint
│   │   │   └── admin.routes.ts      # Admin-only endpoints
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── courses.controller.ts
│   │   │   ├── sessions.controller.ts
│   │   │   ├── habits.controller.ts
│   │   │   ├── events.controller.ts
│   │   │   ├── payments.controller.ts
│   │   │   ├── subscriptions.controller.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── directory.controller.ts
│   │   │   ├── home.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts    # JWT verification via Supabase
│   │   │   ├── admin.middleware.ts   # Role-based access (admin only)
│   │   │   ├── rateLimiter.middleware.ts
│   │   │   ├── validator.middleware.ts  # Zod schema validation
│   │   │   └── errorHandler.middleware.ts  # Global exception handler
│   │   ├── services/
│   │   │   ├── supabase.service.ts  # Supabase admin client
│   │   │   ├── otp.service.ts       # MSG91/Twilio OTP delivery
│   │   │   ├── payment.service.ts   # Razorpay/Stripe integration
│   │   │   ├── notification.service.ts  # FCM push
│   │   │   ├── storage.service.ts   # R2/S3 media upload
│   │   │   └── streak.service.ts    # Streak calculation logic
│   │   ├── validators/
│   │   │   ├── auth.validator.ts    # Zod schemas for auth endpoints
│   │   │   ├── course.validator.ts
│   │   │   ├── session.validator.ts
│   │   │   ├── habit.validator.ts
│   │   │   ├── event.validator.ts
│   │   │   └── payment.validator.ts
│   │   ├── types/
│   │   │   ├── express.d.ts        # Express type augmentation
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── apiResponse.ts      # Standard response envelope helper
│   │   │   ├── logger.ts           # Structured logging
│   │   │   └── config.ts           # Environment config loader
│   │   └── server.ts               # Express app entry point
│   ├── supabase/
│   │   ├── migrations/             # SQL migration files (numbered)
│   │   │   ├── 001_create_users.sql
│   │   │   ├── 002_create_courses.sql
│   │   │   ├── 003_create_lessons.sql
│   │   │   ├── 004_create_enrollments.sql
│   │   │   ├── 005_create_meditation_sessions.sql
│   │   │   ├── 006_create_habit_logs.sql
│   │   │   ├── 007_create_events.sql
│   │   │   ├── 008_create_event_registrations.sql
│   │   │   ├── 009_create_subscriptions.sql
│   │   │   ├── 010_create_payments.sql
│   │   │   ├── 011_create_notifications.sql
│   │   │   ├── 012_create_daily_quotes.sql
│   │   │   ├── 013_create_content_directory.sql
│   │   │   ├── 014_create_rls_policies.sql
│   │   │   ├── 015_create_indexes.sql
│   │   │   └── 016_create_functions.sql  # Streak calculation function
│   │   ├── functions/              # Supabase Edge Functions
│   │   │   ├── streak-reset/       # Nightly cron for streak integrity
│   │   │   └── payment-webhook/    # Razorpay webhook handler
│   │   └── seed.sql                # Development seed data
│   ├── __tests__/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── middleware/
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── .env.example                # Template (never commit .env)
│   └── package.json
│
├── docs/                            # Project documentation
│   ├── IMPLEMENTATION_PLAN.md       # This file
│   ├── PROGRESS_TRACKER.md          # Sprint-by-sprint checkboxes
│   ├── phases/
│   │   ├── PHASE_1_FOUNDATION.md    # Written after Phase 1 completion
│   │   ├── PHASE_2_CORE_FEATURES.md
│   │   ├── PHASE_3_MONETIZATION.md
│   │   └── PHASE_4_LAUNCH.md
│   └── api/
│       └── API_REFERENCE.md         # Full endpoint documentation
│
├── .github/
│   └── workflows/
│       ├── ci.yml                   # Lint + test on PR
│       ├── mobile-build.yml         # Build mobile app
│       └── admin-deploy.yml         # Deploy admin panel
│
├── .gitignore
├── CLAUDE.md                        # Project-specific AI assistant rules
└── meditation_app_project_plan.pdf  # Original project plan
```

---

## 3. Technology Stack Summary

### 3.1 Mobile App Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react-native | 0.76+ | Core framework |
| @react-navigation/native | v7 | Navigation |
| @react-navigation/bottom-tabs | v7 | Bottom tab navigator |
| @react-navigation/native-stack | v7 | Stack navigator |
| nativewind | v4 | Tailwind CSS styling |
| @tanstack/react-query | v5 | Server state management |
| zustand | v4 | Client state management |
| @supabase/supabase-js | latest | Supabase client |
| react-hook-form | latest | Form handling |
| zod | latest | Schema validation |
| react-native-video | v6+ | Video playback |
| react-native-track-player | latest | Audio playback |
| react-native-keychain | latest | Secure token storage |
| @react-native-firebase/messaging | latest | Push notifications |
| react-native-fast-image | latest | Optimized image loading |
| react-native-reanimated | latest | Animations |
| react-native-gesture-handler | latest | Gesture support |
| react-native-safe-area-context | latest | Safe area handling |
| react-native-screens | latest | Native screen optimization |
| @sentry/react-native | latest | Crash reporting |
| dayjs | latest | Date manipulation |

### 3.2 Admin Panel Dependencies

| Package | Purpose |
|---------|---------|
| react + react-dom | UI framework |
| vite | Build tool |
| tailwindcss | Styling |
| @shadcn/ui components | UI component library |
| @tanstack/react-table | Data tables |
| @tanstack/react-query | Server state |
| recharts | Charts/analytics |
| react-router-dom v7 | Routing |
| @supabase/supabase-js | Supabase client |
| zod | Validation |
| react-hook-form | Forms |
| lucide-react | Icons |
| sonner | Toast notifications |

### 3.3 Backend Dependencies

| Package | Purpose |
|---------|---------|
| express | HTTP framework |
| @supabase/supabase-js | Supabase admin client |
| zod | Input validation |
| helmet | Security headers |
| cors | CORS handling |
| express-rate-limit | Rate limiting |
| morgan | HTTP request logging |
| razorpay | Payment gateway SDK |
| firebase-admin | FCM push notifications |
| dotenv | Environment variables |
| winston | Structured logging |
| tsx | TypeScript execution |

---

## 4. Development Workflow & Safety Protocols

### 4.1 Git Branching Strategy

```
main                 # Production-ready code (protected)
├── develop           # Integration branch
│   ├── feature/*     # Feature branches (feature/auth-otp, feature/course-player)
│   ├── fix/*         # Bug fix branches
│   └── chore/*       # Tooling, config changes
└── release/*         # Release candidate branches
```

### 4.2 Safety Protocols (CRITICAL)

These rules MUST be followed throughout the entire development process:

1. **No destructive operations** without explicit confirmation
2. **Never commit** `.env`, API keys, secrets, or credentials
3. **Always create a new branch** before making changes to a working feature
4. **Run all tests** before merging any branch
5. **Backup before refactoring** - ensure git commit exists before large changes
6. **Validate file paths** before write operations - never overwrite files outside the project
7. **Incremental builds** - test each component individually before integration
8. **Type safety first** - no `any` types in TypeScript strict mode
9. **Dependency audit** - run `npm audit` before adding new packages
10. **Environment isolation** - dev/staging/production Supabase projects are separate

### 4.3 Pre-Implementation Checklist (Every Sprint)

Before starting any sprint:
- [ ] All previous sprint tests passing
- [ ] No unresolved merge conflicts
- [ ] Dependencies up to date (`npm audit`)
- [ ] Development environment verified working
- [ ] Sprint goals reviewed and understood

### 4.4 Post-Implementation Checklist (Every Sprint)

After completing each sprint:
- [ ] All new code has TypeScript types (no `any`)
- [ ] Unit tests written and passing (>70% coverage for business logic)
- [ ] ESLint and Prettier checks pass
- [ ] No console.log statements left (use logger)
- [ ] No hardcoded values (use constants/env vars)
- [ ] API responses follow standard envelope format
- [ ] RLS policies verified for new tables
- [ ] Phase documentation updated

---

## 5. Phase 1: Foundation (Weeks 1-4)

### Goal
Establish the project infrastructure, authentication system, navigation skeleton, database schema, and CI/CD pipeline. By the end of Phase 1, a user can download the app, log in with OTP, complete onboarding, see a home screen with mock data, and view their profile.

---

### Sprint 1 (Week 1-2): Project Setup, Database, Auth, Navigation, CI/CD

#### 5.1.1 Task: React Native CLI Project Initialization

**What**: Initialize the React Native project using the bare CLI workflow (not Expo).

**Steps**:
1. Run `npx @react-native-community/cli init MAMApp --template react-native-template-typescript` inside `mobile/`
2. Verify the app builds and runs on both iOS simulator and Android emulator
3. Configure TypeScript strict mode in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "esModuleInterop": true,
       "resolveJsonModule": true,
       "jsx": "react-native",
       "moduleResolution": "node",
       "target": "esnext",
       "baseUrl": "./src",
       "paths": {
         "@components/*": ["components/*"],
         "@screens/*": ["screens/*"],
         "@services/*": ["services/*"],
         "@hooks/*": ["hooks/*"],
         "@store/*": ["store/*"],
         "@utils/*": ["utils/*"],
         "@types/*": ["types/*"],
         "@assets/*": ["assets/*"],
         "@navigation/*": ["navigation/*"],
         "@theme/*": ["theme/*"]
       }
     }
   }
   ```
4. Set up path aliases in `babel.config.js` using `babel-plugin-module-resolver`
5. Configure ESLint with `@react-native/eslint-config` + custom rules
6. Configure Prettier with project standards
7. Create the full `src/` directory structure as defined in Section 2

**Files created**: ~15 directories, tsconfig.json, babel.config.js, .eslintrc.js, .prettierrc

**Test**: App builds and displays default React Native screen on both platforms

---

#### 5.1.2 Task: NativeWind v4 Setup & Theme Configuration

**What**: Install and configure NativeWind (Tailwind CSS for React Native) with the project's design tokens.

**Steps**:
1. Install: `nativewind`, `tailwindcss`, `react-native-css-interop`
2. Configure `tailwind.config.js` with custom colors, fonts, spacing:
   ```js
   module.exports = {
     content: ['./src/**/*.{js,jsx,ts,tsx}'],
     theme: {
       extend: {
         colors: {
           primary: { DEFAULT: '#1B4332', light: '#2D6A4F' },
           secondary: '#2D6A4F',
           accent: '#40916C',
           background: '#FAFAF5',
           surface: '#FFFFFF',
           'text-primary': '#1A1A2E',
           'text-secondary': '#6B7280',
         },
         fontFamily: {
           inter: ['Inter'],
           playfair: ['PlayfairDisplay'],
         },
         spacing: {
           '4.5': '18px',
         },
         borderRadius: {
           card: '12px',
           button: '8px',
           pill: '24px',
         },
       },
     },
   };
   ```
3. Update `metro.config.js` for NativeWind
4. Add custom fonts (Inter, Playfair Display) to `assets/fonts/` and link them
5. Create `theme/index.ts` exporting color constants for non-Tailwind usage

**Test**: Create a sample screen with NativeWind classes, verify styling renders correctly

---

#### 5.1.3 Task: Supabase Project Setup & Database Schema

**What**: Create Supabase project, design and apply all database tables, RLS policies, indexes, and seed data.

**Steps**:
1. Create Supabase project (Development environment)
2. Install Supabase CLI locally
3. Initialize Supabase in `backend/supabase/`
4. Write SQL migration files for all 13 core tables (see Section 9 for full DDL):

   **Migration 001 - Users**:
   ```sql
   CREATE TABLE public.users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     phone TEXT UNIQUE NOT NULL,
     name TEXT,
     avatar_url TEXT,
     role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
     onboarding_complete BOOLEAN DEFAULT false,
     meditation_goal_minutes INTEGER DEFAULT 10,
     interests TEXT[] DEFAULT '{}',
     notification_enabled BOOLEAN DEFAULT true,
     timezone TEXT DEFAULT 'Asia/Kolkata',
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );
   ```

   **Migration 002-013**: All remaining tables (courses, lessons, enrollments, meditation_sessions, habit_logs, events, event_registrations, subscriptions, payments, notifications, daily_quotes, content_directory)

   **Migration 014 - RLS Policies**:
   - Users: read/update own row only
   - Courses/Lessons/Events/Quotes/Directory: public read, admin write
   - Enrollments/Sessions/HabitLogs/EventRegistrations: user read/insert own
   - Subscriptions/Payments: user read own, admin read all
   - Notifications: user read/update own

   **Migration 015 - Indexes**:
   - `idx_habit_logs_user_date` on `(user_id, log_date)`
   - `idx_meditation_sessions_user` on `(user_id, started_at)`
   - `idx_enrollments_user` on `(user_id)`
   - `idx_events_date` on `(event_date)`
   - `idx_content_directory_category` on `(category)`
   - `idx_daily_quotes_date` on `(date)`
   - `idx_subscriptions_user` on `(user_id, status)`

   **Migration 016 - Functions**:
   - `calculate_streak(user_uuid)` - Returns current streak count
   - `update_streak_on_checkin()` - Trigger function for habit_logs insert

5. Apply migrations: `supabase db push`
6. Write `seed.sql` with sample data (5 courses, 20 lessons, 30 quotes, 3 events)
7. Verify all tables, policies, and indexes in Supabase dashboard

**Test**: Connect to Supabase from a test script, verify CRUD operations on each table, verify RLS blocks unauthorized access

---

#### 5.1.4 Task: Backend API Setup (Node.js + Express)

**What**: Initialize the Express.js backend with TypeScript, middleware stack, and folder structure.

**Steps**:
1. Initialize `backend/` with `npm init`
2. Install dependencies: express, @supabase/supabase-js, zod, helmet, cors, express-rate-limit, morgan, dotenv, winston, tsx
3. Install dev dependencies: typescript, @types/express, @types/node, @types/cors, @types/morgan, jest, supertest, @types/jest, ts-jest
4. Configure TypeScript strict mode
5. Create `src/server.ts`:
   ```typescript
   import express from 'express';
   import helmet from 'helmet';
   import cors from 'cors';
   import morgan from 'morgan';
   import { errorHandler } from './middleware/errorHandler.middleware';
   import { rateLimiter } from './middleware/rateLimiter.middleware';
   import routes from './routes';

   const app = express();

   app.use(helmet());
   app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }));
   app.use(morgan('combined'));
   app.use(express.json({ limit: '10mb' }));
   app.use(rateLimiter);
   app.use('/api', routes);
   app.use(errorHandler);

   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   ```
6. Create middleware:
   - `auth.middleware.ts` - Verify Supabase JWT from Authorization header
   - `admin.middleware.ts` - Check user role is admin/super_admin
   - `rateLimiter.middleware.ts` - 100 req/min per user, 3 OTP/10min per phone
   - `validator.middleware.ts` - Generic Zod schema validator
   - `errorHandler.middleware.ts` - Global exception handler with standard response
7. Create `utils/apiResponse.ts`:
   ```typescript
   export const success = (data: unknown, meta?: unknown) => ({
     success: true, data, error: null, meta
   });
   export const error = (code: string, message: string, status: number) => ({
     success: false, data: null, error: { code, message }, meta: null
   });
   ```
8. Create `.env.example` (never commit actual `.env`)

**Test**: Server starts, responds to health check endpoint, middleware chain works

---

#### 5.1.5 Task: Authentication Flow (OTP Login/Register)

**What**: Implement the complete phone OTP authentication flow across backend and mobile.

**Backend (auth.routes.ts + auth.controller.ts)**:
1. `POST /api/auth/request-otp`:
   - Validate phone number format with Zod
   - Rate limit: 3 OTP requests per phone per 10 minutes
   - Call Supabase Auth `signInWithOtp({ phone })`
   - Return success response
2. `POST /api/auth/verify-otp`:
   - Validate phone + OTP token with Zod
   - Call Supabase Auth `verifyOtp({ phone, token, type: 'sms' })`
   - Return JWT access token + refresh token
   - Create/update user profile in `users` table if first login

**Mobile (auth screens)**:
1. `LoginScreen.tsx`:
   - Phone number input with country code picker (+91 default)
   - "Send OTP" button
   - Input validation (10-digit Indian phone number)
   - Loading state during API call
   - Error handling with user-friendly messages
2. `OTPScreen.tsx`:
   - 6-digit OTP input (auto-focus, auto-advance)
   - 30-second resend countdown timer
   - Auto-verify on 6th digit
   - Store JWT securely via react-native-keychain
3. `auth.service.ts`:
   - `requestOTP(phone: string): Promise<void>`
   - `verifyOTP(phone: string, otp: string): Promise<AuthResponse>`
   - Token refresh logic using Supabase client
4. `authStore.ts` (Zustand):
   - `user: User | null`
   - `isAuthenticated: boolean`
   - `isLoading: boolean`
   - `login(phone, otp)`, `logout()`, `refreshSession()`

**Test**:
- Unit: Zod validators for phone/OTP format
- Integration: OTP request/verify API endpoints with test phone numbers
- Component: LoginScreen renders correctly, OTP input handles 6 digits

---

#### 5.1.6 Task: Navigation Structure

**What**: Set up React Navigation v7 with auth flow separation and bottom tab navigation.

**Steps**:
1. Install: @react-navigation/native, @react-navigation/native-stack, @react-navigation/bottom-tabs, react-native-screens, react-native-safe-area-context
2. Create type-safe navigation types in `navigation/types.ts`
3. Create navigators:
   - `RootNavigator.tsx`: Checks auth state, shows AuthNavigator or MainTabNavigator
   - `AuthNavigator.tsx`: Login > OTP > Onboarding (stack)
   - `MainTabNavigator.tsx`: 5 tabs - Home, Courses, Meditate, Events, Profile
   - `HomeStack.tsx`: Home > CourseDetail > LessonPlayer
   - `CoursesStack.tsx`: CoursesList > CourseDetail > LessonPlayer
   - `JourneyStack.tsx`: Journey dashboard (single screen initially)
   - `EventsStack.tsx`: EventsList > EventDetail
   - `ProfileStack.tsx`: Profile > Settings > Subscription

4. Tab bar design:
   - Custom tab bar component matching design system
   - Icons: Home, BookOpen, Timer/Lotus, Calendar, User
   - Active color: `#1B4332`, Inactive: `#6B7280`
   - Background: `#FFFFFF` with subtle top shadow

**Test**: Navigation works between all screens, auth flow redirects correctly, deep linking works

---

#### 5.1.7 Task: CI/CD Pipeline Setup

**What**: GitHub Actions workflow for automated linting, testing, and build verification.

**Steps**:
1. Create `.github/workflows/ci.yml`:
   ```yaml
   name: CI
   on: [pull_request]
   jobs:
     lint-and-test:
       runs-on: ubuntu-latest
       strategy:
         matrix:
           project: [mobile, admin, backend]
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 22 }
         - run: cd ${{ matrix.project }} && npm ci
         - run: cd ${{ matrix.project }} && npm run lint
         - run: cd ${{ matrix.project }} && npm run type-check
         - run: cd ${{ matrix.project }} && npm test -- --coverage
   ```
2. Create `.gitignore` covering node_modules, .env, build artifacts, OS files
3. Set up Husky pre-commit hooks for lint-staged

**Test**: Push a test PR, verify CI runs lint + tests successfully

---

### Sprint 2 (Week 3-4): Onboarding, Home Screen, Profile, Admin Scaffold

#### 5.2.1 Task: Onboarding Flow (3 Screens)

**What**: Post-first-login onboarding to personalize the user experience.

**Screens**:
1. **WelcomeScreen**: App introduction with illustration, "Let's begin your journey" CTA
2. **InterestsScreen**: Select interests from grid (Meditation, Yoga, Pranayama, Chanting, Sleep, Stress Relief, Focus, Spirituality). Min 1 selection. Stored as `interests[]` on user profile.
3. **GoalScreen**: Set daily meditation goal (slider: 3, 5, 10, 15, 20, 30 min). Enable notifications toggle. "Start My Journey" CTA.

**Implementation**:
- Use React Navigation stack with custom transitions (fade)
- Page indicator dots at bottom
- "Skip" button on each screen (sets defaults)
- On completion: PATCH `/api/users/me` with interests + goal + `onboarding_complete: true`
- AuthStore updates to reflect onboarding completion

**Test**:
- Component: Each screen renders correctly
- Integration: Onboarding data saves to Supabase
- Edge case: Skip button sets defaults correctly

---

#### 5.2.2 Task: Home Screen UI

**What**: Build the home screen with all widget sections using mock data initially.

**Sections (top to bottom)**:
1. **Header**: "Namaste, {name}" greeting + notification bell icon
2. **Daily Quote Card**: Playfair Display font, author attribution, soft background
3. **Streak Widget**: Current streak number, 7-day calendar dots, motivational text
4. **Quick Start Button**: "Start Meditation" floating action button
5. **Trending Videos Carousel**: Horizontal FlatList of video thumbnails with titles
6. **Live Events Banner**: Conditional - shows if event is live or upcoming within 1hr
7. **Featured Podcasts**: Horizontal list of podcast cards with play indicator
8. **Courses You Might Like**: Horizontal course cards based on interests

**Implementation**:
- Use ScrollView with sections, FlatList for carousels
- React Query hooks for data fetching (mock data in Sprint 2, real API in Sprint 3+)
- Pull-to-refresh support
- Skeleton loading states for each section
- Home feed API: `GET /api/home/feed` returns all sections in one call

**Backend endpoint** (`home.controller.ts`):
- Aggregates: today's quote, user streak, trending content, upcoming events, featured podcasts, recommended courses
- Single API call to reduce mobile network requests

**Test**:
- Component: Each widget renders with mock data
- Snapshot: Home screen layout matches design
- Performance: Smooth scrolling at 60fps

---

#### 5.2.3 Task: User Profile CRUD

**What**: Profile screen showing user stats and edit capability.

**Profile Screen sections**:
1. Avatar (with camera/gallery picker for changing)
2. Name (editable)
3. Phone (display only)
4. Stats row: Total Sessions | Total Hours | Longest Streak
5. Membership status badge (Free/Premium)
6. Settings list: Notification Preferences, Theme (Light/Dark), Meditation Sounds, About, Logout

**API Endpoints**:
- `GET /api/users/me` - Fetch profile with stats
- `PATCH /api/users/me` - Update name, avatar_url, settings

**Test**:
- Unit: Profile data formatting
- Integration: Profile fetch/update API
- Component: Profile screen renders correctly, edit flow works

---

#### 5.2.4 Task: Admin Panel Scaffold

**What**: Initialize the React.js admin panel with Vite, Tailwind, Shadcn/UI, and basic layout.

**Steps**:
1. Create Vite project: `npm create vite@latest admin -- --template react-ts`
2. Install Tailwind CSS, configure with same design tokens as mobile
3. Install and initialize Shadcn/UI components (Button, Input, Table, Dialog, Card, Tabs, Select, Badge, Dropdown, Toast)
4. Create layout components:
   - `Sidebar.tsx`: Navigation links for all admin pages
   - `Header.tsx`: Admin name, logout button
   - `PageWrapper.tsx`: Consistent page padding and title
5. Create placeholder pages for all admin sections (Dashboard, Users, Courses, Lessons, Content, Events, Quotes, Notifications, Subscriptions, Settings)
6. Set up React Router v7 with nested layouts
7. Admin auth: Login page with email/password via Supabase Auth (separate from mobile OTP)
8. Protected routes: Redirect to login if not authenticated as admin

**Test**:
- Admin panel builds and runs on localhost
- Navigation between all pages works
- Login flow authenticates against Supabase
- Protected routes redirect unauthenticated users

---

#### 5.2.5 Task: Supabase RLS Policies Verification

**What**: Systematically test every RLS policy to ensure security.

**Test Matrix**:
| Table | Operation | As User (own data) | As User (other's data) | As Admin | Expected |
|-------|-----------|-------------------|----------------------|----------|----------|
| users | SELECT | Allow | Deny | Allow | Pass |
| users | UPDATE | Allow | Deny | Allow | Pass |
| courses | SELECT | Allow | Allow | Allow | Pass |
| courses | INSERT | Deny | Deny | Allow | Pass |
| enrollments | SELECT | Allow | Deny | Allow | Pass |
| enrollments | INSERT | Allow | Deny | Allow | Pass |
| ... | ... | ... | ... | ... | ... |

Write integration tests that verify each policy using different Supabase client contexts.

---

### Phase 1 Completion Criteria

- [ ] React Native app builds on iOS and Android
- [ ] User can log in with phone OTP
- [ ] User completes onboarding (interests + goal)
- [ ] Home screen displays with mock data sections
- [ ] User can view and edit their profile
- [ ] Admin panel scaffold runs with all placeholder pages
- [ ] All 13 database tables created with RLS policies
- [ ] CI/CD pipeline runs lint + tests on PR
- [ ] All unit and integration tests passing
- [ ] Code coverage >70% for auth module
- [ ] Phase 1 documentation written (docs/phases/PHASE_1_FOUNDATION.md)

---

## 6. Phase 2: Core Features (Weeks 5-10)

### Goal
Build the primary user-facing features: course browsing and playback, meditation timer with tracking, habit/streak system, content directory, events, and push notifications. Admin panel gets content management capabilities.

---

### Sprint 3 (Week 5-6): Courses, Lessons, Player, Admin Content Management

#### 6.3.1 Courses Module (Mobile)

**Course Listing Screen** (`CoursesScreen.tsx`):
- Grid/list toggle view
- Filter pills: All, Beginner, Intermediate, Advanced, Free, Premium
- Category filters: Meditation, Yoga, Pranayama, Chanting, Mindfulness
- Sort: Popular, Newest, Duration
- Pull-to-refresh, infinite scroll pagination
- React Query: `useQuery(['courses', filters], fetchCourses)`

**Course Detail Screen** (`CourseDetailScreen.tsx`):
- Hero image/video preview
- Title, instructor name and avatar, difficulty badge
- Description (expandable)
- Lesson list with duration per lesson, checkmarks for completed
- Total duration, total lessons count
- "Enroll" / "Continue" / "Premium" button based on state
- Progress bar if enrolled

**Lesson Player Screen** (`LessonScreen.tsx`):
- Full-screen video player (react-native-video) for video lessons
- Audio player (react-native-track-player) for audio lessons
- Controls: play/pause, seek, playback speed (0.5x, 1x, 1.25x, 1.5x, 2x)
- Background playback support for audio
- Lock screen controls
- Auto-advance to next lesson
- On completion: update enrollment progress

**API Endpoints**:
- `GET /api/courses` - List with pagination, filters, sorting
- `GET /api/courses/:id` - Detail with lessons array
- `POST /api/courses/:id/enroll` - Create enrollment record
- `PATCH /api/enrollments/:id/progress` - Update current_lesson_id, progress_pct

**React Query Hooks**:
- `useCourses(filters)` - Paginated course list
- `useCourse(id)` - Single course with lessons
- `useEnrollment(courseId)` - User's enrollment for a course
- `useEnrollMutation()` - Enroll in course
- `useUpdateProgressMutation()` - Update progress

**Test**:
- Unit: Course filter logic, progress calculation
- Integration: Course CRUD API, enrollment flow
- Component: CourseCard, LessonItem render correctly
- E2E: Full flow - browse > enroll > play lesson > progress updates

---

#### 6.3.2 Admin Content & Course Management

**Admin Courses Page** (`CoursesPage.tsx`):
- Data table: title, instructor, difficulty, lessons count, enrollments, status, actions
- Create/Edit course modal with form: title, description, thumbnail upload, difficulty, category, is_premium, order
- Publish/unpublish toggle
- Delete with confirmation

**Admin Lessons Page** (`LessonsPage.tsx`):
- Nested under course - select course first
- Drag-and-drop lesson reordering
- Create/Edit lesson modal: title, media file upload (video/audio), duration, order
- Media upload to Cloudflare R2 via backend storage service
- Preview link

**Test**: Admin CRUD operations for courses and lessons work correctly

---

### Sprint 4 (Week 7-8): Meditation Timer, Habit Tracking, Quotes

#### 6.4.1 Meditation Timer Screen

**What**: Full-screen meditation experience with timer, ambient sounds, and session logging.

**UI Design**:
- Dark/muted background (gradient: dark green to near-black)
- Large circular timer display (mm:ss format)
- Breathing animation: pulsing circle that guides breathing rhythm
- Duration presets: 3, 5, 10, 15, 20, 30 min (or custom)
- Ambient sound picker: Nature, Rain, Ocean, Birds, Singing Bowl, Silence
- Start/Pause/Stop controls
- Session type selector: Free meditation, Guided, Breathing exercise

**Implementation**:
- `meditationStore.ts`: Timer state (remaining, isRunning, selectedDuration, selectedSound)
- Background timer that works when app is backgrounded
- Gentle bell sound at session end
- On completion: POST `/api/sessions` with duration, type, started_at
- Automatic habit check-in after session completion

**API**:
- `POST /api/sessions` - Log completed meditation session
- Response includes updated streak info

**Test**:
- Unit: Timer countdown logic, duration formatting
- Component: Timer display, sound picker render
- Integration: Session logging API saves correctly
- Edge case: App backgrounded during meditation, timer continues

---

#### 6.4.2 Habit Tracking & Streak System

**Backend Streak Logic** (`streak.service.ts`):
```
When user completes a session or checks in:
1. Get today's date in user's timezone
2. Check if habit_log exists for today
3. If NO log today:
   a. Get yesterday's log
   b. If yesterday has a log: streak_count = yesterday.streak_count + 1
   c. If no yesterday log: streak_count = 1
   d. INSERT habit_log (user_id, log_date, meditation_done, streak_count)
4. If log exists: update meditation_done = true (if not already)
5. Return current streak_count
```

**PostgreSQL Function** (`016_create_functions.sql`):
```sql
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS TABLE (
  current_streak INTEGER,
  longest_streak INTEGER,
  total_sessions BIGINT,
  total_minutes BIGINT
) AS $$
  -- Implementation using window functions on habit_logs
$$ LANGUAGE sql STABLE;
```

**Nightly Cron Edge Function** (`streak-reset/index.ts`):
- Runs at midnight UTC
- Verifies streak integrity for all users
- Handles timezone edge cases

**Journey Dashboard Screen** (`JourneyScreen.tsx`):
- Current streak (large number with fire emoji visual)
- Longest streak record
- 7-day calendar (dots showing meditation days)
- Monthly heatmap (contribution graph style)
- Stats: Total sessions, Total minutes, Average session duration
- Weekly trend chart (bar chart of daily minutes)
- Daily check-in card: "Did you meditate today?" with mood selector

**API**:
- `GET /api/habits/streak` - Current streak + stats
- `POST /api/habits/checkin` - Manual daily check-in with mood

**Test**:
- Unit: Streak calculation (consecutive days, broken streak, new streak)
- Integration: Streak API returns correct values after session/checkin
- Edge case: Timezone boundaries, midnight crossover, first-time user

---

#### 6.4.3 Daily Quotes System

**Backend**:
- `GET /api/home/feed` includes today's quote (matched by date)
- Admin: CRUD for quotes with date, text, author, category

**Admin Quotes Page** (`QuotesPage.tsx`):
- Data table with date, quote preview, author, category
- Bulk upload via CSV
- Schedule quotes by date
- Category filters: Wisdom, Motivation, Peace, Gratitude, Spiritual

**Test**: Quote appears on home screen, matches today's date

---

### Sprint 5 (Week 9-10): Content Directory, Events, Push Notifications

#### 6.5.1 Content Directory

**Directory Screen** (`ContentDirectoryScreen.tsx`):
- Search bar with debounced full-text search
- Category tabs: All, Videos, Audio, Articles
- Tag-based filtering
- Grid view of content cards with type icon, title, duration, premium badge
- Tapping opens unified media player
- Premium content shows lock icon for free users

**API**: `GET /api/directory?q=search&category=video&tags=meditation&page=1`

---

#### 6.5.2 Events Module

**Events Screen** (`EventsScreen.tsx`):
- Upcoming events list sorted by date
- Event card: image, title, date/time, instructor, registered count
- "Register" button (one-tap, idempotent)

**Event Detail Screen** (`EventDetailScreen.tsx`):
- Full event info: description, instructor bio, schedule
- Register/Unregister CTA
- "Add to Calendar" integration
- If live: "Join Live" button linking to stream

**API**:
- `GET /api/events` - List upcoming events
- `POST /api/events/:id/register` - Register for event
- `GET /api/events/:id/stream` - Get live stream URL (registered users only)

**Admin Events Page**: CRUD for events with date picker, stream URL, registrations list

---

#### 6.5.3 Push Notifications (FCM)

**Setup**:
1. Create Firebase project, add iOS + Android apps
2. Install `@react-native-firebase/app` + `@react-native-firebase/messaging`
3. Configure APNs (iOS) and FCM (Android)
4. On app launch: request permission, get FCM token, store in user profile
5. Backend: `firebase-admin` SDK for sending notifications

**Notification Types**:
- Daily meditation reminder (scheduled by user preference)
- Streak at risk (no meditation logged by 8 PM)
- New content published
- Event reminder (1 hour before registered event)
- Event going live

**Admin Notification Page**: Send broadcast or targeted push with title, body, optional deep link

**Test**: FCM token registration, notification delivery to test device

---

### Phase 2 Completion Criteria

- [ ] User can browse, filter, enroll in courses
- [ ] Video and audio lesson player works with background playback
- [ ] Course progress tracking (resume from last lesson)
- [ ] Meditation timer with ambient sounds and session logging
- [ ] Streak system accurately tracks consecutive meditation days
- [ ] Journey dashboard shows stats, heatmap, weekly trends
- [ ] Content directory with search and filters
- [ ] Event listing, registration, and live stream access
- [ ] Push notifications configured and deliverable
- [ ] Admin panel manages courses, lessons, content, events, quotes, notifications
- [ ] All tests passing, coverage >70% for business logic
- [ ] Phase 2 documentation written (docs/phases/PHASE_2_CORE_FEATURES.md)

---

## 7. Phase 3: Monetization & Polish (Weeks 11-14)

### Goal
Implement payment processing, subscription management, premium content gating, live event streaming, offline downloads, performance optimization, and error monitoring.

---

### Sprint 6 (Week 11-12): Payments, Subscriptions, Premium Gating

#### 7.6.1 Payment Integration (Razorpay)

**What**: Integrate Razorpay for Indian payments (UPI, cards, wallets, net banking).

**Backend Flow**:
1. `POST /api/payments/create-order`:
   - Validate subscription plan (monthly/annual)
   - Create Razorpay order via Razorpay SDK
   - Store pending payment in `payments` table
   - Return order_id to mobile
2. `POST /api/payments/verify`:
   - Receive Razorpay payment callback (razorpay_order_id, razorpay_payment_id, razorpay_signature)
   - Verify signature using Razorpay secret
   - Update payment status to 'completed'
   - Create/update subscription record (plan_type, status: 'active', started_at, expires_at)
   - Return success with subscription details

**Razorpay Webhook Edge Function** (`payment-webhook/index.ts`):
- Handles asynchronous payment events (payment.captured, payment.failed, subscription.cancelled)
- Updates payment and subscription status
- Signature verification for webhook security

**Mobile Payment Flow**:
1. User selects plan on PaywallScreen
2. App calls `POST /api/payments/create-order`
3. Opens Razorpay checkout modal (react-native-razorpay)
4. On success: calls `POST /api/payments/verify` with callback data
5. On failure: shows error message, allows retry
6. On success verification: update local subscription state, unlock premium content

**Subscription Plans**:
| Plan | Price | Duration | Razorpay Plan ID |
|------|-------|----------|-----------------|
| Free | INR 0 | Forever | N/A |
| Monthly Premium | INR 199 | 30 days | plan_monthly_199 |
| Annual Premium | INR 1,499 | 365 days | plan_annual_1499 |

**Test**:
- Unit: Signature verification, expiry date calculation
- Integration: Create order + verify flow with Razorpay test mode
- Edge case: Duplicate payments, expired subscriptions, webhook retries

---

#### 7.6.2 Premium Content Gating

**What**: Gate premium content behind subscription check.

**Implementation**:
1. Backend middleware `subscription.middleware.ts`:
   - Check user's active subscription before serving premium content
   - Return 403 with `PREMIUM_REQUIRED` error code if no active subscription
2. Apply to routes:
   - Premium course enrollment
   - Premium content directory items
   - Event replay access
   - Offline download requests
3. Mobile: `useSubscription()` hook provides `isPremium` boolean
4. UI treatment:
   - Lock icon overlay on premium content cards
   - "Upgrade to Premium" CTA replacing action buttons
   - Paywall screen with plan comparison

---

#### 7.6.3 Paywall & Subscription Screens

**PaywallScreen.tsx**:
- Feature comparison table (Free vs Premium)
- Monthly and Annual plan cards with pricing
- "Save 37%" badge on annual plan
- "Start 7-day free trial" option
- Payment button triggers Razorpay checkout

**SubscriptionScreen.tsx** (in Profile):
- Current plan badge
- Expiry date
- Billing history (list of payments)
- Upgrade/Cancel buttons
- Plan change logic

**Admin Subscription Analytics**: Revenue dashboard, active subscriptions count, churn rate, conversion funnel

---

### Sprint 7 (Week 13-14): Live Streaming, Offline, Performance, Sentry

#### 7.7.1 Live Event Streaming

**What**: In-app live video streaming for events.

**Implementation**:
- Stream URL stored in events table (Cloudflare Stream or YouTube Live)
- `GET /api/events/:id/stream` returns signed stream URL (registered users only)
- Mobile: react-native-video plays HLS stream
- Live indicator badge on event card
- Real-time participant count via Supabase Realtime

---

#### 7.7.2 Offline Content Downloads (Premium)

**What**: Allow premium users to download content for offline access.

**Implementation**:
- Download manager using react-native-fs
- Download queue with progress tracking
- Store downloaded files in app's document directory
- Track downloads in local SQLite/MMKV storage
- Premium limit: 25 items (monthly), unlimited (annual)
- Auto-expire downloads when subscription lapses

---

#### 7.7.3 Performance Optimization

**Checklist**:
- [ ] FlatList virtualization on all lists (windowSize, maxToRenderPerBatch)
- [ ] Image optimization: WebP format, FastImage caching
- [ ] React.memo on heavy components
- [ ] useMemo/useCallback for expensive computations
- [ ] Bundle analysis with react-native-bundle-visualizer
- [ ] Hermes engine enabled (should be default in 0.76+)
- [ ] Remove console.log in production builds
- [ ] API response compression (gzip)
- [ ] Cold start time measurement (target: <3s on mid-range)

---

#### 7.7.4 Sentry Integration

**What**: Real-time crash reporting and performance monitoring.

**Setup**:
1. Install `@sentry/react-native`
2. Configure with DSN in both iOS and Android
3. Source map upload in CI/CD
4. Set up performance tracing for screen transitions and API calls
5. Add breadcrumbs for user actions (navigation, button taps, API calls)
6. Configure alerts for crash spike

---

### Phase 3 Completion Criteria

- [ ] Razorpay payment flow works end-to-end in test mode
- [ ] Subscription management (create, view, cancel)
- [ ] Premium content properly gated
- [ ] Paywall screen with plan comparison
- [ ] Live event streaming works for registered users
- [ ] Offline downloads working for premium users
- [ ] Performance targets met (cold start <3s, 60fps scrolling)
- [ ] Sentry capturing crashes and performance data
- [ ] Admin analytics dashboard shows subscription metrics
- [ ] All tests passing
- [ ] Phase 3 documentation written (docs/phases/PHASE_3_MONETIZATION.md)

---

## 8. Phase 4: Testing & Launch (Weeks 15-18)

### Goal
Comprehensive QA, beta testing, bug fixes, app store preparation, and production launch.

---

### Sprint 8 (Week 15-16): QA Testing, Bug Fixes, Beta

#### 8.8.1 Comprehensive QA Testing

**Test Coverage Requirements**:
| Area | Unit Tests | Integration Tests | E2E Tests |
|------|-----------|------------------|-----------|
| Auth (OTP) | Phone validation, token handling | Full login flow | Login > Onboarding |
| Courses | Filter logic, progress calc | CRUD API, enrollment | Browse > Enroll > Play |
| Meditation | Timer logic, streak calc | Session logging API | Timer > Complete > Streak |
| Payments | Signature verify, expiry calc | Payment flow (test mode) | Subscribe > Unlock |
| Events | Date formatting | Registration API | Register > Join Live |
| Admin | N/A | All CRUD endpoints | Content upload workflow |

**Device Testing Matrix**:
| Device | OS Version | Screen Size | Priority |
|--------|-----------|-------------|----------|
| Samsung Galaxy A14 | Android 13 | 6.6" HD+ | High (target mid-range) |
| Pixel 7 | Android 14 | 6.3" FHD+ | High |
| iPhone 13 | iOS 16 | 6.1" | High |
| iPhone SE 3 | iOS 17 | 4.7" | Medium (small screen) |
| OnePlus Nord | Android 12 | 6.44" FHD+ | Medium |
| iPad Air | iPadOS 17 | 10.9" | Low (tablet) |

---

#### 8.8.2 Beta Testing

- Distribute via Fastlane: TestFlight (iOS) + Firebase App Distribution (Android)
- 50-100 beta testers from team + friends/family
- Feedback collection via Google Forms or in-app feedback widget
- Track issues in GitHub Issues
- Prioritize: P0 (crashes, data loss), P1 (broken flows), P2 (UI issues), P3 (nice-to-have)

---

### Sprint 9 (Week 17-18): Final Fixes, App Store Submission, Launch

#### 8.9.1 App Store Listing Preparation

**App Store (iOS)**:
- App name: "MAM - Meditation & Wellness"
- Subtitle: "Daily meditation, yoga & spiritual growth"
- Screenshots: 6.7" (iPhone 14 Pro Max) + 5.5" (iPhone 8 Plus)
- App preview video (optional, 30s)
- Keywords, description, privacy policy URL
- App Review notes with test account credentials

**Play Store (Android)**:
- Title, short description (80 chars), full description (4000 chars)
- Feature graphic (1024x500)
- Screenshots: phone + tablet
- Content rating questionnaire
- Privacy policy URL
- Target SDK level compliance

#### 8.9.2 Production Deployment

1. Create production Supabase project
2. Run all migrations on production database
3. Configure production environment variables
4. Deploy admin panel to Vercel production
5. Submit iOS app to App Store Connect
6. Submit Android app to Google Play Console
7. Set up monitoring: Sentry alerts, Supabase monitoring, Cloudflare analytics

---

### Phase 4 Completion Criteria

- [ ] All P0 and P1 bugs fixed
- [ ] Beta feedback addressed
- [ ] E2E tests pass on all critical flows
- [ ] Crash-free session rate >99.5%
- [ ] Cold start <3s on mid-range devices
- [ ] App store listings complete with screenshots and descriptions
- [ ] Production database migrated and seeded
- [ ] Admin panel deployed to production
- [ ] iOS app submitted to App Store
- [ ] Android app submitted to Play Store
- [ ] Sentry monitoring active
- [ ] Launch monitoring dashboard set up
- [ ] Phase 4 documentation written (docs/phases/PHASE_4_LAUNCH.md)
- [ ] Full project documentation complete for interview reference

---

## 9. Database Schema Reference

### 9.1 Complete DDL

```sql
-- 001: Users
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  onboarding_complete BOOLEAN DEFAULT false,
  meditation_goal_minutes INTEGER DEFAULT 10,
  interests TEXT[] DEFAULT '{}',
  notification_enabled BOOLEAN DEFAULT true,
  fcm_token TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 002: Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  instructor_id UUID REFERENCES public.users(id),
  instructor_name TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category TEXT CHECK (category IN ('meditation', 'yoga', 'pranayama', 'chanting', 'mindfulness', 'sleep', 'stress')),
  is_premium BOOLEAN DEFAULT false,
  total_duration_seconds INTEGER DEFAULT 0,
  lesson_count INTEGER DEFAULT 0,
  enrollment_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 003: Lessons
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('video', 'audio')),
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 004: Enrollments
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  current_lesson_id UUID REFERENCES public.lessons(id),
  progress_pct DECIMAL(5,2) DEFAULT 0.00,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- 005: Meditation Sessions
CREATE TABLE public.meditation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL,
  type TEXT CHECK (type IN ('free', 'guided', 'breathing', 'body_scan', 'walking')),
  ambient_sound TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 006: Habit Logs
CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  meditation_done BOOLEAN DEFAULT false,
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'low', 'bad')),
  streak_count INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, log_date)
);

-- 007: Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  stream_url TEXT,
  instructor_id UUID REFERENCES public.users(id),
  instructor_name TEXT,
  is_live BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  max_participants INTEGER,
  registration_count INTEGER DEFAULT 0,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 008: Event Registrations
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- 009: Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'monthly', 'annual')),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'grace_period')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  gateway_id TEXT,
  gateway_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 010: Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  gateway TEXT CHECK (gateway IN ('razorpay', 'stripe')),
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  gateway_signature TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 011: Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT CHECK (type IN ('reminder', 'streak', 'event', 'content', 'system')),
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- 012: Daily Quotes
CREATE TABLE public.daily_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_text TEXT NOT NULL,
  author TEXT,
  date DATE UNIQUE,
  category TEXT CHECK (category IN ('wisdom', 'motivation', 'peace', 'gratitude', 'spiritual')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 013: Content Directory
CREATE TABLE public.content_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('video', 'audio', 'article')),
  media_url TEXT,
  thumbnail_url TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  duration_seconds INTEGER,
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 10. API Endpoint Reference

| Method | Endpoint | Description | Auth | Sprint |
|--------|----------|-------------|------|--------|
| POST | /api/auth/request-otp | Send OTP to phone | No | 1 |
| POST | /api/auth/verify-otp | Verify OTP, get JWT | No | 1 |
| GET | /api/users/me | Get current user profile | Yes | 2 |
| PATCH | /api/users/me | Update profile | Yes | 2 |
| GET | /api/home/feed | Home screen data | Yes | 2 |
| GET | /api/courses | List courses with filters | Yes | 3 |
| GET | /api/courses/:id | Course detail with lessons | Yes | 3 |
| POST | /api/courses/:id/enroll | Enroll in course | Yes | 3 |
| PATCH | /api/enrollments/:id/progress | Update progress | Yes | 3 |
| POST | /api/sessions | Log meditation session | Yes | 4 |
| GET | /api/habits/streak | Get streak and stats | Yes | 4 |
| POST | /api/habits/checkin | Daily check-in | Yes | 4 |
| GET | /api/directory | Browse content | Yes | 5 |
| GET | /api/events | List events | Yes | 5 |
| POST | /api/events/:id/register | Register for event | Yes | 5 |
| GET | /api/events/:id/stream | Get stream URL | Yes | 5 |
| POST | /api/payments/create-order | Create Razorpay order | Yes | 6 |
| POST | /api/payments/verify | Verify payment | Yes | 6 |
| GET | /api/subscriptions/status | Check subscription | Yes | 6 |
| GET | /api/notifications | List notifications | Yes | 5 |
| POST | /api/admin/* | Admin CRUD endpoints | Admin | 2-7 |

---

## 11. Testing Strategy

### 11.1 Test Pyramid

```
        /  E2E  \           <- 10% of tests (Detox/Maestro)
       / Integration \       <- 30% of tests (Jest + Supertest)
      /  Unit Tests    \     <- 60% of tests (Jest)
```

### 11.2 Coverage Requirements

| Module | Minimum Coverage | Tools |
|--------|-----------------|-------|
| Auth logic | 90% | Jest |
| Streak calculation | 95% | Jest |
| Payment verification | 90% | Jest |
| API controllers | 80% | Jest + Supertest |
| React hooks | 70% | React Testing Library |
| UI components | 60% | React Native Testing Library |
| Overall business logic | 70% | All |

### 11.3 Test Commands

```bash
# Mobile
cd mobile && npm test                    # Run all tests
cd mobile && npm test -- --coverage      # With coverage report
cd mobile && npm test -- --watch         # Watch mode

# Backend
cd backend && npm test                   # Run all tests
cd backend && npm run test:integration   # Integration tests only

# Admin
cd admin && npm test                     # Run all tests
```

---

## 12. Documentation Protocol

### 12.1 Phase Documentation Template

After each phase is completed and all tests pass, create `docs/phases/PHASE_X_*.md` with:

1. **Phase Overview**: What was built and why
2. **Architecture Decisions**: Key technical choices made and rationale
3. **Implementation Details**: Per-feature walkthrough of how each feature works
4. **File Structure**: New files/directories created in this phase
5. **API Endpoints Added**: Full documentation of new endpoints with request/response examples
6. **Database Changes**: New tables, columns, indexes, functions added
7. **Testing Summary**: Test count, coverage, key test scenarios
8. **Challenges & Solutions**: Problems encountered and how they were solved
9. **Screenshots/Recordings**: Visual proof of working features
10. **Interview Talking Points**: Key concepts demonstrated (for interview prep)

### 12.2 Interview-Ready Talking Points (Built Per Phase)

Each phase doc should include a section of things you can discuss in interviews:
- **Phase 1**: OTP authentication design, JWT token management, Supabase RLS, React Navigation architecture
- **Phase 2**: Media player implementation, streak algorithm design, React Query caching strategy, real-time data with Supabase
- **Phase 3**: Payment gateway integration, subscription lifecycle management, premium content gating patterns, performance optimization techniques
- **Phase 4**: E2E testing strategy, CI/CD pipeline design, app store submission process, production monitoring setup

---

## Appendix: Quick Reference

### Environment Variables (.env.example)

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx

# Firebase (Admin SDK)
FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_R2_ACCESS_KEY=xxx
CLOUDFLARE_R2_SECRET_KEY=xxx
CLOUDFLARE_R2_BUCKET=mam-media

# OTP Service
OTP_SERVICE_API_KEY=xxx
OTP_SERVICE_SENDER_ID=MAMAPP

# Sentry
SENTRY_DSN=xxx

# Client URLs
ADMIN_URL=http://localhost:5173
MOBILE_DEEP_LINK_PREFIX=mamapp://
```

---

*This document is the single source of truth for the MAM project implementation. Update it as decisions change. Each phase's detailed post-completion documentation lives in `docs/phases/`.*
