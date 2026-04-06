# Monitoring Setup Guide — MAA Meditation & Wellness

> **Last Updated**: 2026-04-05
> **Owner**: Navnit (Team Lead)
> **Applies To**: Mobile App, Backend API, Admin Panel

---

## Overview

This document covers the complete monitoring and observability setup for the MAA application in production. Monitoring is organized into four layers:

1. **Crash Reporting** — Sentry for real-time error and crash tracking
2. **Infrastructure Monitoring** — Supabase dashboard for database, auth, and storage health
3. **CDN and Traffic Analytics** — Cloudflare dashboard for content delivery and request patterns
4. **Application Health** — Custom health check endpoints and uptime monitoring

Each section includes setup instructions, configuration details, alert thresholds, and dashboard organization.

---

## 1. Sentry Setup (Crash Reporting and Performance)

### 1.1 Project Creation

Create two Sentry projects under a single Sentry organization:

| Sentry Project | Platform | Purpose |
|---------------|----------|---------|
| `mam-mobile` | React Native | Mobile app crash reports, ANR, performance |
| `mam-backend` | Node.js | Backend API errors, unhandled rejections, performance |

### 1.2 DSN Configuration

After project creation, retrieve the DSN from **Project Settings > Client Keys (DSN)**:

```
# Mobile DSN format
https://<public-key>@o<org-id>.ingest.sentry.io/<project-id>

# Backend DSN format
https://<public-key>@o<org-id>.ingest.sentry.io/<project-id>
```

Set these as environment variables (see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)):
- Backend: `SENTRY_DSN` in `.env`
- Mobile: `SENTRY_DSN` in `.env`

### 1.3 Mobile SDK Integration

**Package**: `@sentry/react-native`

```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative
```

**Initialization** (activate in `mobile/src/utils/sentry.ts`):

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: Config.SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  release: `com.mam.meditation@${appVersion}+${buildNumber}`,
  dist: buildNumber,

  // Performance monitoring
  tracesSampleRate: 0.2,         // 20% of transactions sampled
  profilesSampleRate: 0.1,       // 10% of sampled transactions get profiling

  // Session tracking for crash-free rate
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,

  // Breadcrumbs
  enableAutoPerformanceTracing: true,
  attachStacktrace: true,
  maxBreadcrumbs: 100,

  // Filter out development noise
  beforeSend(event) {
    if (__DEV__) return null;    // Don't send in development
    return event;
  },
});
```

**Wrap root component**:

```typescript
export default Sentry.wrap(App);
```

### 1.4 Backend SDK Integration

**Package**: `@sentry/node`

```bash
npm install @sentry/node @sentry/profiling-node
```

**Initialization** (in backend entry point, before any other imports):

```typescript
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: `mam-backend@${packageJson.version}`,

  integrations: [
    nodeProfilingIntegration(),
  ],

  tracesSampleRate: 0.2,
  profilesSampleRate: 0.1,
});
```

**Express middleware** (add after all routes):

```typescript
// Error handler — must be after all other middleware and routes
Sentry.setupExpressErrorHandler(app);
```

### 1.5 Source Maps

Source maps allow Sentry to display readable stack traces instead of minified code.

**Mobile (React Native)**:

```bash
# Upload source maps during release build
npx sentry-cli react-native appcenter \
  --org mam-wellness \
  --project mam-mobile \
  --release com.mam.meditation@1.0.0+1 \
  --dist 1 \
  --sourcemap-output ./sourcemaps
```

**Backend (Node.js + TypeScript)**:

```bash
# Upload compiled source maps
npx sentry-cli sourcemaps upload \
  --org mam-wellness \
  --project mam-backend \
  --release mam-backend@1.0.0 \
  ./dist
