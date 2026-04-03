# Phase 1: Foundation - Detailed Documentation

> **Status**: NOT STARTED
> **Duration**: Weeks 1-4 (Sprint 1 + Sprint 2)
> **Last Updated**: -

---

## Phase Overview

Phase 1 establishes the entire project infrastructure from scratch. It creates the three-part architecture (mobile app, admin panel, backend API), sets up the database with all tables and security policies, implements the authentication system, and builds the first user-facing screens (onboarding, home, profile).

**By the end of Phase 1, a user can**:
1. Download/install the app
2. Log in with phone number OTP
3. Complete the onboarding flow (interests + daily goal)
4. See the home screen with mock content
5. View and edit their profile

**Admin can**:
1. Log in to the admin panel
2. Navigate between all admin sections (placeholder pages)

---

## Sprint 1 Deliverables (Week 1-2)

### 1. React Native CLI Project Setup
- [ ] Project initialized with TypeScript template
- [ ] TypeScript strict mode configured
- [ ] Path aliases configured (babel-plugin-module-resolver)
- [ ] ESLint configured with React Native ruleset
- [ ] Prettier configured
- [ ] Full src/ directory structure created
- [ ] Builds successfully on iOS
- [ ] Builds successfully on Android

### 2. NativeWind v4 + Theme
- [ ] NativeWind installed and configured
- [ ] tailwind.config.js with project design tokens
- [ ] Custom fonts loaded (Inter, Playfair Display)
- [ ] Theme constants exported for non-Tailwind usage
- [ ] Sample styled component verified rendering

### 3. Supabase + Database Schema
- [ ] Supabase dev project created
- [ ] Supabase CLI initialized in backend/supabase/
- [ ] 13 table migration files written
- [ ] RLS policies migration file written
- [ ] Indexes migration file written
- [ ] Streak calculation function written
- [ ] All migrations applied successfully
- [ ] Seed data loaded (sample courses, quotes, events)
- [ ] RLS tested from different user contexts

### 4. Backend API Setup
- [ ] Express.js project initialized with TypeScript
- [ ] Middleware stack configured (helmet, cors, morgan, rate-limit)
- [ ] Auth middleware (JWT verification via Supabase)
- [ ] Admin middleware (role check)
- [ ] Zod validator middleware
- [ ] Global error handler middleware
- [ ] Standard API response helper
- [ ] Logger (Winston) configured
- [ ] .env.example created
- [ ] Health check endpoint responding

### 5. Authentication Flow
- [ ] POST /api/auth/request-otp endpoint
- [ ] POST /api/auth/verify-otp endpoint
- [ ] Zod validators for phone and OTP
- [ ] Rate limiting on OTP requests (3/10min)
- [ ] LoginScreen with phone input
- [ ] OTPScreen with 6-digit input
- [ ] react-native-keychain token storage
- [ ] Supabase Auth session management
- [ ] authStore (Zustand) with login/logout
- [ ] Auto-redirect based on auth state

### 6. Navigation Structure
- [ ] React Navigation v7 installed with dependencies
- [ ] Type-safe navigation types defined
- [ ] RootNavigator (auth check)
- [ ] AuthNavigator (Login > OTP > Onboarding)
- [ ] MainTabNavigator (5 tabs with icons)
- [ ] Stack navigators per tab
- [ ] Custom tab bar matching design system

### 7. CI/CD Pipeline
- [ ] GitHub repo created (private)
- [ ] .gitignore configured
- [ ] GitHub Actions CI workflow (lint, type-check, test)
- [ ] Husky pre-commit hooks (lint-staged)

---

## Sprint 2 Deliverables (Week 3-4)

### 1. Onboarding Flow
- [ ] WelcomeScreen with illustration and CTA
- [ ] InterestsScreen with category grid selector
- [ ] GoalScreen with duration slider + notification toggle
- [ ] Page indicators and skip button
- [ ] Data saved to user profile via PATCH /api/users/me
- [ ] onboarding_complete flag set on completion

### 2. Home Screen
- [ ] Header with greeting + notification bell
- [ ] Daily quote card (Playfair Display)
- [ ] Streak widget (count + 7-day dots)
- [ ] Quick Start Meditation button
- [ ] Trending videos carousel
- [ ] Live events banner (conditional)
- [ ] Featured podcasts section
- [ ] Course recommendations section
- [ ] Pull-to-refresh
- [ ] Skeleton loading states
- [ ] GET /api/home/feed backend endpoint

### 3. User Profile
- [ ] ProfileScreen with avatar, name, phone, stats
- [ ] Edit profile (name, avatar via camera/gallery)
- [ ] Settings list (notifications, theme, sounds, about, logout)
- [ ] GET /api/users/me endpoint
- [ ] PATCH /api/users/me endpoint
- [ ] Stats aggregation (total sessions, hours, longest streak)

### 4. Admin Panel Scaffold
- [ ] Vite project created with React + TypeScript
- [ ] Tailwind CSS configured with project tokens
- [ ] Shadcn/UI components initialized
- [ ] Sidebar navigation layout
- [ ] React Router v7 with nested routes
- [ ] Admin login page (email/password)
- [ ] Protected route wrapper
- [ ] Placeholder pages for all 10 admin sections
- [ ] Supabase Auth integration for admin

### 5. RLS Policy Testing
- [ ] Test matrix covering all tables x operations x roles
- [ ] Integration tests verifying access control
- [ ] All unauthorized access attempts blocked

---

## Architecture Decisions

*To be filled after implementation with actual decisions made and rationale*

---

## Implementation Details

*To be filled after implementation with per-feature technical walkthrough*

---

## Files Created

*To be filled after implementation with list of all files created in Phase 1*

---

## Testing Summary

| Category | Tests Written | Tests Passing | Coverage |
|----------|-------------|--------------|----------|
| Auth Unit Tests | - | - | - |
| Auth Integration Tests | - | - | - |
| Navigation Tests | - | - | - |
| Component Tests | - | - | - |
| RLS Policy Tests | - | - | - |
| **Total** | **-** | **-** | **-** |

---

## Challenges & Solutions

*To be filled after implementation*

| Challenge | Solution | Lesson Learned |
|-----------|----------|---------------|
| - | - | - |

---

## Interview Talking Points

### Topics You Can Discuss After Phase 1:

1. **Phone OTP Authentication Architecture**
   - Why OTP over email/social login for Indian market
   - Supabase Auth integration with custom OTP delivery service
   - JWT token lifecycle: access token, refresh token, secure storage
   - Rate limiting strategy for OTP abuse prevention

2. **React Navigation v7 Architecture**
   - Auth flow separation (conditional navigator mounting)
   - Type-safe navigation with TypeScript generics
   - Deep linking configuration
   - Custom tab bar implementation

3. **Database Design with Row Level Security**
   - Why PostgreSQL RLS over application-level access control
   - Policy design patterns (user isolation, public read, admin override)
   - Performance implications of RLS policies
   - Testing strategy for security policies

4. **Supabase as Backend-as-a-Service**
   - Architectural decision: Supabase vs Firebase vs custom backend
   - Using Supabase alongside a custom Express API (hybrid approach)
   - Edge Functions for serverless workloads
   - Real-time subscriptions for live features

5. **CI/CD Pipeline Design**
   - GitHub Actions matrix strategy for multi-project monorepo
   - Pre-commit hooks for code quality enforcement
   - Automated testing as merge gate

6. **React Native CLI vs Expo Decision**
   - Why bare workflow for native module access
   - Trade-offs: flexibility vs convenience
   - NativeWind for consistent cross-platform styling

---

## Screenshots

*To be added after implementation - screenshots of working screens*
