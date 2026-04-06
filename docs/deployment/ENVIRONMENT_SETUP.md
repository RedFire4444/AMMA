# Environment Setup Guide — MAA Meditation & Wellness

> **Last Updated**: 2026-04-05
> **Owner**: Navnit (Team Lead)
> **Applies To**: Backend, Mobile, Admin Panel

---

## Overview

This document defines every environment variable used across the MAA project. Each service (backend, mobile, admin) has its own `.env` file with variables scoped to its needs. The document covers three environments: **development**, **staging**, and **production**.

**Critical Rules**:
- Never commit `.env` files to version control
- Never share production secrets via chat, email, or plaintext
- Rotate secrets immediately if they are accidentally exposed
- Use distinct values for each environment — never reuse production keys in development

---

## 1. Backend Environment Variables

**File location**: `MAA-Meditation-App/backend/.env`

### Complete Variable Reference

```env
# ============================================================
# Server Configuration
# ============================================================
PORT=3000
NODE_ENV=development

# ============================================================
# Supabase Configuration
# ============================================================
# Project URL from Supabase dashboard > Settings > API
SUPABASE_URL=https://xxxxxxxxxx.supabase.co

# Public anon key — safe for client-side, respects RLS
SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>

# Service role key — bypasses RLS, server-only, NEVER expose to client
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SUPABASE_SERVICE_ROLE_KEY>

# ============================================================
# Razorpay Payment Gateway
# ============================================================
# Key ID from Razorpay Dashboard > Settings > API Keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# Key Secret — used for HMAC SHA256 signature verification
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# ============================================================
# Firebase Cloud Messaging (Push Notifications)
# ============================================================
# Firebase project ID from Firebase Console > Project Settings
FIREBASE_PROJECT_ID=mam-meditation-app

# Service account private key (JSON format, escaped for .env)
# Generate from Firebase Console > Project Settings > Service Accounts > Generate New Private Key
FIREBASE_PRIVATE_KEY="<PASTE_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_HERE>"

# ============================================================
# Sentry Error Monitoring
# ============================================================
# DSN from Sentry > Project Settings > Client Keys (DSN)
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxx@o123456.ingest.sentry.io/1234567

# ============================================================
# CORS Configuration
# ============================================================
# Comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Variable Details

| Variable | Required | Description | Sensitive |
|----------|----------|-------------|-----------|
| `PORT` | Yes | HTTP port the Express server listens on | No |
| `NODE_ENV` | Yes | Runtime environment: `development`, `staging`, or `production` | No |
| `SUPABASE_URL` | Yes | Supabase project API endpoint URL | No |
| `SUPABASE_ANON_KEY` | Yes | Supabase public anonymous key (respects RLS) | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase admin key (bypasses RLS) — server-only | **Yes** |
| `RAZORPAY_KEY_ID` | Yes | Razorpay API key identifier | No |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay API secret for signature verification | **Yes** |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project identifier for FCM | No |
| `FIREBASE_PRIVATE_KEY` | Yes | Firebase service account private key (PEM format) | **Yes** |
| `SENTRY_DSN` | Yes | Sentry Data Source Name for error reporting | No |
| `ALLOWED_ORIGINS` | Yes | CORS allowed origins (comma-separated) | No |

---

## 2. Mobile App Environment Variables

**File location**: `MAA-Meditation-App/mobile/.env`

### Complete Variable Reference

```env
# ============================================================
# Supabase Configuration
# ============================================================
SUPABASE_URL=https://xxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================
# Sentry Error Monitoring
# ============================================================
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxx@o123456.ingest.sentry.io/1234567

# ============================================================
# Razorpay Payment Gateway
# ============================================================
# Public key only — secret is never used client-side
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### Variable Details

| Variable | Required | Description | Sensitive |
|----------|----------|-------------|-----------|
| `SUPABASE_URL` | Yes | Supabase project API endpoint URL | No |
| `SUPABASE_ANON_KEY` | Yes | Supabase public anonymous key (client-safe, RLS-enforced) | No |
| `SENTRY_DSN` | Yes | Sentry DSN for mobile crash reporting | No |
| `RAZORPAY_KEY_ID` | Yes | Razorpay public key for checkout initialization | No |

**Important**: The mobile app must never contain the `SUPABASE_SERVICE_ROLE_KEY` or `RAZORPAY_KEY_SECRET`. These are server-side secrets only.

### React Native Environment Variable Access

The mobile app uses `react-native-config` to load `.env` variables:

```typescript
import Config from 'react-native-config';

const supabaseUrl = Config.SUPABASE_URL;
const supabaseKey = Config.SUPABASE_ANON_KEY;
```

Multiple `.env` files are supported:
- `.env` — default (development)
- `.env.staging` — staging environment
- `.env.production` — production environment

Switch environments during build:
```bash
# iOS
ENVFILE=.env.production npx react-native run-ios --configuration Release

# Android
ENVFILE=.env.production npx react-native run-android --variant=release
```

---

## 3. Admin Panel Environment Variables

**File location**: `MAA-Meditation-App/admin/.env`

### Complete Variable Reference

```env
# ============================================================
# Supabase Configuration
# ============================================================
# Vite requires VITE_ prefix for client-accessible env vars
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Variable Details

| Variable | Required | Description | Sensitive |
|----------|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | Yes | Supabase project API endpoint URL | No |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase public anonymous key (client-safe, RLS-enforced) | No |

**Important**: The admin panel uses Supabase RLS + admin user roles to enforce access control. The `service_role` key is never used in the admin panel. Admin operations are authorized through Supabase policies that check the user's role claim.

### Vite Environment Variable Access

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

Multiple `.env` files are supported by Vite:
- `.env` — loaded in all environments
- `.env.local` — loaded in all environments, gitignored
- `.env.development` — loaded in development mode
- `.env.staging` — loaded when `--mode staging`
- `.env.production` — loaded in production mode

---

## 4. Environment Values by Stage

### Development

Used for local development on developer machines.

```
# Backend
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://dev-xxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=<dev-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<dev-service-role-key>
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=<test-secret>
FIREBASE_PROJECT_ID=mam-meditation-dev
FIREBASE_PRIVATE_KEY=<dev-private-key>
SENTRY_DSN=<dev-sentry-dsn>        # Can be empty during local dev
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8081

# Mobile
SUPABASE_URL=https://dev-xxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=<dev-anon-key>
SENTRY_DSN=                         # Empty during local dev
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# Admin
VITE_SUPABASE_URL=https://dev-xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=<dev-anon-key>
```

**Characteristics**:
- Uses Supabase dev project (separate database)
- Razorpay test mode keys (no real charges)
- Firebase dev project (separate FCM tokens)
- Sentry DSN can be empty (errors logged to console only)
- CORS allows localhost origins

### Staging

Used for QA testing and beta testing. Mirrors production configuration with test payment keys.

```
# Backend
PORT=3000
NODE_ENV=staging
SUPABASE_URL=https://staging-xxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=<staging-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<staging-service-role-key>
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=<test-secret>
FIREBASE_PROJECT_ID=mam-meditation-staging
FIREBASE_PRIVATE_KEY=<staging-private-key>
SENTRY_DSN=<staging-sentry-dsn>
ALLOWED_ORIGINS=https://staging-admin.mamapp.com

# Mobile
SUPABASE_URL=https://staging-xxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=<staging-anon-key>
SENTRY_DSN=<staging-sentry-dsn>
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# Admin
VITE_SUPABASE_URL=https://staging-xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=<staging-anon-key>
```

**Characteristics**:
- Separate Supabase project with production-like data
- Razorpay still in test mode (safe for QA)
- Firebase staging project (separate from production)
- Sentry enabled with staging DSN
- CORS restricted to staging domain only

### Production

Live environment serving real users. All keys are live/production credentials.

```
# Backend
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://prod-xxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=<production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=<live-secret>
FIREBASE_PROJECT_ID=mam-meditation-prod
FIREBASE_PRIVATE_KEY=<production-private-key>
SENTRY_DSN=<production-sentry-dsn>
ALLOWED_ORIGINS=https://admin.mamapp.com,https://mamapp.com

# Mobile
SUPABASE_URL=https://prod-xxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=<production-anon-key>
SENTRY_DSN=<production-sentry-dsn>
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx

# Admin
VITE_SUPABASE_URL=https://prod-xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=<production-anon-key>
```

**Characteristics**:
- Dedicated Supabase production project
- Razorpay live mode keys (real charges)
- Firebase production project
- Sentry enabled with production DSN
- CORS restricted to production domains only
- All secrets managed through hosting platform's secret management (Railway secrets, Vercel env vars, etc.)

---

## 5. Environment Comparison Matrix

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NODE_ENV` | `development` | `staging` | `production` |
| Supabase Project | Dev project | Staging project | Production project |
| Razorpay Keys | `rzp_test_*` | `rzp_test_*` | `rzp_live_*` |
| Firebase Project | `mam-meditation-dev` | `mam-meditation-staging` | `mam-meditation-prod` |
| Sentry | Optional (console) | Enabled | Enabled |
| CORS Origins | `localhost:*` | `staging-admin.mamapp.com` | `admin.mamapp.com` |
| Real Payments | No | No | Yes |
| Real Push Notifications | Optional | Yes (staging devices) | Yes (all users) |