```

**Automate in CI/CD**: Add source map upload as a step in the build pipeline so every release has readable stack traces.

### 1.6 Alert Rules

Configure the following alerts in Sentry:

#### Critical Alerts (Immediate — phone/SMS)

| Alert | Condition | Action |
|-------|-----------|--------|
| Crash-free rate drop | Crash-free session rate < 99.5% over 1 hour | Page on-call engineer |
| New fatal error | First occurrence of a new unhandled exception | Notify team channel |
| Error spike | Error count > 2x rolling 24h average in 1 hour | Page on-call engineer |
| Backend 5xx spike | 5xx error rate > 5% of requests over 15 minutes | Page on-call engineer |

#### Warning Alerts (Within 1 hour — Slack/email)

| Alert | Condition | Action |
|-------|-----------|--------|
| New issue | First occurrence of any new error | Notify team channel |
| Regression | Previously resolved issue reappears | Notify assigned developer |
| Performance degradation | P95 transaction duration > 3s (API) or > 5s (mobile) | Notify team channel |
| Unhandled rejection | Unhandled promise rejection in backend | Notify backend team |

#### Info Alerts (Daily digest — email)

| Alert | Condition | Action |
|-------|-----------|--------|
| Weekly error report | Summary of all errors from the past 7 days | Email team lead |
| Release health | Crash-free rate and adoption stats per release | Email team lead |

### 1.7 Performance Monitoring

Track the following transactions:

**Mobile**:
| Transaction | What It Measures |
|-------------|-----------------|
| `app.start.cold` | Cold start time (target: < 3s) |
| `app.start.warm` | Warm start time (target: < 1.5s) |
| `navigation.*` | Screen transition time (target: < 500ms) |
| `http.client` | API call duration (target: < 1s) |
| `meditation.session` | Full meditation session lifecycle |

**Backend**:
| Transaction | What It Measures |
|-------------|-----------------|
| `http.server` | API endpoint response time (target: < 500ms) |
| `db.query` | Database query duration (target: < 200ms) |
| `payment.process` | Payment verification flow (target: < 3s) |
| `auth.otp` | OTP send and verify flow (target: < 2s) |

### 1.8 Release Tracking

Tag every build with a release identifier:

```
# Mobile release format
com.mam.meditation@<version>+<buildNumber>
Example: com.mam.meditation@1.0.0+42

# Backend release format
mam-backend@<version>
Example: mam-backend@1.0.0
```

This enables:
- Per-release crash-free rate tracking
- Regression detection (issues that reappear in new releases)
- Release adoption tracking (what % of users are on the latest version)

---

## 2. Supabase Dashboard Monitoring

### 2.1 Key Metrics to Monitor

Access the Supabase dashboard at `https://supabase.com/dashboard/project/<project-ref>`.

| Metric | Location | Healthy Range | Action if Breached |
|--------|----------|--------------|-------------------|
| Database connections | Database > Overview | < 80% of pool limit | Increase pool size or optimize connection usage |
| Database size | Database > Overview | < 80% of plan limit | Archive old data or upgrade plan |
| Auth active users | Authentication > Users | Growing or stable | Investigate if sudden drop |
| Auth sign-ups/day | Authentication > Users | Matches projections | Investigate if 0 for > 24h |
| Storage used | Storage > Overview | < 80% of plan limit | Clean up unused files or upgrade plan |
| API requests/min | API > Overview | < rate limit threshold | Add caching or optimize queries |
| Slow queries | Database > Query Performance | P95 < 200ms | Add indexes or optimize query |
| Failed auth attempts | Authentication > Logs | < 50/hour per IP | Investigate brute force, add rate limiting |

### 2.2 Database Health Queries

Run these periodically (weekly) to check database health:

