# Privacy Policy — MAA Meditation & Wellness

**Effective Date**: April 5, 2026
**Last Updated**: April 5, 2026

---

MAA Wellness Pvt. Ltd. ("MAA," "we," "us," or "our") operates the MAA - Meditation & Wellness mobile application (the "App") and the website at https://mamapp.com (the "Website"). This Privacy Policy describes how we collect, use, store, and protect your personal information when you use our services.

By using the App, you agree to the collection and use of information as described in this Privacy Policy. If you do not agree with the terms of this policy, please do not use our services.

---

## 1. Information We Collect

### 1.1 Information You Provide Directly

| Data Type | When Collected | Purpose |
|-----------|---------------|---------|
| **Phone Number** | Account registration | OTP-based authentication and account verification |
| **Email Address** | Optional during registration or profile setup | Account recovery, important service notifications |
| **Full Name** | Profile setup | Display name within the app |
| **Profile Picture** | Optional profile customization | Displayed on your profile screen |
| **Payment Information** | Subscription purchase | Processed securely by Razorpay; we do not store card numbers |
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
| **Device Information** | Automatic | App compatibility, crash diagnostics (device model, OS version) |
| **App Usage Analytics** | Mixpanel SDK | Understand feature usage, improve the user experience |
| **Crash Reports** | Sentry SDK | Identify and fix bugs, improve app stability |
| **Push Notification Token** | Firebase Cloud Messaging (FCM) | Deliver push notifications for reminders and events |
| **IP Address** | Server logs | Security, fraud prevention, approximate geographic region |

### 1.4 Information We Do Not Collect

- Precise GPS location or geolocation data
- Contact lists or address book data
- SMS or call log data
- Photos, videos, or files from your device (unless you upload a profile picture)
- Health data from Apple HealthKit or Google Health Connect
- Biometric data
- Browsing history outside the App

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

### 2.4 Analytics and Improvement
- Analyze aggregated, anonymized usage patterns to improve features
- Monitor app performance and identify technical issues
- Understand which features are most valuable to users
- Inform product development and content curation decisions

### 2.5 Security
- Detect and prevent fraudulent or unauthorized access
- Enforce our Terms of Service
- Comply with legal obligations

---

## 3. Data Storage and Security

### 3.1 Where Your Data Is Stored

| Service | Data Stored | Location |
|---------|-------------|----------|
| **Supabase** (PostgreSQL) | User accounts, meditation data, course progress, habits, subscriptions, events | Cloud-hosted (AWS infrastructure) |
| **Cloudflare R2** | Media files (audio, video, images for courses and content) | Cloudflare global edge network |
| **Firebase (FCM)** | Push notification tokens | Google Cloud Platform |
| **Sentry** | Crash reports and error logs | Sentry cloud infrastructure |
| **Mixpanel** | Anonymized usage analytics events | Mixpanel cloud infrastructure |

### 3.2 Security Measures

We implement industry-standard security measures to protect your data:

- **Encryption in Transit**: All data transmitted between the App and our servers uses HTTPS with TLS 1.2 or higher
- **Encryption at Rest**: Database records are encrypted using AES-256 encryption provided by our hosting infrastructure
- **Authentication**: Secure token-based authentication with automatic session expiry
- **Access Control**: Role-based access controls limit data access to authorized personnel only
- **API Security**: Rate limiting, input validation, and parameterized queries to prevent injection attacks
- **Payment Security**: Payment card details are processed by Razorpay (PCI DSS Level 1 compliant) and never touch our servers
- **Regular Audits**: Periodic security reviews of our infrastructure and codebase

### 3.3 Data Breach Notification

In the event of a data breach that affects your personal information, we will notify affected users within 72 hours of becoming aware of the breach, in compliance with applicable laws. Notification will be sent via email (if available) and through an in-app notice.

---

## 4. Third-Party Services

We use the following third-party services that may receive or process your data:

| Service | Purpose | Data Shared | Privacy Policy |
|---------|---------|-------------|----------------|
| **Supabase** | Backend infrastructure, authentication, database | Account data, app data | https://supabase.com/privacy |
| **Razorpay** | Payment processing | Payment details (name, email, phone for transactions) | https://razorpay.com/privacy/ |
| **Firebase (Google)** | Push notifications (FCM) | Device token, notification payload | https://firebase.google.com/support/privacy |
| **Sentry** | Error monitoring and crash reporting | Device info, error stack traces (no personal data) | https://sentry.io/privacy/ |
| **Mixpanel** | Product analytics | Anonymized usage events (no PII) | https://mixpanel.com/legal/privacy-policy/ |
| **Cloudflare** | Content delivery (CDN) for media files | IP address (for CDN routing) | https://www.cloudflare.com/privacypolicy/ |

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
You can request a copy of your personal data by emailing privacy@mamapp.com. We will provide your data in a machine-readable format (JSON) within 30 days of your request.

### 5.5 Delete Your Account
You can permanently delete your account and all associated data through:
- **In-App**: Profile > Settings > Delete Account
- **Email**: Send a request to privacy@mamapp.com

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

If you are a parent or guardian and believe that your child under 13 has provided us with personal information, please contact us at privacy@mamapp.com. We will take steps to delete such information from our systems within a reasonable timeframe.

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

The MAA mobile app does not use browser cookies. However:
- **Mixpanel SDK** uses device identifiers to track anonymized app usage events
- **Firebase** uses instance IDs for push notification delivery
- **Sentry** uses session identifiers for crash grouping

The MAA website (https://mamapp.com) may use cookies for essential functionality (session management) and analytics. A separate cookie notice is provided on the website.

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
| **Email** | privacy@mamapp.com |
| **Support** | support@mamapp.com |
| **Website** | https://mamapp.com/contact |
| **Mailing Address** | MAA Wellness Pvt. Ltd., Pune, Maharashtra, India |

We aim to respond to all privacy-related inquiries within 7 business days.

---

**MAA Wellness Pvt. Ltd.**
Pune, Maharashtra, India
