# Production Deployment Checklist

## Pre-Deployment

### Supabase Production Setup
- [ ] Create production Supabase project (separate from dev)
- [ ] Run all 20 database migrations in sequence
- [ ] Verify all tables created (users, courses, lessons, enrollments, meditation_sessions, habit_logs, events, event_registrations, subscriptions, payments, notifications, daily_quotes, content_directory, course_reviews, vision_board, day_journey, performance_ratings, bookmarks)
- [ ] Verify RLS policies enabled and enforced
- [ ] Load seed data (30 daily quotes, 3 day journey templates)
- [ ] Upload initial content (sample courses, lessons, content directory items)
- [ ] Configure Supabase Auth providers (Phone OTP, Email, Google OAuth)
- [ ] Set up Google Cloud Console OAuth client for Google Sign-In
- [ ] Configure SMS/OTP provider (MSG91 or Twilio) in Supabase dashboard

### Backend Deployment
- [ ] Set up production server (Railway, Render, AWS, or DigitalOcean)
- [ ] Configure production environment variables (see ENVIRONMENT_SETUP.md)
- [ ] Deploy Express API
- [ ] Verify health check endpoint responds: `GET /api/auth/health`
- [ ] Test auth endpoints work with production Supabase
- [ ] Configure CORS for production domains only
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting for production

### Admin Panel Deployment
- [ ] Deploy to Vercel (connect GitHub repo)
- [ ] Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel env vars
- [ ] Configure custom domain (admin.mamapp.com)
- [ ] Verify SSL certificate
- [ ] Test admin login with production Supabase credentials
- [ ] Create initial admin user in Supabase Auth + set role='admin' in users table

### Payment Gateway
- [ ] Create Razorpay production account (razorpay.com)
- [ ] Complete KYC verification
- [ ] Get production Key ID and Key Secret
- [ ] Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend env
- [ ] Configure webhook URL in Razorpay dashboard
- [ ] Test payment flow with real card (small amount)

### Push Notifications
- [ ] Create Firebase production project
- [ ] Add iOS app (com.mam.meditation) with APNs key
- [ ] Add Android app with SHA-256 fingerprint
- [ ] Download google-services.json (Android) and GoogleService-Info.plist (iOS)
- [ ] Set Firebase Admin SDK credentials in backend env

### Monitoring
- [ ] Create Sentry production project
- [ ] Set SENTRY_DSN in mobile + backend
- [ ] Configure source map uploads in CI/CD
- [ ] Set up Sentry alert rules (crash rate >0.5%, error spike)
- [ ] Create Mixpanel project for analytics
- [ ] Verify Cloudflare CDN configured for media bucket

## Mobile App Build

### iOS
- [ ] Update bundle identifier: com.mam.meditation
- [ ] Set app version: 1.0.0, build number: 1
- [ ] Configure code signing (Apple Developer account required)
- [ ] Set production Supabase URL and keys
- [ ] Build release archive: `npx react-native build-ios --mode Release`
- [ ] Or use Fastlane: `fastlane ios release`
- [ ] Upload to App Store Connect
- [ ] Fill in app listing (see APP_STORE_LISTING.md)
- [ ] Upload screenshots for all required sizes
- [ ] Submit for Apple review
- [ ] Provide test account in review notes

### Android
- [ ] Update applicationId: com.mam.meditation
- [ ] Set versionCode: 1, versionName: "1.0.0"
- [ ] Generate release signing key
- [ ] Configure ProGuard/R8 rules
- [ ] Build release bundle: `cd android && ./gradlew bundleRelease`
- [ ] Or use Fastlane: `fastlane android release`
- [ ] Upload to Google Play Console
- [ ] Fill in store listing (see PLAY_STORE_LISTING.md)
- [ ] Upload screenshots and feature graphic
- [ ] Complete content rating questionnaire
- [ ] Complete data safety form
- [ ] Submit for Google review

## Post-Deployment Verification

- [ ] Download app from App Store (iOS)
- [ ] Download app from Play Store (Android)
- [ ] Test complete user flow on production:
  - [ ] Register with phone OTP
  - [ ] Complete onboarding
  - [ ] Browse and enroll in a course
  - [ ] Play a lesson
  - [ ] Start and complete a meditation session
  - [ ] Verify streak updates
  - [ ] Browse content directory
  - [ ] Register for an event
  - [ ] Subscribe to Premium plan
  - [ ] Verify premium content unlocked
  - [ ] Admin panel accessible and functional
- [ ] Sentry receiving crash reports
- [ ] Mixpanel receiving analytics events
- [ ] Push notifications deliverable

## Launch Day

- [ ] Announce on social media
- [ ] Monitor Sentry for crashes (every 2 hours)
- [ ] Monitor API error rates
- [ ] Track user registrations
- [ ] Be available for hotfixes
