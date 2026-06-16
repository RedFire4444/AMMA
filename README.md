<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.84-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

<h1 align="center">MAA - Meditation & Wellness</h1>

<p align="center">
  <strong>A cross-platform spiritual wellness and meditation app for the Indian subcontinent</strong>
</p>

<p align="center">
  <a href="docs/REQUIREMENTS.md"><strong>Setup Requirements</strong></a> &bull;
  <a href="https://www.figma.com/design/MmkzprPAIwQqfE02uVnAxp/MAM-App?t=tFvRPOA0dhLK7We8-1">Figma Designs</a> &bull;
  <a href="docs/IMPLEMENTATION_PLAN.md">Implementation Plan</a> &bull;
  <a href="docs/api/API_REFERENCE.md">API Reference</a> &bull;
  <a href="docs/PROJECT_SUMMARY.md">Project Summary</a>
</p>

<p align="center">
  <strong>👉 New to the project? Start here: <a href="docs/REQUIREMENTS.md">docs/REQUIREMENTS.md</a></strong> — every tool, file, and command you need.
</p>

<p align="center">
  <img src="https://github.com/ninjacode911/Project-MAM/actions/workflows/ci.yml/badge.svg" alt="CI Status" />
</p>

---

## About

**MAA** (Mata Amritanandamayi App) is a spiritual wellness mobile application that combines traditional Indian meditation practices with modern habit-tracking technology. Unlike Western-centric apps like Calm or Headspace, MAA offers culturally relevant content including guided meditations, yoga, pranayama, bhajans, satsangs, and chanting at accessible pricing for the Indian market.

Built as an EDAI 6 group project, the application consists of three interconnected systems: a React Native mobile app (iOS + Android), a Node.js/Express backend API, and a React.js admin panel.

---

## Features

### For Users

| Feature | Description |
|---------|-------------|
| **Multi-Method Authentication** | Phone OTP, Email/Password, and Google OAuth sign-in |
| **Personalized Onboarding** | 3-screen flow to set interests (8 categories) and daily meditation goal |
| **Course Library** | Browse, filter, enroll in structured meditation and yoga courses |
| **Lesson Player** | Video/audio player with playback speed control (0.5x-2x), progress tracking |
| **Meditation Timer** | Full-screen dark UI with breathing animation, ambient sounds (Nature, Rain, Ocean, Birds, Singing Bowl), and session logging |
| **Multi-Habit Tracking** | Track 4+ daily habits (Meditation, Exercise, Cold Shower, Early Wakeup) with monthly heatmap grids and streak counts |
| **Journey Dashboard** | Performance tracker, daily affirmation, vision board, day journey (time-based activities) |
| **Content Directory** | Search bhajans, meditations, satsangs with bookmarks, view counts, and persistent mini audio player |
| **Live Events** | Browse upcoming events, one-tap registration, live stream access |
| **Premium Subscriptions** | Monthly (INR 199) and Annual (INR 1,499) plans via Razorpay with premium content gating |
| **Profile & Stats** | 6-card stats grid, user levels, billing history, account management |

### For Admins

| Feature | Description |
|---------|-------------|
| **Dashboard** | Analytics overview with key metrics |
| **Course Management** | Create, edit, publish/unpublish courses and lessons |
| **Content Management** | Upload and organize bhajans, meditations, satsangs |
| **Event Management** | Schedule events, manage registrations, set stream URLs |
| **Quote Management** | CRUD daily spiritual quotes with date scheduling |
| **Notification Dispatch** | Send broadcast or targeted push notifications |
| **Subscription Analytics** | Revenue charts, conversion funnel, plan distribution, churn rate |
| **User Management** | View, search, and manage user accounts |

---

## Tech Stack

### Mobile App
```
React Native 0.84 (CLI) + TypeScript 5.8
NativeWind 4.0 (Tailwind CSS)     React Navigation 7
Zustand 5.0 (State)               Supabase JS 2.101
react-native-keychain (Auth)      react-native-reanimated (Animations)
```

### Backend API
```
Node.js 22 + Express 4.18 + TypeScript
Supabase (PostgreSQL + Auth + Storage + Edge Functions)
Zod (Validation)                   Helmet + CORS (Security)
express-rate-limit (Rate Limiting) Winston (Logging)
```

### Admin Panel
```
React 18 + Vite 5.4 + TypeScript
Tailwind CSS 3.4                   Lucide React (Icons)
React Router 7                     Supabase JS (Auth + Data)
```

