/**
 * File: TermsPrivacyScreen.tsx
 *
 * Description: Displays Terms of Service and Privacy Policy with scrollable content.
 * Accessible from Profile > Terms & Privacy.
 *
 * Author: Kiro (AI Assistant)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TabItem {
  id: 'terms' | 'privacy';
  label: string;
  file: string;
}

const TABS: TabItem[] = [
  { id: 'terms', label: 'Terms', file: 'TERMS_OF_SERVICE.md' },
  { id: 'privacy', label: 'Privacy', file: 'PRIVACY_POLICY.md' },
];

const parseMarkdown = (text: string): JSX.Element[] => {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockContent = [];
      } else {
        elements.push(
          <View key={`code-${i}`} style={s.codeBlock}>
            <Text style={s.codeText}>{codeBlockContent.join('\n')}</Text>
          </View>,
        );
        inCodeBlock = false;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Handle headers
    if (line.startsWith('## ')) {
      elements.push(
        <Text key={`h2-${i}`} style={s.sectionTitle}>
          {line.substring(3)}
        </Text>,
      );
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <Text key={`h3-${i}`} style={s.subSectionTitle}>
          {line.substring(4)}
        </Text>,
      );
      continue;
    }

    // Handle list items
    if (line.trim().startsWith('- ')) {
      elements.push(
        <Text key={`li-${i}`} style={s.listItem}>
          {line.substring(2)}
        </Text>,
      );
      continue;
    }

    // Handle links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
    const match = line.match(linkRegex);
    if (match) {
      const textBeforeLink = line.substring(0, match.index);
      const linkText = match[1];
      const url = match[2];

      elements.push(
        <Text key={`link-${i}`}>
          {textBeforeLink}
          <Text
            style={s.link}
            onPress={() => Linking.openURL(url).catch(() => {})}
          >
            {linkText}
          </Text>
        </Text>,
      );
      continue;
    }

    // Handle bold text
    const boldRegex = /\*\*([^*]+)\*\*/;
    const boldMatch = line.match(boldRegex);
    if (boldMatch) {
      const textBeforeBold = line.substring(0, boldMatch.index);
      const boldText = boldMatch[1];
      const textAfterBold = line.substring(boldMatch.index + boldMatch[0].length);

      elements.push(
        <Text key={`bold-${i}`}>
          {textBeforeBold}
          <Text style={s.bold}>{boldText}</Text>
          {textAfterBold}
        </Text>,
      );
      continue;
    }

    // Regular paragraph
    if (line.trim() !== '') {
      elements.push(<Text key={`p-${i}`} style={s.paragraph}>{line}</Text>);
    } else {
      elements.push(<View key={`spacer-${i}`} style={s.spacer} />);
    }
  }

  return elements;
};

