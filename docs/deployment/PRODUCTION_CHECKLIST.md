# Production Deployment Checklist — MAA Meditation & Wellness

> **Last Updated**: 2026-04-05
> **Owner**: Navnit (Team Lead)
> **Target**: Production launch readiness

---

## Overview

This checklist covers every step required to take the MAA application from development to a fully operational production environment. Each item must be verified and signed off before proceeding to the next section. The checklist is organized in dependency order — complete each section top-to-bottom.

**Sign-off format**: Replace `[ ]` with `[x]` and add initials + date when complete.

---

## 1. Supabase Production Setup

- [ ] Create a new Supabase project for production (separate from dev/staging)
- [ ] Note the production project URL (`https://<project-ref>.supabase.co`)
- [ ] Note the production `anon` key (public, safe for client-side)
- [ ] Note the production `service_role` key (server-only, never expose to client)
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Verify RLS policies are correctly configured for each table
- [ ] Enable Supabase Auth with phone OTP provider
- [ ] Configure email provider for account recovery emails
- [ ] Configure Google OAuth provider with production credentials
- [ ] Set rate limits on auth endpoints (OTP: 5 per hour per phone number)
- [ ] Enable database connection pooling (PgBouncer) for production load

---

## 2. Database Migrations

Run all 20 migrations on the production database in order:

- [ ] Migration 001: `create_profiles` — User profiles table with RLS
- [ ] Migration 002: `create_courses` — Courses table with categories and metadata
- [ ] Migration 003: `create_lessons` — Lessons table linked to courses
- [ ] Migration 004: `create_enrollments` — Course enrollment tracking
- [ ] Migration 005: `create_lesson_progress` — Per-lesson completion tracking
- [ ] Migration 006: `create_meditation_sessions` — Meditation session logs
- [ ] Migration 007: `create_habits` — Daily habit tracking records
- [ ] Migration 008: `create_streaks` — Streak calculation and storage
- [ ] Migration 009: `create_content_items` — Content directory items (bhajans, satsangs)
- [ ] Migration 010: `create_bookmarks` — User bookmarks for content
- [ ] Migration 011: `create_events` — Live events with scheduling
- [ ] Migration 012: `create_event_registrations` — Event registration tracking
- [ ] Migration 013: `create_quotes` — Daily spiritual quotes
- [ ] Migration 014: `create_payments` — Payment records (Razorpay integration)
- [ ] Migration 015: `create_subscriptions` — Subscription lifecycle management
- [ ] Migration 016: `create_notifications` — Push notification records
- [ ] Migration 017: `create_day_journey_templates` — Day journey step templates
- [ ] Migration 018: `create_user_levels` — Gamification level definitions
- [ ] Migration 019: `create_indexes` — Performance indexes on frequently queried columns
- [ ] Migration 020: `create_rls_policies` — Row Level Security policies for all tables

**Verification**:
- [ ] Run `SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'` — expect 13+ tables
- [ ] Verify all foreign key constraints are in place
- [ ] Verify all indexes are created
- [ ] Run a test query on each table to confirm schema correctness

---

## 3. Seed Data

- [ ] Load daily spiritual quotes (minimum 365 quotes for year-round rotation)
- [ ] Load day journey templates (step-by-step spiritual practice templates)
- [ ] Load user level definitions (level 1-10 with XP thresholds)
- [ ] Load sample/starter courses (at least 1 free course for new users)
- [ ] Load ambient sound metadata (temple bells, river, rain, ocean, Om chanting)
- [ ] Verify seed data loads correctly with `SELECT count(*) FROM quotes` etc.

---

## 4. Environment Variables