### Database
```
PostgreSQL via Supabase            20 migration files
Row Level Security (RLS)           3 PostgreSQL functions
15+ performance indexes            Seed data included
```

### Infrastructure
```
GitHub Actions (CI/CD)             Sentry (Error Monitoring)
Cloudflare R2 (Media Storage)      Razorpay (Payments)
Firebase Cloud Messaging (Push)    Vercel (Admin Hosting)
```

---

## Architecture

```
                    +------------------+
                    |   Mobile App     |
                    | React Native CLI |
                    +--------+---------+
                             |
                     HTTPS / JSON
                             |
+------------------+         |         +------------------+
|   Admin Panel    |         |         |   External APIs  |
|  React.js/Vite   +----+   |   +-----+  Razorpay, FCM   |
+------------------+    |   |   |     +------------------+
                        v   v   v
                   +----+---+---+----+
                   |  Express.js API  |
                   |  38 endpoints    |
                   |  7 middleware    |
                   +--------+--------+
                            |
              +-------------+-------------+
              |                           |
     +--------+--------+        +--------+--------+
     |   PostgreSQL     |        | Cloudflare R2   |
     |   (Supabase)     |        | Media Storage   |
     |   20 tables      |        |                 |
     |   RLS policies   |        |                 |
     +-----------------+        +-----------------+
```

---

## Project Structure

```
MAA-Project/
├── mobile/                          React Native mobile app
│   ├── src/
│   │   ├── screens/                 17 screen components
│   │   ├── components/              10 reusable components
│   │   │   ├── course/              CourseCard, LessonItem
│   │   │   ├── journey/             HabitGrid, StreakBadge
│   │   │   ├── meditation/          TimerCircle
│   │   │   ├── directory/           ContentCard, MiniPlayer
│   │   │   ├── premium/             PremiumLock
│   │   │   └── shared/              ErrorBoundary, CustomTabBar
│   │   ├── navigation/              React Navigation setup
│   │   ├── services/                11 API service modules
│   │   ├── store/                   Zustand stores (auth, meditation)
│   │   ├── hooks/                   useSubscription
│   │   ├── types/                   TypeScript definitions
│   │   ├── utils/                   Performance, Sentry, formatters
│   │   └── theme/                   Design tokens
│   ├── e2e/                         6 Maestro E2E test specs
│   └── __tests__/                   20 Jest test files
│
├── MAA-Meditation-App/MAA-Project/
│   ├── backend/                     Node.js + Express API
│   │   ├── src/
│   │   │   ├── controllers/         11 controller modules
│   │   │   ├── routes/              11 route modules
│   │   │   ├── middleware/          7 middleware (auth, admin, rate-limit, etc.)
│   │   │   ├── services/            6 service modules
│   │   │   ├── validators/          8 Zod validation schemas
│   │   │   └── utils/               API response, config, logger
│   │   ├── supabase/
│   │   │   ├── migrations/          20 SQL migration files
│   │   │   └── seed.sql             Sample data
│   │   └── tests/                   12 Jest test files
│   │
│   └── admin/                       React.js Admin Panel (Vite)
│       └── src/
│           ├── pages/               11 admin pages
│           ├── components/layout/   Sidebar, AdminLayout, ProtectedRoute
│           └── services/            12 service modules
│
├── docs/                            Project documentation
│   ├── IMPLEMENTATION_PLAN.md       Master plan (75K)
│   ├── PROGRESS_TRACKER.md          Sprint tracking (56/56 tasks)
│   ├── PROJECT_SUMMARY.md           Final project stats
│   ├── TEAM_ASSIGNMENTS.md          Per-member task breakdown
│   ├── USER_FLOWS.md                13 Mermaid flow diagrams
│   ├── DESIGN_UPDATES.md            Post-Figma changes
│   ├── api/API_REFERENCE.md         38 endpoint docs
│   ├── phases/                      4 detailed phase documents
│   ├── app-store/                   iOS + Android listing docs
│   ├── legal/                       Privacy Policy + Terms of Service
│   └── deployment/                  Production checklist + env setup + monitoring
│
└── .github/workflows/               CI/CD pipelines
    ├── ci.yml                       Mobile lint + type-check + test
    ├── backend-ci.yml               Backend type-check + test
    └── admin-ci.yml                 Admin build verification
```

---

## Design System

