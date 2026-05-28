# Privacy Policy — MAA Meditation & Wellness

**Effective Date**: May 28, 2026
**Last Updated**: May 28, 2026
**Status**: Beta / pre-launch

---

MAA Wellness Pvt. Ltd. ("MAA," "we," "us," or "our") operates the MAA - Meditation & Wellness mobile application (the "App"). This Privacy Policy describes how we collect, use, store, and protect your personal information when you use our services.

By using the App, you agree to the collection and use of information as described in this Privacy Policy. If you do not agree with the terms of this policy, please do not use our services.

> **Beta notice**: The App is currently in pre-launch beta. This policy describes the data we collect **today**. Some integrations (analytics, crash reporting, push notifications, live payment processing) are planned but **not yet active** — they are listed separately in Section 13 ("Planned Future Integrations"). We will update this policy and its "Last Updated" date before activating any of them.

---

## 1. Information We Collect

### 1.1 Information You Provide Directly

| Data Type | When Collected | Purpose |
|-----------|---------------|---------|
| **Phone Number** | Account registration | OTP-based authentication and account verification |
| **Email Address** | Optional during registration or profile setup | Account recovery, important service notifications |
| **Full Name** | Profile setup | Display name within the app |
| **Profile Picture** | Optional profile customization | Displayed on your profile screen |
| **Payment Information** | Subscription purchase | When live, processed securely by Razorpay; we never store card numbers. **Currently in beta: no real payments are processed** (see Section 13) |
| **Feedback and Support Requests** | When you contact us | To respond to your inquiry and improve our services |

### 1.2 Information Generated Through App Usage

| Data Type | Description | Purpose |
|-----------|-------------|---------|
| **Meditation Session Data** | Duration, completion status, ambient sound selection, timestamp | Track your practice, display stats, calculate streaks |
| **Course Progress** | Enrolled courses, completed lessons, progress percentage | Resume where you left off, recommend next steps |
| **Habit Tracking Data** | Daily check-ins for meditation, exercise, cold shower, early wakeup | Display streaks, heatmaps, and journey analytics |
| **Bookmarks and Favorites** | Content items you bookmark in the directory | Personalize your content library |
| **Event Registrations** | Events you register for | Send reminders, manage attendance |
| **Subscription Status** | Plan type, start date, expiry date, cancellation status | Manage your subscription and premium access |

### 1.3 Information Collected Automatically

| Data Type | Collection Method | Purpose |
|-----------|-------------------|---------|
| **IP Address** | Server access logs (Supabase + our hosting platform) | Security, abuse prevention, approximate geographic region |
| **Authentication Session Token** | Issued by Supabase Auth on login; stored encrypted on your device | Keep you signed in securely between sessions |

> We do **not** currently run any third-party analytics SDK (e.g. Mixpanel), crash-reporting SDK (e.g. Sentry), or push-notification service (e.g. Firebase). These are planned — see Section 13. Until then, the only automatic collection is server-side request logging and your auth session token.

### 1.4 Information We Do Not Collect

- Precise GPS location or geolocation data
- Contact lists or address book data
- SMS or call log data
- Photos, videos, or files from your device (unless you upload a profile picture)
- Health data from Apple HealthKit or Google Health Connect
- Biometric data
- Browsing history outside the App
- Behavioral analytics or advertising identifiers (no analytics SDK is currently integrated)

---

## 2. How We Use Your Information

We use the information we collect for the following purposes:

### 2.1 Core App Functionality
- Authenticate your identity via phone OTP or email/password
- Display your profile information within the App
- Track and display your meditation sessions, streaks, and habit data
- Manage course enrollment and lesson progress
- Process event registrations and send reminders
- Deliver daily spiritual quotes and personalized content

### 2.2 Subscription and Payments
- Process subscription purchases through Razorpay
- Manage subscription status, renewals, and cancellations
- Maintain payment history for your records
- Send payment confirmation and renewal notifications

### 2.3 Communication
- Send push notifications for meditation reminders, event alerts, and new content
- Send transactional emails (password reset, account verification, payment receipts)
- Respond to support requests and feedback

### 2.4 Service Improvement
- Monitor server performance and identify technical issues through server logs
- Understand which features are used based on the data you generate in the App (e.g. session counts), without any third-party behavioral tracking
- Inform product development and content curation decisions