```sql
-- Table sizes
SELECT
  schemaname || '.' || tablename AS table,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- Index usage (unused indexes waste space and slow writes)
SELECT
  indexrelname AS index_name,
  idx_scan AS times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan < 10
ORDER BY pg_relation_size(indexrelid) DESC;

-- Slow queries (requires pg_stat_statements extension)
SELECT
  query,
  calls,
  mean_exec_time::numeric(10,2) AS avg_ms,
  total_exec_time::numeric(10,2) AS total_ms
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Active connections
SELECT count(*) AS active_connections
FROM pg_stat_activity
WHERE state = 'active';

-- Table row counts
SELECT
  relname AS table_name,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### 2.3 Supabase Alerts

Supabase does not have built-in alerting for all metrics. Set up external monitoring:

| Metric | Monitoring Method | Threshold | Alert |
|--------|------------------|-----------|-------|
| Database up/down | Health check endpoint that queries DB | Fails for > 2 minutes | Critical |
| Connection pool exhaustion | Periodic check via SQL | > 90% of max_connections | Warning |
| Storage approaching limit | Weekly manual check in dashboard | > 80% of plan limit | Info |

---

## 3. Cloudflare Analytics

### 3.1 R2 Storage Monitoring

Monitor the Cloudflare R2 bucket used for media delivery (`cdn.mamapp.com`):

| Metric | Where to Find | Healthy Range |
|--------|--------------|--------------|
| Total requests | R2 > Analytics | Growing with user base |
| Bandwidth used | R2 > Analytics | < plan limits |
| Cache hit ratio | R2 > Analytics | > 90% (indicates CDN is effective) |
| Error rate (4xx, 5xx) | R2 > Analytics | < 1% |
| Class A operations (writes) | R2 > Analytics | Only during content uploads |
| Class B operations (reads) | R2 > Analytics | Scales with active users |

### 3.2 Cloudflare Dashboard Setup

If using Cloudflare for DNS and proxying:

| Metric | What to Watch |
|--------|--------------|
| Request volume | Total requests per day/hour |
| Bandwidth | Data transferred (indicates media consumption) |
| Threat analytics | Blocked attacks, bot traffic |
| Cache performance | Cached vs uncached requests |
| SSL/TLS | Certificate validity, protocol versions |
| Web Analytics | Page views on `mamapp.com` website (if applicable) |

### 3.3 CDN Cache Rules

Configure these cache rules for optimal performance:

| Path Pattern | Cache TTL | Rationale |
|-------------|-----------|-----------|
| `*.mp3`, `*.m4a` | 1 year (immutable) | Audio files are versioned, never change in-place |
| `*.mp4`, `*.webm` | 1 year (immutable) | Video files are versioned |
| `*.jpg`, `*.png`, `*.webp` | 1 year (immutable) | Images are versioned |
| `/api/*` | No cache | API responses must be fresh |

---

## 4. Custom Health Check Endpoints

### 4.1 Backend Health Check

**Endpoint**: `GET /api/health`

**Response format**:

```json
{
  "status": "ok",
  "timestamp": "2026-04-05T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 86400,
  "checks": {
    "database": "ok",
    "supabase": "ok",
    "memory": {
      "heapUsed": "45 MB",
      "heapTotal": "128 MB",
      "rss": "160 MB"
    }
  }
}
```

**Implementation**:

```typescript
app.get('/api/health', async (req, res) => {
  try {
    // Check database connectivity
    const { error } = await supabase.from('quotes').select('id').limit(1);
    const dbStatus = error ? 'error' : 'ok';

    const memoryUsage = process.memoryUsage();

    res.json({
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: dbStatus,
        supabase: dbStatus,
        memory: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        },
      },
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});
```

### 4.2 Deep Health Check (Internal Only)

**Endpoint**: `GET /api/health/deep`

This endpoint checks all external dependencies and should be protected (not public):

```json
{
  "status": "ok",
  "timestamp": "2026-04-05T10:30:00.000Z",
  "checks": {
    "database": { "status": "ok", "latency_ms": 12 },
    "supabase_auth": { "status": "ok", "latency_ms": 45 },
    "razorpay": { "status": "ok", "latency_ms": 120 },
    "firebase": { "status": "ok", "latency_ms": 80 },
    "cloudflare_r2": { "status": "ok", "latency_ms": 35 },
    "sentry": { "status": "ok" }
  }
}
```

### 4.3 Uptime Monitoring

Set up external uptime monitoring (e.g., UptimeRobot, Better Stack, or Checkly):

| Check | URL | Interval | Timeout | Alert On |
|-------|-----|----------|---------|----------|
| API Health | `https://api.mamapp.com/api/health` | 1 minute | 10 seconds | 2 consecutive failures |
| Admin Panel | `https://admin.mamapp.com` | 5 minutes | 15 seconds | 2 consecutive failures |
| CDN Media | `https://cdn.mamapp.com/health-check.txt` | 5 minutes | 10 seconds | 3 consecutive failures |
| Website | `https://mamapp.com` | 5 minutes | 15 seconds | 2 consecutive failures |

**Expected uptime target**: 99.9% (allows ~8.7 hours of downtime per year).

---

## 5. Alert Thresholds Summary

### Severity Levels

| Severity | Response Time | Notification Channel | Who |
|----------|-------------|---------------------|-----|
| **Critical (P0)** | Immediate (< 15 min) | Phone call + SMS + Slack | On-call engineer |
| **Warning (P1)** | Within 1 hour | Slack + Email | On-call engineer |
| **Info (P2)** | Within 24 hours | Email | Team lead |
| **Low (P3)** | Next sprint | Email digest | Team lead |

### Alert Thresholds by Category

#### Application Health

| Metric | Warning | Critical | Measurement Window |
|--------|---------|----------|-------------------|
| Crash-free session rate | < 99.5% | < 99.0% | Rolling 1 hour |
| API error rate (5xx) | > 2% | > 5% | Rolling 15 minutes |
| API response time (P95) | > 1 second | > 3 seconds | Rolling 15 minutes |
| Cold start time (mobile) | > 3 seconds | > 5 seconds | Per release |
| Unhandled exceptions | > 10/hour | > 50/hour | Rolling 1 hour |

#### Infrastructure Health

| Metric | Warning | Critical | Measurement Window |
|--------|---------|----------|-------------------|
| Database connections | > 80% pool | > 95% pool | Real-time |
| Database query P95 | > 200ms | > 1 second | Rolling 1 hour |
| Memory usage (backend) | > 80% limit | > 95% limit | Rolling 5 minutes |
| CPU usage (backend) | > 70% | > 90% | Rolling 5 minutes |
| Disk/storage usage | > 80% plan | > 95% plan | Daily check |

#### Business Metrics

| Metric | Warning | Critical | Measurement Window |
|--------|---------|----------|-------------------|
| Sign-ups per day | Drops > 50% from 7-day avg | Drops to 0 for > 24h | Daily |
| Payment failures | > 10% failure rate | > 25% failure rate | Rolling 1 hour |
| Push notification delivery | < 90% delivery rate | < 70% delivery rate | Rolling 24 hours |

---

## 6. On-Call Escalation Process

### On-Call Schedule (First 72 Hours Post-Launch)

| Time Block | Primary On-Call | Backup |
|-----------|----------------|--------|
| Day 1: 6 AM - 2 PM IST | Navnit | Aayush |
| Day 1: 2 PM - 10 PM IST | Aayush | Krupal |
| Day 1: 10 PM - 6 AM IST | Navnit | Aayush |
| Day 2: 6 AM - 2 PM IST | Krupal | Navnit |
| Day 2: 2 PM - 10 PM IST | Navnit | Krupal |
| Day 2: 10 PM - 6 AM IST | Aayush | Navnit |
| Day 3: 6 AM - 2 PM IST | Aayush | Krupal |
| Day 3: 2 PM - 10 PM IST | Krupal | Navnit |
| Day 3: 10 PM - 6 AM IST | Navnit | Aayush |

### Ongoing On-Call (Post-Launch Steady State)

| Role | Schedule | Responsibilities |
|------|----------|-----------------|
| Primary On-Call | Weekly rotation (Mon-Sun) | Respond to all critical alerts, triage warnings |
| Backup On-Call | Weekly rotation (offset by 1) | Step in if primary is unreachable within 15 minutes |
| Team Lead | Always reachable for escalation | Final decision on hotfixes, incident communication |

### Escalation Procedure

```
Alert Triggered
    │
    ▼
Step 1: Primary on-call notified (automated)
    │ (15 minutes)
    ▼
Step 2: If no acknowledgement → Backup on-call notified
    │ (15 minutes)
    ▼
Step 3: If no acknowledgement → Team lead notified (phone call)
    │ (15 minutes)
    ▼
Step 4: If unresolved after 1 hour → All team members notified
```

### Incident Response Checklist

When a critical alert fires:

1. **Acknowledge** the alert within 15 minutes
2. **Assess** the impact: How many users affected? Is the app usable?
3. **Communicate** status to the team in the incident Slack channel
4. **Investigate** root cause using Sentry, logs, and Supabase dashboard
5. **Mitigate** — apply a temporary fix if a permanent fix needs more time
6. **Resolve** — deploy the fix, verify the alert clears
7. **Postmortem** — within 48 hours, document what happened, root cause, and prevention steps

### Incident Severity Classification

| Severity | Definition | Examples |
|----------|-----------|---------|
| **SEV-1** | Service fully down, all users affected | Backend crash, database down, auth broken |
| **SEV-2** | Major feature broken, many users affected | Payment processing failed, course playback broken |
| **SEV-3** | Minor feature broken, some users affected | Streak not updating, single API endpoint slow |
| **SEV-4** | Cosmetic or low-impact issue | UI alignment off, non-critical error in logs |

---

## 7. Dashboard Organization

### Recommended Dashboard Layout

Create a centralized monitoring overview (e.g., in Grafana, or use bookmarks to Sentry/Supabase/Cloudflare dashboards):

**Dashboard 1: Application Health** (check every 4 hours)
- Sentry crash-free session rate (mobile)
- Sentry error count trend (mobile + backend)
- API health check status
- API response time P50/P95/P99

**Dashboard 2: Infrastructure** (check daily)
- Supabase database connections
- Supabase storage usage
- Backend memory and CPU usage
- Cloudflare R2 request volume and cache hit rate

**Dashboard 3: Business Metrics** (check daily)
- Active users (Mixpanel)
- New sign-ups per day
- Subscription conversions
- Payment success rate
- Feature engagement (top 5 features by daily active users)

**Dashboard 4: Launch Day Real-Time** (check every 30 minutes on launch day)
- Real-time active users (Mixpanel)
- Sign-ups per hour
- First session funnel: Install to Register to First Meditation
- Crash count (should be 0)
- API error count (should be near 0)
- Payment transaction count and success rate

---

## 8. Post-Launch Monitoring Schedule

### First 72 Hours

| Timeframe | Check Frequency | Focus Areas |
|-----------|----------------|-------------|
| Hours 0-4 | Every 30 minutes | Crashes, API errors, sign-up flow, payments |
| Hours 4-24 | Every 2 hours | Crash-free rate, performance, user registrations |
| Hours 24-48 | Every 4 hours | Retention, error trends, storage growth |
| Hours 48-72 | Every 8 hours | Stabilization, Day-1 retention rate |

### Steady State (After 72 Hours)

| Check | Frequency | Owner |
|-------|-----------|-------|
| Sentry error review | Daily | On-call engineer |
| Supabase dashboard review | Weekly | Backend team |
| Cloudflare analytics review | Weekly | Team lead |
| Performance metrics review | Weekly | Team lead |
| Database health queries | Weekly | Backend team |
| Storage and costs review | Monthly | Team lead |
| Secret rotation check | Quarterly | Team lead |

---

## 9. Runbook: Common Issues

### API Response Time Spike

1. Check Sentry for new errors or increased error rate
2. Check Supabase dashboard for slow queries or connection issues
3. Check backend memory/CPU usage
4. If a specific endpoint is slow, check the query it executes
5. Add or optimize database indexes if query-related
6. Scale backend if resource-constrained

### Crash-Free Rate Drop

1. Open Sentry, filter by the latest release
2. Identify the top crashing issue
3. Check the stack trace, breadcrumbs, and device info
4. Reproduce locally if possible
5. Push a hotfix if the crash is widespread (> 1% of sessions)
6. Monitor crash-free rate recovery after hotfix deployment

### Payment Failures

1. Check Razorpay dashboard for error details
2. Check backend logs for payment verification errors
3. Verify Razorpay API keys are correct and not expired
4. Verify webhook endpoint is receiving callbacks
5. If Razorpay is experiencing downtime, communicate to users via in-app notice
6. Retry failed payments once Razorpay recovers

### Push Notifications Not Delivered

1. Verify Firebase project is active and FCM is enabled
2. Check Firebase Console for delivery reports
3. Verify APNs certificate (iOS) has not expired
4. Check that device tokens are being registered correctly
5. Test a manual push from Firebase Console
6. Check backend notification service logs for errors

### Database Connection Pool Exhaustion

1. Check `pg_stat_activity` for active connections
2. Identify long-running queries and terminate if stuck
3. Check if backend is leaking connections (not releasing after use)
4. Increase PgBouncer pool size in Supabase dashboard
5. Optimize query patterns to reduce connection hold time