const readFileContent = (filename: string): string => {
  // In a real app, you would read from the file system or fetch from docs folder
  // For now, we'll use placeholder content that matches the actual legal documents
  const legalDocs: Record<string, string> = {
    TERMS_OF_SERVICE: `# Terms of Service — MAA Meditation & Wellness

Effective Date: April 5, 2026
Last Updated: April 5, 2026

Please read these Terms of Service ("Terms") carefully before using the MAA - Meditation & Wellness mobile application.

## 1. Service Description

### 1.1 What MAA Provides

MAA is a spiritual wellness and meditation platform that offers:

- Guided Meditations: Audio and video meditation sessions
- Structured Courses: Step-by-step learning programs
- Meditation Timer: Customizable unguided meditation timer
- Daily Sadhana Tracking: Habit tracking with streaks and analytics
- Content Directory: Searchable library of bhajans and satsangs
- Live Events: Registration and participation in live sessions
- Daily Quotes: Curated spiritual quotes refreshed daily
- Premium Subscription: Enhanced access to content library

### 1.2 Service Availability

MAA is available on iOS and Android devices. We strive to maintain continuous availability but do not guarantee uninterrupted access.

### 1.3 Eligibility

You must be at least 13 years of age to create an account and use the App.

## 2. User Accounts and Responsibilities

### 2.1 Account Registration

To use MAA, you must create an account using one of the following methods:
- Phone number with OTP verification
- Email address with password
- Google OAuth sign-in

### 2.2 Account Security

You are responsible for maintaining the confidentiality of your account credentials and all activities that occur under your account.

### 2.3 One Account Per Person

Each individual may maintain only one active account.

## 3. Subscription and Payment Terms

### 3.1 Free Tier

MAA offers a free tier that includes:
- Access to a limited selection of guided meditations (10 sessions)
- 1 free course
- Basic meditation timer with selected ambient sounds
- Daily sadhana tracking with streak counters
- Daily spiritual quotes
- Event browsing

### 3.2 Premium Subscription

MAA Premium unlocks the full experience:
- Complete meditation library (500+ sessions)
- All courses with video and audio lessons
- Advanced pranayama sessions
- Full ambient sound collection
- Detailed streak insights and analytics
- Live event access with replays
- Offline downloads
- Ad-free experience

### 3.3 Pricing

| Plan | Price | Billing Cycle |
|------|-------|--------------|
| Monthly | ₹199 per month | Billed monthly |
| Annual | ₹1,499 per year | Billed annually (~37% savings) |

### 3.4 Payment Processing

Payments are processed securely through Razorpay.

### 3.5 Subscription Renewal

- Monthly Plan: Automatically renews every 30 days
- Annual Plan: Automatically renews every 365 days

### 3.6 Cancellation

You may cancel your subscription at any time through Profile > Subscription > Cancel Subscription.

### 3.7 Refunds

- Refund requests must be submitted within 7 days of the charge date
- Email support@maaapp.com to request a refund
- Partial-month or partial-year refunds are generally not provided

## 4. Content and Intellectual Property

### 4.1 MAA Content

All content available through the App is owned by MAA Wellness Pvt. Ltd. or licensed from content creators.

### 4.2 Limited License

We grant you a limited, non-exclusive, non-transferable, revocable license to:
- Stream and access content through the App for personal, non-commercial use
- Download content for offline use (Premium subscribers only)

### 4.3 Restrictions

You may not:
- Copy, reproduce, distribute, or publicly display any content
- Record, screen-capture, or create derivative works from sessions
- Remove, alter, or obscure any copyright notices
- Use content for commercial purposes

## 5. Prohibited Conduct

You agree not to:
1. Misuse the Service or attempt to gain unauthorized access
2. Circumvent security or authentication systems
3. Abuse the Platform or transmit harmful code
4. Manipulate Data or streak records
5. Harass others
6. Impersonate any person or entity
7. Spam or send unsolicited communications
8. Violate applicable laws

## 6. Disclaimers

### 6.1 No Medical Advice

MAA provides meditation and wellness content for general well-being purposes only. The content is not a substitute for professional medical advice.

### 6.2 Service "As Is"

THE APP AND ALL CONTENT ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.

## 7. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, MAA WELLNESS PVT. LTD. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

## 8. Termination

You may terminate your account at any time by deleting your account through Profile > Settings > Delete Account.

## 9. Governing Law

These Terms shall be governed by and construed in accordance with the laws of India. Subject to the arbitration provision, any legal proceedings shall be brought exclusively in the courts located in Pune, Maharashtra, India.

## 10. Contact Information

For questions, concerns, or feedback regarding these Terms:

| Channel | Details |
|---------|---------|
| General Support | support@maaapp.com |
| Legal Inquiries | legal@maaapp.com |
| Privacy Concerns | privacy@maaapp.com |

We aim to respond to all inquiries within 7 business days.

## 11. Changes to These Terms

We may update these Terms from time to time. When we make material changes, we will notify you through an in-app notification or email at least 15 days before the changes take effect.
`,
    PRIVACY_POLICY: `# Privacy Policy — MAA Meditation & Wellness

Effective Date: May 28, 2026
Last Updated: May 28, 2026
Status: Beta / pre-launch

MAA Wellness Pvt. Ltd. ("MAA") operates the MAA - Meditation & Wellness mobile application. This Privacy Policy describes how we collect, use, store, and protect your personal information.

## 1. Information We Collect

### 1.1 Information You Provide Directly

| Data Type | When Collected | Purpose |
|-----------|---------------|---------|
| Phone Number | Account registration | OTP-based authentication |
| Email Address | Optional during registration | Account recovery |
| Full Name | Profile setup | Display name within the app |
| Profile Picture | Optional profile customization | Displayed on your profile |
| Payment Information | Subscription purchase | Processed securely by Razorpay |

### 1.2 Information Generated Through App Usage

| Data Type | Description | Purpose |
|-----------|-------------|---------|
| Meditation Session Data | Duration, completion status, timestamp | Track your practice, display stats |
| Course Progress | Enrolled courses, completed lessons | Resume where you left off |
| Habit Tracking Data | Daily check-ins for meditation, exercise | Display streaks, heatmaps |
| Bookmarks and Favorites | Content items you bookmark | Personalize your content library |
| Event Registrations | Events you register for | Send reminders |
| Subscription Status | Plan type, start date, expiry date | Manage your subscription |

### 1.3 Information Collected Automatically

| Data Type | Collection Method | Purpose |
|-----------|-------------------|---------|
| IP Address | Server access logs | Security, abuse prevention |
| Authentication Session Token | Issued by Supabase Auth | Keep you signed in securely |

## 2. How We Use Your Information

We use the information we collect for the following purposes:

### 2.1 Core App Functionality
- Authenticate your identity via phone OTP or email/password
- Display your profile information within the App
- Track and display your meditation sessions, streaks, and habit data
- Manage course enrollment and lesson progress

### 2.2 Subscription and Payments
- Process subscription purchases through Razorpay
- Manage subscription status, renewals, and cancellations

### 2.3 Communication
- Send push notifications for meditation reminders and event alerts
- Send transactional emails (password reset, account verification)

### 2.4 Security
- Detect and prevent fraudulent or unauthorized access
- Enforce our Terms of Service

## 3. Data Storage and Security

### 3.1 Where Your Data Is Stored

| Service | Data Stored | Location |
|---------|-------------|----------|
| Supabase | User accounts, authentication, app data | Cloud-hosted (AWS infrastructure) |
| Device Keychain | Your encrypted authentication session token | On your own device (secure storage) |

### 3.2 Security Measures

We implement industry-standard security measures:
- Encryption in Transit: HTTPS with TLS 1.2+
- Encryption at Rest: Database records encrypted
- On-Device Token Storage: Stored in device's secure storage
- Authentication: Token-based authentication with automatic refresh
- Row-Level Security: Each user can only access their own records
- API Security: Rate limiting, input validation, parameterized queries

## 4. Third-Party Services

| Service | Purpose | Data Shared |
|---------|---------|-------------|
| Supabase | Backend infrastructure, authentication, database | Account data, app data |
| Fly.io | Application server hosting | Server request metadata |

We do not sell your personal information. We do not share your personal information with third parties for their own marketing purposes.

## 5. Your Rights and Choices

### 5.1 Access Your Data
You can view your personal information within the App under your Profile section.

### 5.2 Update Your Information
You can update your name, email, and profile picture from Profile > Edit Profile.

### 5.3 Delete Your Account
You can permanently delete your account and all associated data through Profile > Settings > Delete Account.

### 5.4 Export Your Data
You can request a copy of your personal data by emailing privacy@maaapp.com.

## 6. Data Retention

| Data Type | Retention Period |
|-----------|-----------------|
| Active account data | Retained while your account is active |
| Inactive account data | Accounts inactive for 24 months may be flagged for deletion |
| Payment records | Retained for 7 years for tax compliance |
| Server logs | Retained for 30 days, then automatically purged |

## 7. Children's Privacy

MAA is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13 years of age.

## 8. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. When we make material changes, we will notify you through an in-app notification or email.

## 9. Contact Us

If you have any questions, concerns, or requests regarding this Privacy Policy:

| Channel | Details |
|---------|---------|
| Email | privacy@maaapp.com |
| Support | support@maaapp.com |

We aim to respond to all privacy-related inquiries within 7 business days.

## 10. Planned Future Integrations

The following services are not yet active in the App:
- Razorpay: Live subscription payment processing
- Firebase Cloud Messaging: Push notifications
- Crash reporting: Diagnose crashes and stability issues
- Product analytics: Understand feature usage
- Media CDN: Deliver course audio/video
`,
  };

  // Map file name to content
  if (filename === 'TERMS_OF_SERVICE.md') {
    return legalDocs.TERMS_OF_SERVICE;
  } else if (filename === 'PRIVACY_POLICY.md') {
    return legalDocs.PRIVACY_POLICY;
  }
  return 'Content not available.';
};