(When third-party analytics is introduced, this section and Section 13 will be updated to describe it before it goes live.)

### 2.5 Security
- Detect and prevent fraudulent or unauthorized access
- Enforce our Terms of Service
- Comply with legal obligations

---

## 3. Data Storage and Security

### 3.1 Where Your Data Is Stored

| Service | Data Stored | Location |
|---------|-------------|----------|
| **Supabase** (PostgreSQL + Auth) | User accounts, authentication, meditation data, course progress, habits, subscriptions, events | Cloud-hosted (AWS infrastructure) |
| **Device Keychain / Keystore** | Your encrypted authentication session token only | On your own device (iOS Keychain / Android Keystore) — never transmitted to us |
| **Application hosting platform** | Transient server request logs (IP, timestamp, route) | Cloud-hosted backend (Fly.io) |

Media files (audio/video for courses and content) are not yet hosted on dedicated storage during beta. When media hosting is added, this table and Section 13 will be updated.

### 3.2 Security Measures

We implement industry-standard security measures to protect your data:

- **Encryption in Transit**: All data transmitted between the App and our servers uses HTTPS with TLS 1.2 or higher (enforced — HTTP is redirected to HTTPS)
- **Encryption at Rest**: Database records are encrypted at rest by our hosting infrastructure (Supabase / AWS)
- **On-Device Token Storage**: Your auth session token is stored in the device's hardware-backed secure storage (iOS Keychain / Android Keystore), never in plaintext
- **Authentication**: Token-based authentication via Supabase Auth, with automatic token refresh and session expiry
- **Row-Level Security**: Database row-level security (RLS) policies ensure each user can only access their own records
- **API Security**: Rate limiting, schema-based input validation (Zod), and parameterized queries to prevent injection attacks
- **Payment Security**: When live, payment card details will be processed by Razorpay (PCI DSS Level 1 compliant) and will never touch our servers
- **Regular Reviews**: Security reviews of our infrastructure and codebase

For a fuller description of our security practices, see our [Security Policy](./SECURITY_POLICY.md).

### 3.3 Data Breach Notification

In the event of a data breach that affects your personal information, we will notify affected users within 72 hours of becoming aware of the breach, in compliance with applicable laws. Notification will be sent via email (if available) and through an in-app notice.

---

## 4. Third-Party Services

We currently use the following third-party services that receive or process your data:

| Service | Purpose | Data Shared | Privacy Policy |
|---------|---------|-------------|----------------|
| **Supabase** | Backend infrastructure, authentication, database | Account data, app data | https://supabase.com/privacy |
| **Fly.io** | Application server hosting | Server request metadata (IP, route, timestamp) | https://fly.io/legal/privacy-policy/ |

Additional services (Razorpay, Firebase, Sentry, analytics, media CDN) are **planned but not yet active** — see Section 13. We will update this table before any of them begin receiving your data.

We do not sell your personal information to any third party. We do not share your personal information with third parties for their own marketing purposes.

---

## 5. Your Rights and Choices

### 5.1 Access Your Data
You can view your personal information, meditation history, course progress, and habit data at any time within the App under your Profile section.

### 5.2 Update Your Information
You can update your name, email, and profile picture from the Profile > Edit Profile screen in the App.

### 5.3 Manage Notifications
You can enable or disable push notifications from the App's Settings screen or from your device's system notification settings.

### 5.4 Export Your Data
You can request a copy of your personal data by emailing privacy@maaapp.com. We will provide your data in a machine-readable format (JSON) within 30 days of your request.

### 5.5 Delete Your Account
You can permanently delete your account and all associated data through:
- **In-App**: Profile > Settings > Delete Account
- **Email**: Send a request to privacy@maaapp.com

Upon account deletion:
- Your profile, meditation data, course progress, habit data, bookmarks, and event registrations are permanently deleted from our active database within 7 days
- Backup copies are purged within 30 days
- Anonymized analytics data that cannot be linked back to you may be retained
- If you have an active subscription, it will be cancelled and no further charges will occur

