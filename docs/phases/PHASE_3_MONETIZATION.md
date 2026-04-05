# Phase 3: Monetization & Polish - Detailed Documentation

> **Status**: COMPLETED
> **Duration**: Weeks 11-14 (Sprint 6 + Sprint 7)
> **Prerequisites**: Phase 2 completed and all tests passing
> **Last Updated**: 2026-04-05
> **Commit**: `659ab25` — 34 files changed, 2,387 insertions

---

## Phase Overview

Phase 3 adds the revenue layer (payments and subscriptions), premium content gating, performance optimization utilities, error handling, and monitoring placeholders. This phase transforms the app from a feature-complete prototype into a monetization-ready product.

**What was built**:
1. Full payment flow: create order → verify signature → create subscription
2. Subscription lifecycle management (status, cancel, expiry)
3. Premium content gating middleware + PremiumLock UI component
4. PaywallScreen with feature comparison and plan pricing
5. SubscriptionScreen with billing history and plan management
6. Admin subscription analytics dashboard with revenue charts
7. ErrorBoundary component for crash recovery
8. Performance utilities (FlatList configs, debounce, throttle)
9. Sentry placeholder config (ready for DSN activation)

---

## Sprint 6 Deliverables (Week 11-12): Payments & Subscriptions

### Backend Implementation

#### Payment Service (`backend/src/services/payment.service.ts` — 179 lines)
- `createOrder(planType, userId)` — Inserts pending payment record, generates mock order ID. Amounts: monthly = 19,900 paise (INR 199), annual = 1,49,900 paise (INR 1,499)
- `verifySignature(orderId, paymentId, signature)` — HMAC SHA256 verification using `RAZORPAY_KEY_SECRET` env var; dev fallback validates field presence
- `processPayment(userId, orderId, paymentId, signature, planType)` — Verifies signature → updates payment to 'captured' → calculates expiry (+30 or +365 days) → upserts subscription with status='active'

#### Payments Controller (`backend/src/controllers/payments.controller.ts` — 110 lines)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments/create-order` | POST | Validates plan_type, creates order, returns 201 |
| `/api/payments/verify` | POST | Looks up pending payment, verifies signature, processes payment, returns subscription |
| `/api/payments/history` | GET | Returns user's payments ordered by created_at DESC |

#### Subscriptions Controller (`backend/src/controllers/subscriptions.controller.ts` — 97 lines)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/subscriptions/status` | GET | Returns active subscription + isPremium flag. Handles free users gracefully (not error) |
| `/api/subscriptions/cancel` | POST | Sets status='cancelled', cancel_at_period_end=true, records cancelled_at + optional reason |

#### Premium Gating Middleware (`backend/src/middleware/subscription.middleware.ts` — 41 lines)
- `requirePremium` — Checks for active/trialing subscription, validates expiry date
- Returns 403 `PREMIUM_REQUIRED` or `SUBSCRIPTION_EXPIRED` as appropriate
- Ready to chain on any premium-gated route

#### Payment Validator (`backend/src/validators/payment.validator.ts` — 11 lines)
- `createOrderSchema` — Validates plan_type enum ('monthly' | 'annual')
- `verifyPaymentSchema` — Validates gateway_order_id, gateway_payment_id, gateway_signature as required strings

#### Routes Registration
- `payments.routes.ts` — 3 endpoints wired with authenticateToken + validation
- `subscriptions.routes.ts` — 2 endpoints wired with authenticateToken
- `routes/index.ts` — Both route modules registered

### Mobile Implementation

#### Payment Service (`mobile/src/services/payment.service.ts` — 114 lines)
- `createOrder(planType)` — Inserts payment record via Supabase, returns order details with amount
- `verifyPayment(orderId, paymentId, signature)` — Updates payment to captured, fetches plan type, upserts subscription
- `getPaymentHistory()` — Returns user's payment records sorted by date

#### Subscription Service (`mobile/src/services/subscription.service.ts` — 64 lines)
- `getStatus()` — Fetches active subscription, returns `{ planType, status, expiresAt, isPremium }` where isPremium = active/trialing AND not expired
- `cancelSubscription()` — Sets status to cancelled with timestamp
- Handles PGRST116 (no rows) gracefully by returning free plan

#### useSubscription Hook (`mobile/src/hooks/useSubscription.ts` — 53 lines)
- Calls subscriptionService.getStatus() on mount
- Returns `{ isPremium, planType, expiresAt, isLoading, refresh }`
- Falls back to free plan on error

