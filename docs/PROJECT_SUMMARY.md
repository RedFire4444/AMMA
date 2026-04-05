# MAM Meditation App — Final Project Summary

> **Project**: MAM Spiritual Wellness & Meditation Application
> **Course**: EDAI 6 — Group Project
> **Team Lead**: Navnit
> **Team**: Prachi Shirode, Aayush Tolmare, Lavanya Veni, Krupal Warale, Vineet Wathurkar
> **Duration**: 18 weeks (4 Phases, 9 Sprints)
> **Completed**: April 2026

---

## Project Overview

MAM (Mata Amritanandamayi Math) is a cross-platform mobile application for spiritual wellness and meditation, targeting the Indian and South Asian market. The app combines traditional meditation practices with modern habit-tracking technology, offering culturally relevant content including guided meditations, yoga, pranayama, bhajans, and satsangs.

### Problem Solved
Existing meditation apps (Calm, Headspace) are Western-centric in approach and pricing. MAM fills the gap with affordable, culturally relevant spiritual content, multi-habit tracking (not just meditation), and community features.

### Key Differentiators
- Indian spiritual content (bhajans, satsangs, pranayama, chanting)
- Multi-habit daily sadhana tracking (meditation, exercise, cold shower, early wakeup)
- Affordable pricing (INR 199/month, INR 1,499/year vs $70/year for Western apps)
- Vision board and day journey for holistic wellness
- Live event streaming for community engagement

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Presentation Layer                 │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  Mobile App   │  │ Admin Panel  │                │
│  │ React Native  │  │  React.js    │                │
│  │   CLI 0.84    │  │  Vite 5.4    │                │
│  └──────┬───────┘  └──────┬───────┘                │
│         │                  │                         │
├─────────┼──────────────────┼─────────────────────────┤
│         │  Business Logic  │                         │
│         │                  │                         │
│  ┌──────┴──────────────────┴───────┐                │
│  │       Node.js + Express API      │                │
│  │   Auth | Courses | Sessions      │                │
│  │   Habits | Events | Payments     │                │
│  └──────────────┬──────────────────┘                │
│                 │                                    │
├─────────────────┼────────────────────────────────────┤
│                 │    Data & Storage                   │
│                                                      │
│  ┌──────────────┐  ┌───────────────┐                │
│  │  PostgreSQL   │  │ Cloudflare R2 │                │
│  │  (Supabase)   │  │ Media Storage │                │
│  │  20 tables    │  │               │                │
│  │  RLS policies │  │               │                │
│  └──────────────┘  └───────────────┘                │
└──────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Mobile App
| Technology | Version | Purpose |
|-----------|---------|---------|
| React Native | 0.84.1 | Cross-platform framework |
| TypeScript | 5.8+ | Type safety |
| NativeWind | 4.0 | Tailwind CSS styling |
| React Navigation | 7.x | Screen navigation |
| Zustand | 5.0 | Client state management |
| Supabase JS | 2.101 | Backend integration |

### Admin Panel
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite 5 | SPA framework |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| React Router 7 | Routing |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js 22 + Express | API server |
| Supabase | Database + Auth + Storage |
| Zod | Input validation |
| Helmet + CORS | Security |

### Database
| Technology | Details |
|-----------|---------|
| PostgreSQL (Supabase) | 20 tables, RLS policies, indexes |
| Row Level Security | User data isolation |
| PostgreSQL Functions | Streak calculation, habit stats |

---

## Feature Summary

### Authentication
- Phone OTP (SMS via MSG91/Twilio)
- Email/Password login
- Google OAuth
- Secure token storage (Keychain/Keystore)
- Session restoration on app launch

### Courses & Lessons
- Course listing with search, filters (difficulty, category, free/premium)
- Course detail with Overview/Curriculum/Reviews tabs
- Video/audio lesson player with playback controls
- Progress tracking with auto-advance
- Course reviews and ratings

