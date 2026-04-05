# Environment Setup Guide

## Backend Environment Variables

Create `.env` in `MAM-Meditation-App/MAM-Project/backend/`:

```env
# Server
PORT=3000
NODE_ENV=development|staging|production
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:8081

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=mam-meditation
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@mam-meditation.iam.gserviceaccount.com

# Sentry (Error Monitoring)
SENTRY_DSN=https://...@sentry.io/...

# Cloudflare R2 (Media Storage)
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY=...
CLOUDFLARE_R2_SECRET_KEY=...
CLOUDFLARE_R2_BUCKET=mam-media

# OTP Service
OTP_SERVICE_API_KEY=...
OTP_SERVICE_SENDER_ID=MAMAPP
```

## Mobile Environment Variables

Create `.env` in `mobile/`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SENTRY_DSN=https://...@sentry.io/...
RAZORPAY_KEY_ID=rzp_test_...
```

## Admin Panel Environment Variables

Create `.env` in `MAM-Meditation-App/MAM-Project/admin/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Environment Differences

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| NODE_ENV | development | staging | production |
| SUPABASE_URL | Dev project | Staging project | Prod project |
| RAZORPAY_KEY_ID | rzp_test_* | rzp_test_* | rzp_live_* |
| SENTRY_DSN | Dev DSN | Staging DSN | Prod DSN |
| ALLOWED_ORIGINS | localhost | staging URLs | production URLs |

## Important Notes

- **NEVER commit `.env` files** — they are in `.gitignore`
- **SUPABASE_SERVICE_ROLE_KEY** — Only used server-side, bypasses RLS. Never expose to client
- **SUPABASE_ANON_KEY** — Safe for client-side use, respects RLS policies
- **Razorpay test keys** — Use `rzp_test_*` for development, `rzp_live_*` for production
- Each Supabase environment (dev/staging/prod) should be a separate project