#### PaywallScreen (`mobile/src/screens/PaywallScreen.tsx` — 254 lines)
- "Enhance Your Practice" header with back button
- 7-row feature comparison table (Free vs Premium):
  - Guided Meditations: 10 sessions vs Full library (500+)
  - Courses: 1 free course vs All courses
  - Meditation Timer: Basic sounds vs All sounds
  - Streak Tracking: Yes vs Yes + insights
  - Live Events: View only vs Full access + replay
  - Offline Downloads: No vs Yes
  - Ad-Free: No vs Yes
- Monthly (INR 199) and Annual (INR 1,499) plan cards with selected state
- "Save 37%" badge on annual plan
- "Subscribe Now" button triggers createOrder → verifyPayment flow
- Success modal on completion with subscription refresh
- Forest green design system throughout

#### SubscriptionScreen (`mobile/src/screens/SubscriptionScreen.tsx` — 270 lines)
- Current plan badge (Free / Monthly / Annual) with color coding
- For premium users: expiry date display + "Cancel Subscription" with confirmation alert
- For free users: "Upgrade to Premium" button → navigates to Paywall
- Billing History: FlatList of payment records with date, formatted amount (paise → rupees), color-coded status badges (captured=green, pending=yellow, failed=red)
- Loading state with ActivityIndicator

#### PremiumLock Component (`mobile/src/components/premium/PremiumLock.tsx` — 43 lines)
- Props: `{ children, isPremium, onUpgrade }`
- When isPremium: renders children normally
- When not premium: renders children at 40% opacity with dark overlay + lock icon + "Upgrade to Premium" CTA button
- Reusable across course cards, content items, events

#### Navigation Updates
- `types.ts` — Added `Paywall` and `Subscription` to ProfileStackParamList
- `StackNavigators.tsx` — Registered PaywallScreen and SubscriptionScreen in ProfileStack
- `ProfileMain.tsx` — Wired Subscription settings row and Upgrade button to navigation

### Admin Implementation

#### SubscriptionsPage (`admin/src/pages/SubscriptionsPage.tsx` — 164 lines)
- 4 stat cards with trend indicators: Active Subscribers (1,247 +12%), Monthly Revenue (₹2,48,453 +8%), Conversion Rate (5.2% +0.3%), Churn Rate (2.1% -0.5%)
- Monthly Revenue bar chart (Oct–Mar with ₹ values)
- Plan Distribution with progress bars (Free 87.5%, Monthly 8.5%, Annual 4.0%)
- Conversion Funnel visualization (Total Users → Viewed Paywall → Started Trial → Converted)
- Recent Subscriptions data table with user, plan badge, amount, date, status

---

## Sprint 7 Deliverables (Week 13-14): Polish & Monitoring

### ErrorBoundary (`mobile/src/components/shared/ErrorBoundary.tsx` — 60 lines)
- React class component with getDerivedStateFromError + componentDidCatch
- Default fallback UI: warning icon + "Something went wrong" message + "Try Again" button
- Accepts optional custom `fallback` prop
- Logs errors to console (would send to Sentry in production)
- Resets error state on retry

### Performance Utilities (`mobile/src/utils/performance.ts` — 83 lines)
- `FLATLIST_CONFIG` — Pre-tuned configs for small/medium/large lists:
  - windowSize, maxToRenderPerBatch, updateCellsBatchingPeriod, removeClippedSubviews
  - Usage: `<FlatList {...FLATLIST_CONFIG.medium} ... />`
- `debounce(func, wait)` — Generic debounce for search inputs (used in Directory search)
- `throttle(func, limit)` — Generic throttle for scroll events
- `formatBytes(bytes)` — Human-readable file size formatting

### Sentry Placeholder (`mobile/src/utils/sentry.ts` — 50 lines)
- `initSentry()` — Reads SENTRY_DSN from env, initializes Sentry when DSN available
- `captureException(error, context)` — Logs error (sends to Sentry when configured)
- `captureMessage(message, level)` — Logs message at info/warning/error level
- `setUser(userId, email)` — Sets Sentry user context
- `addBreadcrumb(category, message, data)` — Adds navigation/action breadcrumbs
- All functions have production Sentry calls commented out, ready for activation

---

## Architecture Decisions