### Meditation Timer
- Full-screen dark UI with breathing animation
- Duration presets (3, 5, 10, 15, 20, 30 min)
- Ambient sounds (Nature, Rain, Ocean, Birds, Singing Bowl)
- Session type selection (Free, Guided, Breathing)
- Automatic session logging on completion

### Multi-Habit Tracking
- 4 preset habits: Meditation, Exercise, Cold Shower, Early Wakeup
- Monthly heatmap grids per habit
- Streak calculation (current + longest)
- Performance tracker (weekly productivity chart)
- Daily affirmation cards
- Vision board (image uploads)
- Day journey (time-based activity suggestions)

### Content Directory
- Full-text search across all content
- Spiritual categories (Bhajans, Meditations, Satsangs, Discourses)
- Bookmark/save functionality
- View count tracking
- Persistent mini audio player

### Events
- Upcoming events listing
- One-tap registration (idempotent)
- Live stream access (registered users only)
- Event detail with instructor info

### Payments & Subscriptions
- Razorpay integration (Indian payments)
- Plan comparison paywall (Free vs Premium)
- Monthly (INR 199) and Annual (INR 1,499) plans
- Signature verification for payment security
- Subscription lifecycle (active → cancelled → expired)
- Premium content gating middleware
- Billing history

### Admin Panel
- Dashboard with analytics
- User management
- Course & lesson CRUD
- Content directory management
- Event management
- Daily quotes management
- Notification dispatch
- Subscription analytics (revenue, conversions, churn)

---

## Project Statistics

### Code Volume
| Area | Files | Lines of Code |
|------|-------|---------------|
| Mobile Screens | 17 | ~4,500 |
| Mobile Components | 10 | ~650 |
| Mobile Services | 11 | ~1,200 |
| Mobile Stores/Hooks | 3 | ~300 |
| Mobile Tests | 20 | ~1,150 |
| Backend Controllers | 11 | ~1,800 |
| Backend Routes | 11 | ~250 |
| Backend Middleware | 7 | ~440 |
| Backend Services | 6 | ~530 |
| Backend Validators | 8 | ~100 |
| Backend Tests | 10 | ~2,150 |
| Database Migrations | 20 | ~900 |
| Admin Pages | 11 | ~2,000 |
| Admin Components | 3 | ~200 |
| Admin Services | 12 | ~400 |
| Documentation | 15+ | ~5,000+ |
| **Total** | **~175+** | **~21,000+** |

### API Endpoints
| Group | Endpoints |
|-------|-----------|
| Authentication | 4 |
| Users | 3 |
| Home | 1 |
| Courses | 6 |
| Sessions | 1 |
| Habits | 10 |
| Directory | 5 |
| Events | 3 |
| Payments | 3 |
| Subscriptions | 2 |
| **Total** | **38** |

### Database
- **20 tables** with UUID primary keys and timestamps
- **Row Level Security** on all user-data tables
- **3 PostgreSQL functions** for streak calculation
- **15+ indexes** for query performance
- **Seed data**: 5 courses, 8 lessons, 30 quotes, 3 events, 6 content items, 3 day journey templates

### Test Coverage
- **30 test files** total (20 mobile + 10 backend)
- **6 E2E test specs** (Maestro format)
- **Unit tests**: stores, validators, components
- **Integration tests**: controllers, API flows
- **Component tests**: all major screens

---

## Phase Breakdown

### Phase 1: Foundation (Weeks 1-4) — COMPLETED
- Project setup (React Native CLI, Supabase, GitHub)
- Database schema (17 migrations with RLS)
- Authentication (OTP + Email + Google)
- Navigation (3-way: auth/onboarding/main)
- Onboarding flow (3 screens)
- Home screen, Profile screen
- Admin panel scaffold
- CI/CD pipeline

