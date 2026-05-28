# Security Policy

Thanks for helping keep MAA - Meditation & Wellness and its users safe.

This document covers how to **report a vulnerability** in this repository. For how we protect end-user data, see the user-facing [Security Policy](docs/legal/SECURITY_POLICY.md) and [Privacy Policy](docs/legal/PRIVACY_POLICY.md).

---

## Supported Versions

The project is in active pre-launch development. Only the `main` branch is supported — please report issues against the latest commit on `main`.

| Branch | Supported |
|--------|-----------|
| `main` | ✅ |
| feature branches | ❌ |
| forks | ❌ |

---

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.** Public disclosure before a fix puts users at risk.

Instead, use one of these private channels:

1. **GitHub Private Vulnerability Reporting** (preferred): go to the repository's **Security** tab → **Report a vulnerability**. This opens a private advisory visible only to the maintainers.
2. **Email**: send details to **security@maaapp.com**.

### What to include

A good report helps us fix the issue faster:

- A clear description of the vulnerability and its impact
- Step-by-step reproduction instructions (or a proof-of-concept)
- The affected component (mobile app, backend API, admin panel) and file/endpoint if known
- Any relevant logs, requests, or screenshots
- Your assessment of severity, if you have one

### What to expect

| Stage | Target |
|-------|--------|
| Acknowledgement of your report | within 3 business days |
| Initial assessment + severity triage | within 7 business days |
| Fix or mitigation plan communicated | within 14 business days |
| Public disclosure (coordinated with you) | after a fix ships |

We will keep you updated through the process and credit you in the advisory if you wish.

---

## Scope

**In scope:**
- The mobile app (`mobile/`)
- The backend API (`MAA-Meditation-App/MAA-Project/backend/`)
- The admin panel (`MAA-Meditation-App/MAA-Project/admin/`)
- CI/CD and deployment configuration in this repository

**Out of scope:**
- Vulnerabilities in third-party services we depend on (Supabase, Fly.io, etc.) — report those to the respective vendor
- Social engineering of project members
- Denial-of-service / volumetric attacks
- Issues requiring a physically compromised or jailbroken/rooted device
- Findings that only affect outdated, unsupported branches

---

## Known Pre-Launch Context

The following are **known and intentional** during the private beta — please do not report them as new findings:

- **Development Supabase credentials are committed** in `credentialsSupabase.txt` and `mobile/src/services/supabase.ts`. This is a deliberate, temporary choice for the private build phase. These keys protect only non-production test data and will be **rotated and removed before launch**, with a separate production database provisioned. The repository is private.
- Several integrations (live Razorpay payments, Firebase push, crash reporting, analytics) are **stubbed placeholders**, not live. Issues in code paths that are not yet active are lower priority.

If you find that any of the above has changed (e.g. production credentials exposed, or a stub silently went live insecurely), that **is** worth reporting.

---

## Safe Harbor

We support good-faith security research. If you make a genuine effort to comply with this policy, we will:

- Consider your research authorized and not pursue legal action against you
- Work with you to understand and resolve the issue quickly
- Recognize your contribution if you wish

We ask that you, in return:

- Avoid privacy violations, data destruction, and service disruption
- Only interact with test accounts you own or have explicit permission to access
- Give us a reasonable time to fix the issue before any public disclosure