| Element | Value |
|---------|-------|
| **Primary** | `#1B4332` (Forest Green) |
| **Secondary** | `#2D6A4F` (Medium Green) |
| **Accent** | `#40916C` (Soft Green) |
| **Background** | `#FAFAF5` (Warm Off-White) |
| **Surface** | `#FFFFFF` (White) |
| **Body Font** | Inter |
| **Heading Font** | Playfair Display |
| **Border Radius** | 12px cards, 8px buttons, 24px pills |

### Navigation

```
My Journey | Courses | Home (center) | Directory | Profile
```

---

## Figma Designs

View the complete UI/UX designs:

**[Open Figma File](https://www.figma.com/design/MmkzprPAIwQqfE02uVnAxp/MAM-App?t=tFvRPOA0dhLK7We8-1)**

Screens designed: Welcome, Login, OTP, Onboarding, Home, Courses, Course Detail, Lesson Player, Meditation Timer, My Journey, Content Directory, Events, Profile, Paywall, Subscription.

---

## API Overview

**38 endpoints** across 8 resource groups. Full documentation: [API Reference](docs/api/API_REFERENCE.md)

| Group | Endpoints | Key Operations |
|-------|-----------|----------------|
| Auth | 4 | OTP, email login, signup, Google OAuth |
| Users | 3 | Profile get/update, account delete |
| Home | 1 | Aggregated feed (quote, courses, events, stats) |
| Courses | 6 | List, detail, enroll, progress, reviews |
| Sessions | 1 | Log meditation session |
| Habits | 10 | Multi-habit tracking, streaks, vision board, day journey, performance |
| Directory | 5 | Browse, search, bookmark, view tracking |
| Events | 3 | List, register, stream access |
| Payments | 3 | Create order, verify, history |
| Subscriptions | 2 | Status, cancel |

---

## Database Schema

**20 tables** with Row Level Security:

```
users, courses, lessons, enrollments, meditation_sessions,
habit_logs, events, event_registrations, subscriptions, payments,
notifications, daily_quotes, content_directory, course_reviews,
vision_board, day_journey, performance_ratings, bookmarks
```

**3 PostgreSQL functions**: `calculate_streak`, `get_user_streaks`, `get_habit_stats`

---

## Getting Started

### Prerequisites

- **Node.js 22.11.0 LTS** (pinned in root [`.nvmrc`](.nvmrc))
  - If you use [nvm](https://github.com/nvm-sh/nvm) / [nvm-windows](https://github.com/coreybutler/nvm-windows): run `nvm use` at the repo root and it will install/switch automatically
  - All three sub-projects (mobile, backend, admin) require the same version — mixing Node 20 and Node 22 across folders *will* break installs
- **npm >= 10.0.0** (ships with Node 22)
- React Native CLI development environment ([setup guide](https://reactnative.dev/docs/environment-setup))
- Supabase account ([supabase.com](https://supabase.com))
- iOS: Xcode 15+ (Mac only)
- Android: Android Studio with SDK 34+

### Installation

```bash
# Clone the repository
git clone https://github.com/ninjacode911/Project-MAA.git
cd Project-MAA

# Install mobile dependencies
cd mobile
cp .env.example .env          # REQUIRED — see "Environment Setup" below
npm install

# Install backend dependencies
cd ../MAA-Meditation-App/MAA-Project/backend
npm install

# Install admin dependencies
cd ../admin
npm install
```

> **First-time setup on every laptop**: after cloning, every developer must copy `mobile/.env.example` to `mobile/.env` and set `API_BASE_URL` for their machine. The file is git-ignored on purpose — each laptop/network needs its own value. See the [mobile README](mobile/README.md#step-0-local-setup-first-clone-only) for scenario-specific values.

### Environment Setup

Create `.env` files for each service. See [Environment Setup Guide](docs/deployment/ENVIRONMENT_SETUP.md) for all variables.

```bash
# Backend (.env)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
NODE_ENV=development

# Mobile (.env)  <-- REQUIRED per developer
API_BASE_URL=http://localhost:3000/api    # Pick per scenario (see mobile README)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Admin (.env)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Mobile `API_BASE_URL` — pick the line that matches your setup:**

| Scenario | Value | Extra step |
|---|---|---|
| iOS simulator (Mac) | `http://localhost:3000/api` | — |
| Android emulator (AVD) | `http://10.0.2.2:3000/api` | — |
| Physical Android over USB | `http://localhost:3000/api` | `adb reverse tcp:3000 tcp:3000` |
| Physical phone over Wi-Fi | `http://<laptop-LAN-IP>:3000/api` | Same Wi-Fi as laptop |

### Database Setup

```bash
# Apply all migrations to your Supabase project
cd MAA-Meditation-App/MAA-Project/backend
npx supabase db push

# Load seed data
npx supabase db seed
```

### Running the App

```bash
# Start backend server
cd MAA-Meditation-App/MAA-Project/backend
npm run dev                    # http://localhost:3000

# Start admin panel
cd MAA-Meditation-App/MAA-Project/admin
npm run dev                    # http://localhost:3001

# Start mobile app
cd mobile
npx react-native start        # Metro bundler
npx react-native run-android  # or run-ios

### Running Tests

```bash
# Mobile tests
cd mobile
npm test

# Backend tests
cd MAA-Meditation-App/MAA-Project/backend
npm test
```

---

## Development Phases

| Phase | Duration | Status | Deliverables |
|-------|----------|--------|-------------|
| **Phase 1: Foundation** | Weeks 1-4 | Completed | Auth, onboarding, home, profile, admin scaffold, DB schema, CI/CD |
| **Phase 2: Core Features** | Weeks 5-10 | Completed | Courses, meditation timer, multi-habit tracking, directory, events |
| **Phase 3: Monetization** | Weeks 11-14 | Completed | Payments (Razorpay), subscriptions, premium gating, analytics |
| **Phase 4: Testing & Launch** | Weeks 15-18 | Completed | E2E tests, app store prep, legal docs, deployment guides |

Detailed documentation for each phase: [Phase 1](docs/phases/PHASE_1_FOUNDATION.md) | [Phase 2](docs/phases/PHASE_2_CORE_FEATURES.md) | [Phase 3](docs/phases/PHASE_3_MONETIZATION.md) | [Phase 4](docs/phases/PHASE_4_LAUNCH.md)

---

## Project Stats

| Metric | Count |
|--------|-------|
| Total files | 175+ |
| Lines of code | 22,000+ |
| API endpoints | 38 |
| Database tables | 20 |
| Test files | 38 (20 mobile + 12 backend + 6 E2E) |
| Documentation files | 20+ |
| Database migrations | 20 |
| Sprints completed | 9/9 |
| Tasks completed | 56/56 |

---

## Team

| Name | Role | Focus Areas |
|------|------|-------------|
| **Navnit** | Team Lead | Architecture, code review, documentation, project management |
| **Aayush Tolmare** | Backend | API development, database, Supabase, payments |
| **Krupal Warale** | Backend | Authentication, middleware, Edge Functions, streaks |
| **Lavanya Veni** | Frontend | Mobile screens, navigation, events, directory |
| **Prachi Shirode** | Frontend | Meditation timer, media players, notifications, components |
| **Vineet Wathurkar** | Frontend | Admin panel, dashboards, data tables |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Setup Requirements](docs/REQUIREMENTS.md) | First-time local setup — every tool, file, and command teammates need |
| [Fly.io Deployment](docs/deployment/FLY_DEPLOY.md) | Backend deploy + ops runbook (auto-deploy via GitHub Actions on merge) |
| [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) | Complete 18-week plan with specifications |
| [Progress Tracker](docs/PROGRESS_TRACKER.md) | Sprint-by-sprint task tracking |
| [API Reference](docs/api/API_REFERENCE.md) | All 38 endpoints documented |
| [User Flows](docs/USER_FLOWS.md) | 13 Mermaid diagrams |
| [Team Assignments](docs/TEAM_ASSIGNMENTS.md) | Per-member task breakdown |
| [Design Updates](docs/DESIGN_UPDATES.md) | Post-Figma design changes |
| [Privacy Policy](docs/legal/PRIVACY_POLICY.md) | App privacy policy (data collection + handling) |
| [Security Policy](docs/legal/SECURITY_POLICY.md) | How user data is protected (user-facing) |
| [Vulnerability Disclosure](SECURITY.md) | How to report security vulnerabilities (researchers) |
| [Terms of Service](docs/legal/TERMS_OF_SERVICE.md) | App terms of service |
| [Production Checklist](docs/deployment/PRODUCTION_CHECKLIST.md) | Deployment guide |
| [Environment Setup](docs/deployment/ENVIRONMENT_SETUP.md) | All environment variables |
| [Monitoring Setup](docs/deployment/MONITORING_SETUP.md) | Sentry, Supabase, alerts |

---

## License

This project is developed as part of the EDAI 6 curriculum. All rights reserved.

---

<p align="center">
  <strong>MAA - Meditation & Wellness</strong><br/>
  <em>EDAI 6 Group Project | March - April 2026</em><br/>
  <em>Mata Amritanandamayi App</em>
</p>