### 5.6 Withdraw Consent
You may withdraw your consent for data collection by deleting your account. Certain data collection (crash reports, basic analytics) is necessary for the App to function; withdrawing consent for these requires ceasing use of the App.

---

## 6. Data Retention

| Data Type | Retention Period |
|-----------|-----------------|
| Active account data | Retained while your account is active |
| Inactive account data | Accounts inactive for 24 months may be flagged for deletion with 30-day prior notice |
| Payment records | Retained for 7 years to comply with Indian tax and financial regulations |
| Crash reports | Retained for 90 days, then automatically purged |
| Analytics data | Retained in anonymized, aggregated form indefinitely |
| Server logs | Retained for 30 days, then automatically purged |
| Deleted account data | Permanently purged within 30 days of deletion request |

---

## 7. Children's Privacy

MAA is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13 years of age.

If you are a parent or guardian and believe that your child under 13 has provided us with personal information, please contact us at privacy@maaapp.com. We will take steps to delete such information from our systems within a reasonable timeframe.

In compliance with the Children's Online Privacy Protection Act (COPPA) and equivalent provisions under Indian data protection law:
- We do not knowingly solicit data from children under 13
- We do not knowingly market to children under 13
- If we discover that we have collected data from a child under 13 without verified parental consent, we will delete it promptly

---

## 8. International Data Transfers

Our primary services are hosted on cloud infrastructure that may process data in regions outside India. When your data is transferred internationally:
- We ensure that our service providers maintain adequate data protection standards
- Transfers are governed by the service providers' data processing agreements
- We use providers that comply with industry-standard security certifications (SOC 2, ISO 27001)

---

## 9. Cookies and Tracking Technologies

The MAA mobile app does not use browser cookies and does not currently use any device-identifier-based tracking. We do not run advertising SDKs or behavioral analytics.

The only persistent identifier stored is your Supabase authentication session token, held in your device's secure storage solely to keep you signed in. When push notifications or analytics are introduced, this section will be updated to describe any identifiers they use.

---

## 10. Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we make material changes:
- We will update the "Last Updated" date at the top of this policy
- We will notify users through an in-app notification or email for significant changes
- Continued use of the App after changes constitutes acceptance of the updated policy

We encourage you to review this Privacy Policy periodically.

---

## 11. Governing Law

This Privacy Policy is governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000, and the Digital Personal Data Protection Act, 2023 (as applicable). Any disputes arising from this policy shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra, India.

---

## 12. Contact Us

If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

| Channel | Details |
|---------|---------|
| **Email** | privacy@maaapp.com |
| **Support** | support@maaapp.com |
| **Website** | https://maaapp.com/contact |
| **Mailing Address** | MAA Wellness Pvt. Ltd., Pune, Maharashtra, India |

We aim to respond to all privacy-related inquiries within 7 business days.

---

## 13. Planned Future Integrations

The following services are **not yet active** in the App. We are listing them transparently so you know what to expect. Before any of these begin collecting or processing your data, we will update this Privacy Policy, change the "Last Updated" date, and (for material changes) notify you in-app or by email.

| Planned Service | Intended Purpose | Data It Would Process |
|-----------------|------------------|------------------------|
| **Razorpay** | Live subscription payment processing | Name, email, phone for transactions. Card data handled entirely by Razorpay (PCI DSS Level 1); never stored by us. *(Currently the subscription flow runs in test mode and processes no real payments.)* |
| **Firebase Cloud Messaging** | Push notifications for reminders and events | Device push token, notification payload |
| **Crash reporting (e.g. Sentry)** | Diagnose crashes and stability issues | Device model, OS version, error stack traces (no message content or PII) |
| **Product analytics (e.g. Mixpanel)** | Understand aggregated, anonymized feature usage | Anonymized event names and counts (no PII) |
| **Media CDN (e.g. Cloudflare)** | Deliver course audio/video | IP address for routing only |

You will always be able to review the active set of services in Sections 3 and 4 of the then-current policy.

---

**MAA Wellness Pvt. Ltd.**
Pune, Maharashtra, India

> *Note for the team: "MAA Wellness Pvt. Ltd.", the Pune address, and the `@maaapp.com` contact emails are placeholders carried over from the project template. Replace them with the real legal entity, registered address, and working contact addresses before publishing this policy to an app store.*
