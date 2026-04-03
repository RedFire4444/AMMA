# Phase 3: Monetization & Polish - Detailed Documentation

> **Status**: NOT STARTED
> **Duration**: Weeks 11-14 (Sprint 6 + Sprint 7)
> **Prerequisites**: Phase 2 completed and all tests passing
> **Last Updated**: -

---

## Phase Overview

Phase 3 adds the revenue layer (payments and subscriptions), live event streaming, offline content downloads, and focuses on performance optimization and production monitoring. This phase transforms the app from a feature-complete prototype into a market-ready product.

**By the end of Phase 3, a user can**:
1. Subscribe to Premium (monthly or annual) via Razorpay
2. Access premium-only content (courses, downloads, event replays)
3. View subscription status and billing history
4. Download content for offline access (premium)
5. Watch live event streams
6. Experience a polished, performant app (<3s cold start)

**Admin can**:
1. View subscription analytics (revenue, conversions, churn)
2. View Mixpanel analytics dashboard

---

## Sprint 6 Deliverables (Week 11-12): Payments & Subscriptions

### Razorpay Integration
- [ ] Razorpay test account configured
- [ ] react-native-razorpay installed on mobile
- [ ] razorpay SDK installed on backend
- [ ] POST /api/payments/create-order endpoint
- [ ] POST /api/payments/verify endpoint
- [ ] Razorpay webhook Edge Function (payment-webhook/)
- [ ] Signature verification for webhooks
- [ ] Payment events: payment.captured, payment.failed

### Subscription Management
- [ ] Subscription creation on successful payment
- [ ] Plan types: free, monthly (INR 199), annual (INR 1,499)
- [ ] Status lifecycle: active → expired / cancelled
- [ ] Grace period handling
- [ ] GET /api/subscriptions/status endpoint
- [ ] useSubscription() hook on mobile

### Premium Content Gating
- [ ] subscription.middleware.ts - Checks active subscription
- [ ] Applied to premium course enrollment routes
- [ ] Applied to premium content directory items
- [ ] Applied to event replay access
- [ ] Applied to offline download routes
- [ ] isPremium flag available in UI via hook
- [ ] Lock icon overlay on premium content
- [ ] "Upgrade to Premium" CTA on locked content

### Paywall & Subscription UI
- [ ] PaywallScreen with feature comparison table
- [ ] Monthly and Annual plan cards
- [ ] "Save 37%" badge on annual plan
- [ ] Razorpay checkout modal integration
- [ ] Success/failure handling post-payment
- [ ] SubscriptionScreen in profile (status, expiry, history)
- [ ] Upgrade/Cancel buttons
- [ ] Admin SubscriptionsPage with analytics

---

## Sprint 7 Deliverables (Week 13-14): Streaming, Offline, Performance

### Live Event Streaming
- [ ] Cloudflare Stream integration
- [ ] HLS video player for live streams
- [ ] Signed stream URL generation
- [ ] Registration check before stream access
- [ ] Live indicator badge on event cards
- [ ] Real-time participant count (Supabase Realtime)

### Offline Content Downloads
- [ ] Download manager component
- [ ] react-native-fs for file storage
- [ ] Download progress tracking UI
- [ ] Local storage for download metadata (MMKV)
- [ ] Downloaded content playback without network
- [ ] Download limits: 25 (monthly), unlimited (annual)
- [ ] Auto-expire downloads on subscription lapse

### Performance Optimization
- [ ] FlatList optimization (windowSize, maxToRenderPerBatch)
- [ ] Image optimization (WebP, FastImage caching)
- [ ] React.memo on heavy components
- [ ] useMemo/useCallback for expensive computations
- [ ] Bundle size analysis and optimization
- [ ] Hermes engine verification
- [ ] console.log removal for production
- [ ] API response compression (gzip)
- [ ] Cold start measurement (<3s target)
- [ ] 60fps scroll verification

### Sentry Integration
- [ ] @sentry/react-native installed
- [ ] Configured with DSN on iOS and Android
- [ ] Source map upload in CI/CD
- [ ] Performance tracing for screen transitions
- [ ] Performance tracing for API calls
- [ ] Breadcrumbs for user actions
- [ ] Error boundary components
- [ ] Crash alert configuration

### Admin Analytics Dashboard
- [ ] Mixpanel integration (or alternative)
- [ ] DAU/MAU charts
- [ ] Retention curves
- [ ] Revenue metrics
- [ ] Subscription conversion funnel
- [ ] Content engagement metrics

---

## Architecture Decisions

*To be filled after implementation*

---

## Implementation Details

*To be filled after implementation*

---

## Testing Summary

| Category | Tests Written | Tests Passing | Coverage |
|----------|-------------|--------------|----------|
| Payment Flow Tests | - | - | - |
| Signature Verification | - | - | - |
| Subscription Logic | - | - | - |
| Premium Gating Middleware | - | - | - |
| Download Manager Tests | - | - | - |
| Performance Benchmarks | - | - | - |
| **Total** | **-** | **-** | **-** |

---

## Challenges & Solutions

*To be filled after implementation*

---

## Interview Talking Points

### Topics You Can Discuss After Phase 3:

1. **Payment Gateway Integration (Razorpay)**
   - Order creation → Checkout → Verification flow
   - Server-side signature verification for security
   - Webhook handling for asynchronous payment events
   - Idempotency: preventing duplicate charges
   - Test mode vs production mode strategy

2. **Subscription Lifecycle Management**
   - State machine: active → grace_period → expired → cancelled
   - Server-side subscription validation (not trusting client)
   - Premium content gating as middleware pattern
   - Handling subscription renewals and plan changes

3. **Offline-First Architecture**
   - Download manager with queue and progress tracking
   - Local storage strategies (file system + metadata DB)
   - Content expiry tied to subscription status
   - Graceful degradation when offline

4. **Performance Optimization Techniques**
   - React Native FlatList virtualization deep-dive
   - Image loading optimization (WebP, progressive, caching)
   - Bundle size reduction strategies
   - Hermes engine benefits and configuration
   - Measuring and improving cold start time

5. **Production Monitoring with Sentry**
   - Crash reporting vs error tracking vs performance monitoring
   - Source maps for readable crash reports
   - Breadcrumbs for reproducing issues
   - Performance tracing for identifying bottlenecks
   - Alert configuration for crash rate spikes

---

## Screenshots

*To be added after implementation*