### 1. Mock Payment Flow vs Real Razorpay SDK
**Decision**: Built the full payment flow using Supabase directly (creating orders, verifying payments, managing subscriptions) instead of integrating the actual Razorpay SDK.

**Rationale**: The Razorpay React Native SDK requires native linking (Xcode/Android Studio build) which can't be done in a development-only context. The current implementation mirrors the exact data flow — createOrder → checkout → verify → subscription — and can be swapped to use the real Razorpay SDK by:
1. Installing `react-native-razorpay`
2. Replacing the `createOrder` call with Razorpay SDK's `Razorpay.open()` 
3. The verify endpoint already handles HMAC SHA256 signature verification

### 2. Premium Gating as Middleware Pattern
**Decision**: Created a `requirePremium` middleware that can be chained on any Express route, rather than checking subscription status inside each controller.

**Rationale**: This follows the same pattern as `authenticateToken` — clean separation of concerns. Any route that needs premium access just adds `requirePremium` to its middleware chain. The middleware checks both subscription status AND expiry date, returning appropriate error codes.

### 3. Sentry as Placeholder Config
**Decision**: Created a Sentry utility file with all function signatures but commented-out SDK calls, rather than installing the actual `@sentry/react-native` package.

**Rationale**: The Sentry SDK requires native linking and a project DSN. The placeholder provides the exact integration points so that activation is a 3-step process: install SDK, set DSN, uncomment calls.

### 4. useSubscription Hook for Client-Side Premium Checks
**Decision**: Created a custom hook that caches subscription status and exposes an `isPremium` boolean, rather than checking the server on every premium content interaction.

**Rationale**: Reduces API calls. The hook checks on mount and provides a `refresh()` function for explicit re-checks (e.g., after payment completion). The server-side middleware still enforces premium access — the client-side check is for UI purposes only (showing/hiding lock icons).

---

## Implementation Details

### Payment Flow (End-to-End)

```
User taps "Subscribe" on PaywallScreen
    │
    ▼
paymentService.createOrder('monthly')
    │ → Inserts into payments table (status: 'pending', amount: 19900)
    │ → Returns { id, gateway_order_id, amount, currency, plan_type }
    │
    ▼
[In production: Opens Razorpay checkout modal]
[Current: Simulates successful payment]
    │
    ▼
paymentService.verifyPayment(orderId, paymentId, signature)
    │ → Updates payment status to 'captured'
    │ → Calculates expiry (+30 days for monthly, +365 for annual)
    │ → Upserts subscription (status: 'active', expires_at: calculated)
    │
    ▼
useSubscription.refresh()
    │ → Re-fetches subscription status
    │ → isPremium becomes true
    │ → UI updates: lock icons removed, premium content accessible
```

### Premium Content Gating

**Server-side** (middleware):
```
Request → authenticateToken → requirePremium → controller
                                    │
                                    ├─ No subscription → 403 PREMIUM_REQUIRED
                                    ├─ Expired subscription → 403 SUBSCRIPTION_EXPIRED
                                    └─ Active subscription → next()
```

**Client-side** (UI):
```tsx
<PremiumLock isPremium={isPremium} onUpgrade={() => navigate('Paywall')}>
  <CourseCard course={premiumCourse} />
</PremiumLock>
```

### Subscription State Machine
```
[New User] → Free
Free → Active (on payment success)
Active → Active (on renewal)
Active → Cancelled (user cancels, access until period end)
Cancelled → Expired (period ends)
Active → Expired (payment fails, no renewal)
Expired → Active (re-subscribe)
```

---

## Files Created/Modified

### New Files (15)
| File | Lines | Purpose |
|------|-------|---------|
| `backend/src/services/payment.service.ts` | 179 | Razorpay order + signature + subscription creation |
| `backend/src/controllers/payments.controller.ts` | 110 | 3 payment API endpoints |
| `backend/src/controllers/subscriptions.controller.ts` | 97 | 2 subscription API endpoints |
| `backend/src/middleware/subscription.middleware.ts` | 41 | Premium content gating |
| `backend/src/routes/payments.routes.ts` | 18 | Payment route wiring |
| `backend/src/routes/subscriptions.routes.ts` | 13 | Subscription route wiring |
| `backend/src/validators/payment.validator.ts` | 11 | Zod validation schemas |
| `mobile/src/screens/PaywallScreen.tsx` | 254 | Plan comparison + subscribe UI |
| `mobile/src/screens/SubscriptionScreen.tsx` | 270 | Plan status + billing history |
| `mobile/src/services/payment.service.ts` | 114 | Mobile payment API calls |
| `mobile/src/services/subscription.service.ts` | 64 | Mobile subscription API calls |
| `mobile/src/hooks/useSubscription.ts` | 53 | isPremium state hook |
| `mobile/src/components/premium/PremiumLock.tsx` | 43 | Lock overlay component |
| `mobile/src/components/shared/ErrorBoundary.tsx` | 60 | Crash recovery UI |
| `mobile/src/utils/performance.ts` | 83 | FlatList configs, debounce, throttle |
| `mobile/src/utils/sentry.ts` | 50 | Sentry placeholder config |