const TermsPrivacyScreen = () => {
  const [activeTab, setActiveTab] = useState<TabItem['id']>('terms');
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];
  const content = readFileContent(currentTab.file);

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backButton}
          onPress={() => {
            // @ts-ignore
            if (typeof navigation !== 'undefined' && navigation.goBack) {
              // @ts-ignore
              navigation.goBack();
            }
          }}
          accessibilityLabel="Back"
        >
          <Text style={s.backArrow}>←</Text>
          <Text style={s.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Legal</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[s.tab, activeTab === tab.id && s.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.id }}
          >
            <Text style={[s.tabText, activeTab === tab.id && s.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {parseMarkdown(content)}
      </ScrollView>

      {/* Bottom Disclaimer */}
      <View style={s.disclaimerContainer}>
        <TouchableOpacity
          style={s.disclaimerButton}
          onPress={() => setShowDisclaimer(true)}
        >
          <Text style={s.disclaimerText}>View Full Legal Documents</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer Modal */}
      <Modal
        visible={showDisclaimer}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisclaimer(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Legal Documents</Text>
            <Text style={s.modalText}>
              The legal documents displayed in this screen are a summary of the full policies. For the complete terms and conditions, please refer to our official legal documents:
            </Text>
            <TouchableOpacity
              style={s.modalButton}
              onPress={() => Linking.openURL('https://maaapp.com/terms').catch(() => {})}
            >
              <Text style={s.modalButtonText}>View Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.modalButton, { marginTop: 8 }]}
              onPress={() => Linking.openURL('https://maaapp.com/privacy').catch(() => {})}
            >
              <Text style={s.modalButtonText}>View Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.modalButton, s.modalCloseButton]}
              onPress={() => setShowDisclaimer(false)}
            >
              <Text style={s.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// @ts-ignore - navigation prop will be provided by React Navigation
TermsPrivacyScreen.navigationOptions = {
  headerShown: false,
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF5EE' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 127, 46, 0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backArrow: { fontSize: 18, marginRight: 4 },
  backText: { fontSize: 14, color: '#ED7624', fontWeight: '600' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#5C250E' },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 127, 46, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#ED7624',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#87553E',
  },
  tabTextActive: {
    color: '#ED7624',
  },
  content: { flex: 1, padding: 16 },
  spacer: { height: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C250E',
    marginTop: 16,
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C250E',
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 8,
  },
  link: {
    color: '#ED7624',
    textDecorationLine: 'underline',
  },
  bold: {
    fontWeight: 'bold',
    color: '#5C250E',
  },
  listItem: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 4,
    paddingLeft: 8,
  },
  codeBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 6,
    padding: 12,
    marginVertical: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  disclaimerContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(240, 127, 46, 0.1)',
    backgroundColor: '#FFF5EE',
  },
  disclaimerButton: {
    backgroundColor: '#ED7624',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  disclaimerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C250E',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: '#ED7624',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: 'rgba(240, 127, 46, 0.1)',
    marginTop: 12,
  },
  modalCloseButtonText: {
    color: '#87553E',
  },
});

export default TermsPrivacyScreen;
