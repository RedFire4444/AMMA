# Security Policy — MAA Meditation & Wellness

**Effective Date**: May 28, 2026
**Last Updated**: May 28, 2026
**Status**: Beta / pre-launch

---

This Security Policy explains how MAA Wellness Pvt. Ltd. ("MAA," "we," "us," or "our") protects the data you trust us with in the MAA - Meditation & Wellness application (the "App"). It is a companion to our [Privacy Policy](./PRIVACY_POLICY.md), which describes *what* data we collect; this document describes *how we keep it safe*.

> **Beta notice**: The App is in pre-launch beta. This policy describes the security controls in place today. Controls marked *(planned)* are not yet active and will be enabled before public launch.

---

## 1. Our Security Principles

1. **Least data**: We collect only the data the App needs to function (see the Privacy Policy). Data we never collect cannot be breached.
2. **Least privilege**: Every user and system component can access only what it needs. Users see only their own records; the mobile app never holds administrative database keys.
3. **Defense in depth**: Multiple independent layers (transport encryption, row-level security, input validation, rate limiting) so a single failure does not expose your data.
4. **Secure by default**: Production builds fail closed — e.g. the backend refuses to start without a configured API base URL, and rejects payments if signing secrets are missing.

---

## 2. How Your Data Is Protected

### 2.1 In Transit

- All communication between the App and our servers uses **HTTPS with TLS 1.2 or higher**.
- HTTP requests are automatically redirected to HTTPS; there is no unencrypted path to our backend.

### 2.2 At Rest

- Your records are stored in **Supabase (PostgreSQL on AWS)** and encrypted at rest by the hosting infrastructure.
- Your authentication session token is stored on your device in **hardware-backed secure storage** — the **iOS Keychain** or **Android Keystore** — never in plaintext or in app-accessible storage.

### 2.3 Authentication & Authorization

- Authentication is handled by **Supabase Auth** (phone OTP and email/password).
- Sessions use short-lived access tokens with automatic, secure refresh. Expired or revoked sessions are signed out automatically.
- **Row-Level Security (RLS)** policies in the database guarantee that every query is scoped to the authenticated user — you cannot read or modify another user's records, even if a client were tampered with.
- The privileged service-role database key exists **only on the server**, never in the mobile app.

### 2.4 Application Security

- **Input validation**: Every write endpoint validates its request body against a strict schema (Zod) before touching the database. Malformed or unexpected fields are rejected.
- **Injection protection**: All database access uses parameterized queries via the Supabase client — no string-concatenated SQL.
- **Rate limiting**: The API enforces request rate limits to slow brute-force and abuse attempts.
- **Security headers**: The backend sets hardened HTTP headers (via Helmet) including content-type, frame, and transport-security protections.
- **CORS**: In production, cross-origin requests are restricted to an explicit allow-list of trusted origins.
- **Error hygiene**: Production error responses are sanitized — internal error details, stack traces, and database messages are never returned to clients or logged to third parties.

### 2.5 Payment Security *(planned)*

- When live payments are enabled, card details will be processed entirely by **Razorpay (PCI DSS Level 1 compliant)**. Card numbers will **never** touch or be stored on our servers.
- Payment confirmations will be verified server-side using **HMAC SHA-256 signature verification with timing-safe comparison**, and the backend will refuse to process payments if the signing secret is not configured.
- *(During beta, the subscription flow runs in test mode and processes no real payments.)*

---

## 3. Secrets & Credential Management

- Production secrets (database keys, payment signing keys) are stored in the hosting platform's encrypted secrets vault (Fly.io secrets), never in source code or version control.
- `.env` files containing local credentials are excluded from version control via `.gitignore`.
- Before public launch, all development credentials will be **rotated** and a separate production database project provisioned, so beta/test credentials never grant access to real user data.

> **Beta disclosure**: During the current build phase, development Supabase keys are shared within the private team repository to streamline onboarding. These keys protect only non-production test data and will be rotated and removed before any real user data is collected. The repository is private and access is limited to the project team.

---

## 4. Data Retention & Deletion

- You can permanently delete your account and all associated data from within the App or by contacting us (see Privacy Policy, Section 5.5).
- Deleted account data is purged from active systems within 7 days and from backups within 30 days.
- Full retention periods for each data type are listed in the Privacy Policy, Section 6.

---

## 5. Breach Notification

If we become aware of a data breach affecting your personal information, we will:

1. Contain and investigate the incident immediately.
2. Notify affected users within **72 hours** of becoming aware, via email (if available) and an in-app notice.
3. Report to the relevant authorities where required by the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.
4. Publish a post-incident summary describing what happened, what data was affected, and the steps taken.

---

## 6. Your Role in Keeping Your Account Secure

Security is a shared responsibility. You can help by:

- Keeping your device's operating system and the App updated.
- Using the device lock screen (PIN, biometric) — your session token is protected by your device's secure storage, which is strongest when a screen lock is set.
- Not sharing your OTP or login credentials with anyone. We will never ask for your OTP or password by phone, email, or message.
- Signing out on shared or lost devices, and contacting us to revoke sessions if a device is stolen.

---

## 7. Responsible Disclosure

If you are a security researcher and believe you have found a vulnerability, we want to hear from you. Please follow the coordinated disclosure process in our repository's [`SECURITY.md`](../../SECURITY.md), or email **security@maaapp.com**. We commit to acknowledging reports promptly and not pursuing legal action against good-faith research that respects user privacy and avoids service disruption.

---

## 8. Changes to This Policy

We may update this Security Policy as our practices evolve or as planned controls become active. Material changes will be reflected in the "Last Updated" date and, where significant, communicated in-app or by email.

---

## 9. Contact

| Channel | Details |
|---------|---------|
| **Security reports** | security@maaapp.com |
| **Privacy inquiries** | privacy@maaapp.com |
| **General support** | support@maaapp.com |

---

**MAA Wellness Pvt. Ltd.**
Pune, Maharashtra, India

> *Note for the team: the company name, address, and `@maaapp.com` email addresses are placeholders. Replace with the real legal entity and monitored security contact before publishing. The `security@` inbox in particular must be actively monitored once disclosure is invited.*