### Phase 2: Core Features (Weeks 5-10) — COMPLETED
- Course listing, detail, enrollment, player
- Meditation timer with ambient sounds
- Multi-habit tracking with streaks
- Journey dashboard (heatmaps, vision board, day journey)
- Content directory with search and bookmarks
- Event registration
- Admin CRUD pages
- 2 new database migrations

### Phase 3: Monetization & Polish (Weeks 11-14) — COMPLETED
- Payment integration (Razorpay)
- Subscription management
- Premium content gating
- Paywall and subscription screens
- Error boundary, performance utilities
- Sentry monitoring placeholder
- Admin analytics dashboard

### Phase 4: Testing & Launch (Weeks 15-18) — COMPLETED
- E2E test specifications
- Backend test coverage expansion
- App store listing preparation
- Privacy policy and terms of service
- Production deployment documentation
- Complete API reference
- Final project documentation

---

## Team Contributions

### Navnit (Team Lead)
- Project architecture and planning
- Code review and quality assurance
- Phase documentation and tracking
- GitHub repository management
- Branch protection and PR workflow

### Backend Team (Aayush Tolmare + Krupal Warale)
- Express API with 38 endpoints
- Database schema design (20 tables)
- Authentication system
- Payment processing
- Streak calculation logic
- RLS policies and security

### Frontend Team (Lavanya Veni + Prachi Shirode + Vineet Wathurkar)
- 17 mobile screens with NativeWind styling
- Meditation timer with breathing animation
- Course player with progress tracking
- Journey dashboard with habit heatmaps
- Admin panel with 11 pages
- Component library (10 reusable components)

---

## Design System

| Element | Value |
|---------|-------|
| Primary | #1B4332 (Forest Green) |
| Secondary | #2D6A4F |
| Accent | #40916C |
| Background | #FAFAF5 |
| Surface | #FFFFFF |
| Body Font | Inter |
| Heading Font | Playfair Display |
| Border Radius | 12px cards, 8px buttons, 24px pills |

---

## Key Technical Decisions

1. **React Native CLI over Expo** — Full native module access for Keychain, payment SDKs, and background audio
2. **Supabase Hybrid Architecture** — Managed database + auth with custom Express API for business logic
3. **Multi-habit in single table** — Extensible habit_logs with habit_type discriminator instead of separate tables
4. **PostgreSQL streak functions** — Database-level calculation for atomicity and timezone safety
5. **Middleware-based premium gating** — Composable requirePremium middleware pattern
6. **NativeWind over StyleSheet** — Utility-first styling matching web Tailwind conventions

---

## Documentation Index

| Document | Location | Purpose |
|----------|----------|---------|
| Implementation Plan | docs/IMPLEMENTATION_PLAN.md | Master plan with full specifications |
| Progress Tracker | docs/PROGRESS_TRACKER.md | Sprint-by-sprint task tracking |
| Team Assignments | docs/TEAM_ASSIGNMENTS.md | Per-member task breakdown |
| Design Updates | docs/DESIGN_UPDATES.md | Post-Figma design changes |
| User Flows | docs/USER_FLOWS.md | Mermaid flow diagrams |
| API Reference | docs/api/API_REFERENCE.md | Complete endpoint documentation |
| Phase 1 Doc | docs/phases/PHASE_1_FOUNDATION.md | Foundation implementation details |
| Phase 2 Doc | docs/phases/PHASE_2_CORE_FEATURES.md | Core features implementation |
| Phase 3 Doc | docs/phases/PHASE_3_MONETIZATION.md | Monetization implementation |
| Phase 4 Doc | docs/phases/PHASE_4_LAUNCH.md | Testing & launch details |
| Privacy Policy | docs/legal/PRIVACY_POLICY.md | App privacy policy |
| Terms of Service | docs/legal/TERMS_OF_SERVICE.md | App terms of service |
| Production Checklist | docs/deployment/PRODUCTION_CHECKLIST.md | Deployment guide |

---

*MAM Meditation App — EDAI 6 Group Project — April 2026*