Configure all environment variables for each service. Refer to [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for the full variable list.

### Backend Server

- [ ] `NODE_ENV=production`
- [ ] `PORT` configured (default: 3000)
- [ ] `SUPABASE_URL` set to production project URL
- [ ] `SUPABASE_ANON_KEY` set to production anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set to production service role key
- [ ] `RAZORPAY_KEY_ID` set to production Razorpay key (live mode, not test)
- [ ] `RAZORPAY_KEY_SECRET` set to production Razorpay secret
- [ ] `FIREBASE_PROJECT_ID` set to production Firebase project
- [ ] `FIREBASE_PRIVATE_KEY` set to production service account private key
- [ ] `SENTRY_DSN` set to production Sentry DSN
- [ ] `ALLOWED_ORIGINS` set to production domain(s)
- [ ] All secrets stored securely (environment variables, not in code or config files)

### Mobile App

- [ ] `SUPABASE_URL` set to production project URL
- [ ] `SUPABASE_ANON_KEY` set to production anon key
- [ ] `SENTRY_DSN` set to production Sentry DSN
- [ ] `RAZORPAY_KEY_ID` set to production Razorpay key (live mode)
- [ ] Verify no development/staging URLs are hardcoded in the build

### Admin Panel

- [ ] `VITE_SUPABASE_URL` set to production project URL
- [ ] `VITE_SUPABASE_ANON_KEY` set to production anon key
- [ ] Verify Vite build uses production environment file (`.env.production`)

---

## 5. Payment Gateway (Razorpay)

- [ ] Razorpay account verified and approved for live transactions
- [ ] Live API key and secret generated (not test keys)
- [ ] Webhook endpoint configured for payment status updates
- [ ] Webhook secret configured for signature verification
- [ ] Subscription plans created in Razorpay dashboard:
  - [ ] Monthly plan: INR 199/month
  - [ ] Annual plan: INR 1,499/year
- [ ] Test a live transaction with a real card (small amount) and refund it
- [ ] Verify HMAC SHA256 signature verification works with live keys
- [ ] Configure Razorpay dashboard alerts for failed payments

---

## 6. Firebase (Push Notifications)

- [ ] Firebase project created for production
- [ ] Firebase Cloud Messaging (FCM) enabled
- [ ] Service account JSON key generated and stored securely
- [ ] iOS APNs key or certificate uploaded to Firebase Console
- [ ] Android `google-services.json` configured for production package name
- [ ] iOS `GoogleService-Info.plist` configured for production bundle ID
- [ ] Test push notification sent and received on both iOS and Android
- [ ] Notification topics created (e.g., `daily-reminder`, `new-content`, `events`)

---

## 7. Backend Deployment

- [ ] Choose production hosting (e.g., Railway, Render, AWS EC2, DigitalOcean)
- [ ] Deploy backend Node.js + Express application
- [ ] Verify `NODE_ENV=production` is set
- [ ] Configure process manager (PM2 or equivalent) for auto-restart
- [ ] Set up health check endpoint (`GET /api/health`)
- [ ] Verify health check returns 200 with `{ status: "ok", timestamp: "..." }`
- [ ] Configure auto-scaling rules if applicable
- [ ] Set memory and CPU limits
- [ ] Enable request logging (structured JSON logs)
- [ ] Verify CORS is configured to allow only production origins
- [ ] Verify rate limiting is enabled on auth and payment endpoints
- [ ] Run a smoke test: call 5 critical API endpoints and verify responses

---

## 8. Admin Panel Deployment

- [ ] Build admin panel for production: `npm run build`
- [ ] Deploy to Vercel (or chosen hosting platform)
- [ ] Configure production environment variables in Vercel dashboard
- [ ] Verify build succeeds with no errors
- [ ] Configure custom domain (e.g., `admin.maaapp.com`)
- [ ] Verify SSL certificate is active (HTTPS)
- [ ] Test admin login with production Supabase credentials
- [ ] Verify all admin pages load and display data correctly:
  - [ ] Dashboard
  - [ ] Users
  - [ ] Courses
  - [ ] Lessons
  - [ ] Content
  - [ ] Events
  - [ ] Quotes
  - [ ] Notifications
  - [ ] Subscriptions
  - [ ] Settings
- [ ] Set up access control (only authorized admin users)

---

## 9. Custom Domain and SSL

- [ ] Register domain `maaapp.com` (if not already done)
- [ ] Configure DNS records:
  - [ ] `A` or `CNAME` for `maaapp.com` pointing to backend server
  - [ ] `CNAME` for `admin.maaapp.com` pointing to Vercel
  - [ ] `CNAME` for `cdn.maaapp.com` pointing to Cloudflare R2 (media delivery)
- [ ] Enable SSL/TLS on all domains (Let's Encrypt or Cloudflare)
- [ ] Verify HTTPS redirect is active (HTTP to HTTPS)
- [ ] Test all URLs with SSL checker tool
- [ ] Set up HSTS headers

---

## 10. Sentry Error Monitoring

- [ ] Create Sentry project for React Native (mobile)
- [ ] Create Sentry project for Node.js (backend)
- [ ] Note production DSN for each project
- [ ] Configure source map upload in the build pipeline:
  - [ ] Mobile: Upload React Native source maps to Sentry on each release
  - [ ] Backend: Upload Node.js source maps if using TypeScript compilation
- [ ] Enable performance monitoring (transaction tracing)
- [ ] Set sample rate: 100% for errors, 20% for transactions (adjust based on volume)
- [ ] Configure alert rules:
  - [ ] New issue alert — immediate notification
  - [ ] Crash-free session rate drops below 99.5% — critical alert
  - [ ] Error count spikes (>2x baseline in 1 hour) — warning alert
- [ ] Verify a test error appears in Sentry dashboard
- [ ] Configure release tracking (version + build number)

---

## 11. Cloudflare CDN

- [ ] Create Cloudflare R2 bucket for media storage (audio, video, images)
- [ ] Configure R2 bucket with public read access via custom domain
- [ ] Set up `cdn.maaapp.com` as the custom domain for R2
- [ ] Upload all media assets to R2:
  - [ ] Course lesson audio files
  - [ ] Course lesson video files
  - [ ] Content directory audio files (bhajans, satsangs, meditations)
  - [ ] Course thumbnail images
  - [ ] Event banner images
  - [ ] Ambient sound files for meditation timer
- [ ] Configure cache headers (`Cache-Control: max-age=31536000` for immutable assets)
- [ ] Enable Cloudflare analytics
- [ ] Test media delivery speed from R2 CDN
- [ ] Verify CORS headers allow requests from the mobile app and admin panel

---

## 12. API Health Verification

Run a comprehensive smoke test against the production API:

- [ ] `GET /api/health` returns 200 OK
- [ ] `POST /api/auth/otp/request` returns 200 (with test phone number)
- [ ] `POST /api/auth/otp/verify` returns 200 (with valid OTP)
- [ ] `GET /api/courses` returns 200 (returns course list)
- [ ] `GET /api/courses/:id` returns 200 (returns course detail)
- [ ] `GET /api/content` returns 200 (returns content directory)
- [ ] `GET /api/events` returns 200 (returns events list)
- [ ] `GET /api/quotes/today` returns 200 (returns daily quote)
- [ ] `GET /api/journey/stats` returns 200 (returns user journey stats, authenticated)
- [ ] `GET /api/subscriptions/status` returns 200 (returns subscription status, authenticated)
- [ ] `POST /api/payments/create-order` returns 201 (creates payment order, authenticated)
- [ ] Verify response times are under 500ms for all GET endpoints
- [ ] Verify error responses return proper JSON format with error codes

---

## 13. Production Smoke Tests

Full end-to-end verification on a production build:

- [ ] Fresh install on iOS device — app launches without crash
- [ ] Fresh install on Android device — app launches without crash
- [ ] Complete OTP login flow on production
- [ ] Onboarding flow completes and reaches Home screen
- [ ] Home screen loads: daily quote, stats pills, trending content
- [ ] Browse courses, enroll, play lesson, progress saved
- [ ] Open meditation timer, select sound, complete session, session logged
- [ ] Check My Journey — verify streak updated
- [ ] Browse content directory, search, bookmark, play audio
- [ ] View events — register for event
- [ ] Open paywall, complete payment (live test), premium activated
- [ ] Profile loads with correct stats
- [ ] Push notification received (trigger a test notification)
- [ ] Admin panel: login, verify dashboard loads, create a test course, delete it

---

## 14. Mobile App Builds (Fastlane)

### iOS

- [ ] Update version number and build number in Xcode project
- [ ] Verify signing certificates and provisioning profiles are valid
- [ ] Run `fastlane ios build` to create the archive
- [ ] Verify archive builds without errors
- [ ] Upload to App Store Connect via `fastlane ios upload` or Transporter
- [ ] Verify build appears in App Store Connect under TestFlight
- [ ] Select build for App Store submission

### Android

- [ ] Update `versionCode` and `versionName` in `build.gradle`
- [ ] Verify signing keystore is configured for release builds
- [ ] Run `fastlane android build` to create the app bundle (.aab)
- [ ] Verify bundle builds without errors
- [ ] Upload to Google Play Console
- [ ] Verify bundle appears in the selected release track
- [ ] Select bundle for production release

---

## 15. App Store Submission

### iOS (App Store Connect)

- [ ] All App Store listing fields completed (see [APP_STORE_LISTING.md](../app-store/APP_STORE_LISTING.md))
- [ ] Screenshots uploaded for all required device sizes
- [ ] App Review notes and test account credentials added
- [ ] Privacy policy URL verified (live and accessible)
- [ ] In-app purchase products created and approved
- [ ] Submit for Apple review
- [ ] Monitor review status (average 24-48 hours)
- [ ] Address any reviewer feedback or rejection reasons promptly

### Android (Google Play Console)

- [ ] All Play Store listing fields completed (see [PLAY_STORE_LISTING.md](../app-store/PLAY_STORE_LISTING.md))
- [ ] Feature graphic and screenshots uploaded
- [ ] Content rating questionnaire completed
- [ ] Data safety form completed
- [ ] Privacy policy URL verified (live and accessible)
- [ ] Submit for Google review
- [ ] Monitor review status (average 1-3 days)
- [ ] Plan staged rollout (20% then 50% then 100%)

---

## 16. Monitoring and Alerts

- [ ] Sentry alerts configured and tested (see [MONITORING_SETUP.md](MONITORING_SETUP.md))
- [ ] Supabase dashboard bookmarked with key metrics visible
- [ ] Cloudflare analytics dashboard configured
- [ ] Mixpanel real-time dashboard set up for launch day:
  - [ ] Active users
  - [ ] Sign-ups per hour
  - [ ] Feature engagement
  - [ ] Funnel: Install to Register to First Session
- [ ] Alert notification channels configured:
  - [ ] Critical alerts via phone call or SMS
  - [ ] Warning alerts via Slack or email
  - [ ] Info alerts via email digest
- [ ] On-call schedule defined for first 72 hours post-launch
- [ ] Escalation contacts documented

---

## 17. Launch Communication

- [ ] Prepare launch announcement for social media
- [ ] Prepare press release or blog post (optional)
- [ ] Notify beta testers that the production version is live
- [ ] Share App Store and Play Store links with the team
- [ ] Document the launch date and time for project records

---

## 18. Post-Launch Verification (First 4 Hours)

- [ ] Verify app is discoverable in App Store search
- [ ] Verify app is discoverable in Play Store search
- [ ] Download app from App Store on a clean device and test login
- [ ] Download app from Play Store on a clean device and test login
- [ ] Check Sentry dashboard for any crashes
- [ ] Check API health endpoint
- [ ] Check Supabase dashboard for database health
- [ ] Verify push notifications are being delivered
- [ ] Monitor Mixpanel for real user activity
- [ ] Confirm payment flow works for real users

---

## 19. Prepare Launch Communication

- [ ] App Store and Play Store links documented and shared
- [ ] Social media posts scheduled
- [ ] Beta tester thank-you message sent
- [ ] Team retrospective scheduled for 1 week post-launch
- [ ] Post-launch bug triage process documented

---

## Sign-Off

| Section | Completed By | Date | Notes |
|---------|-------------|------|-------|
| 1. Supabase Setup | | | |
| 2. Database Migrations | | | |
| 3. Seed Data | | | |
| 4. Environment Variables | | | |
| 5. Razorpay | | | |
| 6. Firebase | | | |
| 7. Backend Deployment | | | |
| 8. Admin Panel | | | |
| 9. Domain & SSL | | | |
| 10. Sentry | | | |
| 11. Cloudflare CDN | | | |
| 12. API Health | | | |
| 13. Smoke Tests | | | |
| 14. Mobile Builds | | | |
| 15. App Store Submission | | | |
| 16. Monitoring | | | |
| 17. Launch Communication | | | |
| 18. Post-Launch Verification | | | |

**Final Approval**: ______________ (Team Lead) | Date: ______________
