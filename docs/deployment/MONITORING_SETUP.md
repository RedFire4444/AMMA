# Monitoring Setup Guide

## 1. Sentry (Crash Reporting + Performance)

### Setup
1. Create Sentry project at sentry.io (React Native platform)
2. Get DSN from Project Settings → Client Keys
3. Set `SENTRY_DSN` in mobile `.env` and backend `.env`
4. Activate Sentry in `mobile/src/utils/sentry.ts` (uncomment init code)
5. Install `@sentry/react-native` in mobile project

### Alert Rules
| Alert | Condition | Action |
|-------|-----------|--------|
| Crash Spike | Crash-free rate drops below 99% | Notify team immediately |
| New Error | First occurrence of new error type | Create GitHub issue |
| High Error Volume | >100 errors in 1 hour | Notify team |
| Slow Transaction | P95 response time >2s | Investigate |

### Source Maps
Add to CI/CD (`.github/workflows/ci.yml`):
```yaml
- name: Upload source maps
  run: npx sentry-cli sourcemaps upload --release=$VERSION ./dist
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
```

## 2. Supabase Dashboard

### Metrics to Monitor
- **Database**: Active connections, query latency, storage usage
- **Auth**: Sign-ups per day, active sessions, failed attempts
- **Storage**: Bucket sizes, bandwidth usage
- **Edge Functions**: Invocations, errors, duration

### Alerts
- Database connection pool >80% → Scale or optimize queries
- Storage approaching plan limit → Upgrade plan
- Auth failures spike → Check for brute force attempts

## 3. API Health Checks

### Endpoint
`GET /api/auth/health` — Returns 200 if server is running

### Uptime Monitoring
Set up external monitoring (UptimeRobot, Pingdom, or similar):
- Check interval: 5 minutes
- Alert on: 2 consecutive failures
- Notify via: Email + Slack/WhatsApp

## 4. Application Performance

### Key Metrics
| Metric | Target | Tool |
|--------|--------|------|
| Cold Start Time | <3 seconds | React Native Perf Monitor |
| API P95 Latency | <200ms (read), <500ms (write) | Sentry Performance |
| Crash-Free Rate | >99.5% | Sentry |
| Frame Rate | 60fps on scroll | React Native Perf Monitor |
| App Size | <30MB initial download | Bundle analyzer |

### Performance Testing
1. Test on mid-range devices (Samsung Galaxy A14, Pixel 7)
2. Test on slow 3G network
3. Profile with React Native Performance Monitor
4. Check for memory leaks (long sessions)

## 5. Post-Launch Monitoring Schedule

### First 72 Hours
| Time | Check | Owner |
|------|-------|-------|
| Every 2 hours | Sentry crash dashboard | On-call |
| Every 4 hours | API error rates | Backend team |
| Daily | New user registrations | Team lead |
| Daily | App store reviews | Team lead |

### Ongoing (Weekly)
- Review Sentry error trends
- Check database query performance
- Monitor storage usage growth
- Review user retention metrics
- Check subscription conversion rates