---

## 6. Secret Management Best Practices

### Storage

| Environment | Secret Storage Method |
|-------------|---------------------|
| Development | `.env` file in project root (gitignored) |
| Staging | Hosting platform environment variables (Railway/Render) |
| Production | Hosting platform environment variables with encryption |

### Access Control

| Role | Access Level |
|------|-------------|
| Team Lead (Navnit) | Full access to all environments |
| Backend developers (Aayush, Krupal) | Dev + staging backend secrets |
| Frontend developers (Lavanya, Prachi, Vineet) | Dev mobile/admin secrets only |
| CI/CD pipeline | Staging + production (via platform secrets) |

### Rotation Schedule

| Secret | Rotation Frequency | Procedure |
|--------|-------------------|-----------|
| Supabase service role key | Every 6 months or on team change | Regenerate in Supabase dashboard, update all deployment configs |
| Razorpay keys | Every 12 months or on suspected exposure | Generate new keys in Razorpay dashboard, update backend env |
| Firebase private key | Every 12 months | Generate new service account key, revoke old one |
| Sentry DSN | No rotation needed | DSN is project-scoped, not a secret |

### Exposure Response

If a secret is accidentally committed or exposed:

1. **Immediately** rotate the exposed secret in the service provider's dashboard
2. Update the new secret in all deployment environments
3. Review access logs for any unauthorized usage during the exposure window
4. Force-remove the secret from git history using `git filter-branch` or BFG Repo-Cleaner
5. Notify the team lead
6. Document the incident

---

## 7. Verification Commands

### Backend

```bash
# Verify all required env vars are set
node -e "
  const required = [
    'PORT', 'NODE_ENV', 'SUPABASE_URL', 'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET',
    'FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'SENTRY_DSN', 'ALLOWED_ORIGINS'
  ];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error('Missing env vars:', missing.join(', '));
    process.exit(1);
  }
  console.log('All required environment variables are set.');
"
```

### Mobile

```bash
# Verify mobile env vars (via react-native-config)
npx react-native-config
# Should output: SUPABASE_URL, SUPABASE_ANON_KEY, SENTRY_DSN, RAZORPAY_KEY_ID
```

### Admin

```bash
# Verify Vite picks up env vars during build
npx vite build --mode production
# Check build output for "VITE_SUPABASE_URL" in compiled JS (should be replaced with actual value)
```

---

## 8. Gitignore Configuration

Ensure the following patterns are in `.gitignore` at the project root:

```gitignore
# Environment files
.env
.env.local
.env.development
.env.staging
.env.production
.env.*.local

# Firebase service account
firebase-service-account.json
*-firebase-adminsdk-*.json

# Keystore files
*.keystore
*.jks
release.keystore

# iOS certificates
*.p12
*.mobileprovision
*.cer
```

---

## 9. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Backend crashes on startup with "Missing SUPABASE_URL" | `.env` file not loaded or missing | Verify `.env` exists in backend root, verify `dotenv` is configured |
| Mobile app shows blank screen after login | Wrong `SUPABASE_URL` or `SUPABASE_ANON_KEY` | Verify mobile `.env` points to correct Supabase project |
| Admin panel shows "Unauthorized" on all API calls | Wrong `VITE_SUPABASE_ANON_KEY` or RLS misconfigured | Verify admin `.env` matches the Supabase project, check RLS policies |
| Razorpay checkout fails with "Invalid key" | Using test key with live endpoint or vice versa | Match key prefix: `rzp_test_` for test, `rzp_live_` for production |
| Push notifications not received | Firebase project mismatch or missing APNs config | Verify `google-services.json`/`GoogleService-Info.plist` match the environment |
| Sentry not receiving errors | Empty or incorrect `SENTRY_DSN` | Verify DSN from Sentry dashboard, check network connectivity |
| CORS errors in admin panel | `ALLOWED_ORIGINS` does not include admin domain | Add the admin panel URL to `ALLOWED_ORIGINS` |