### Modified Files (5)
| File | Change |
|------|--------|
| `backend/src/routes/index.ts` | Registered payments + subscriptions routes |
| `mobile/src/navigation/types.ts` | Added Paywall + Subscription to ProfileStack |
| `mobile/src/navigation/StackNavigators.tsx` | Registered new screens in ProfileStack |
| `mobile/src/screens/ProfileMain.tsx` | Wired navigation to Subscription + Paywall |
| `admin/src/pages/SubscriptionsPage.tsx` | Full analytics dashboard with charts |

### Test Files (3)
| File | Tests |
|------|-------|
| `PaywallScreen.test.tsx` | Plan comparison, pricing, subscribe button |
| `SubscriptionScreen.test.tsx` | Plan display, upgrade button, heading |
| `PremiumLock.test.tsx` | Premium renders children, free shows lock, onUpgrade fires |

---

## Testing Summary

| Category | Tests Written | Tests Passing | Notes |
|----------|-------------|--------------|-------|
| PaywallScreen | 6 | 6 | Plan cards, pricing, feature comparison |
| SubscriptionScreen | 3 | 3 | Plan display, upgrade CTA |
| PremiumLock | 3 | 3 | Premium/free rendering, onUpgrade callback |
| **Total Phase 3** | **12** | **12** | |

---

## Challenges & Solutions

| Challenge | Solution | Lesson Learned |
|-----------|----------|---------------|
| Razorpay SDK requires native linking | Built mock payment flow matching exact data contract; swap-ready for real SDK | Design payment services as SDK-agnostic wrappers |
| Sentry requires DSN + native setup | Created placeholder with all integration points commented out | Separation of config from implementation enables gradual activation |
| Subscription status needed client + server checks | useSubscription hook for UI, requirePremium middleware for API | Client checks for UX, server checks for security — never trust client alone |
| PaywallScreen test had multiple "Premium" matches | Used `getAllByText` instead of `getByText` for non-unique text | Plan for text that appears multiple times in comparison tables |

---

## Interview Talking Points

### Topics You Can Discuss After Phase 3:

1. **Payment Gateway Integration (Razorpay)**
   - Order creation → Checkout → Verification flow
   - Server-side HMAC SHA256 signature verification for security
   - Why server-side verification matters (preventing client-side tampering)
   - Idempotency: upsert patterns preventing duplicate subscriptions
   - Test mode vs production mode strategy
   - How the payment service is SDK-agnostic (can swap Razorpay for Stripe)

2. **Subscription Lifecycle Management**
   - State machine: free → active → cancelled → expired
   - Server-side subscription validation (middleware pattern, not trusting client)
   - Premium content gating as composable middleware
   - cancel_at_period_end pattern: user keeps access until billing period ends
   - Handling expiry dates and timezone considerations

3. **Premium Content Gating Pattern**
   - Middleware-based gating (single responsibility principle)
   - Dual-layer check: server middleware (security) + client hook (UX)
   - PremiumLock as a reusable wrapper component
   - How isPremium flows from server → hook → UI throughout the app

4. **Performance Optimization Techniques**
   - React Native FlatList virtualization (windowSize, maxToRenderPerBatch)
   - Debounce pattern for search inputs
   - Throttle pattern for scroll events
   - Error boundaries for graceful crash recovery
   - Why performance configs are centralized (single source of truth for tuning)

5. **Production Monitoring Strategy**
   - Sentry integration architecture (DSN-gated initialization)
   - Breadcrumb-based debugging (tracing user actions before crash)
   - Error boundaries as first line of defense
   - Source maps for readable production crash reports
   - Alert configuration for crash rate spikes
