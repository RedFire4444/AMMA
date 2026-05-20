/**
 * File: ProfileMain.tsx
 *
 * Description: User profile screen showing avatar, stats grid, premium upsell
 * card, and settings rows for subscription, notifications, and logout.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { userService, UserProfile } from '../services/user.service';
import { ProfileStackParamList } from '../navigation/types';
import { colors } from '../utils/styles';

type ProfileNavProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <View style={s.statCard}>
    <Text style={s.statCardValue}>{value}</Text>
    <Text style={s.statCardLabel}>{label}</Text>
  </View>
);

const SettingsRow = ({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={s.settingsRow}
  >
    <Text
      style={[s.settingsLabel, danger ? s.settingsLabelDanger : s.settingsLabelNormal]}
    >
      {label}
    </Text>
    <Text style={s.settingsChevron}>{'\u{203A}'}</Text>
  </TouchableOpacity>
);

const ProfileMain = () => {
  const navigation = useNavigation<ProfileNavProp>();
  const { logout, user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const data = await userService.getProfile();
        if (!cancelled) setProfile(data);
      } catch (err) {
        // Auth errors bubble up; everything else returns a skeleton.
        if (__DEV__) console.warn('[Profile] Load failed:', err);
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const displayName = profile?.full_name || user?.email || 'User';
  const initials = displayName.charAt(0).toUpperCase();
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).getFullYear().toString()
    : '--';
  const level = profile?.level || 'beginner';

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView
        style={s.flex1}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + Name */}
        <View style={s.avatarSection}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarInitials}>{initials}</Text>
          </View>
          <Text style={s.displayName}>
            {displayName}
          </Text>
          <View style={s.levelBadge}>
            <Text style={s.levelText}>
              {level}
            </Text>
          </View>
          <TouchableOpacity
            style={s.editProfileBtn}
            onPress={() =>
              Alert.alert(
                'Edit Profile',
                'Profile editing will be available once your account is set up with a backend connection.',
              )
            }
          >
            <Text style={s.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={s.statsSection}>
          <View style={s.statsGrid}>
            <StatCard label="Member Since" value={memberSince} />
            <StatCard label="Longest Streak" value="0 Days" />
            <StatCard label="Total Duration" value="0h" />
            <StatCard label="Sessions" value="0" />
            <StatCard label="Longest Session" value="0m" />
            <StatCard label="Monthly Progress" value="0%" />
          </View>
        </View>

        {/* Premium Upsell (Free users) */}
        {profile?.subscription_status !== 'active' && (
          <View style={s.premiumCard}>
            <Text style={s.premiumPlanLabel}>
              Current Plan: Free
            </Text>
            <Text style={s.premiumTitle}>
              Enhance Your Practice
            </Text>
            <Text style={s.premiumDesc}>
              Access all premium courses, ad-free meditations, and exclusive
              satsangs.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Paywall')}
              style={s.premiumBtn}
            >
              <Text style={s.premiumBtnText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings List */}
        <View style={s.settingsSection}>
          <SettingsRow
            label="Subscription"
            onPress={() => navigation.navigate('Subscription')}
          />
          <SettingsRow
            label="Notifications"
            onPress={() =>
              Alert.alert(
                'Notifications',
                'Manage daily meditation reminders, event alerts, and content updates.\n\nPush notifications require Firebase setup.',
              )
            }
          />
          <SettingsRow
            label="Invite a Friend"
            onPress={() =>
              Alert.alert(
                'Invite a Friend',
                'Share MAA with friends and family! Your referral link will be generated once the invite system is activated.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Copy Link', onPress: () => Alert.alert('Copied!', 'Your referral link has been copied to clipboard.') },
                ],
              )
            }
          />
          <SettingsRow
            label="Terms & Privacy"
            onPress={() =>
              Alert.alert(
                'Terms & Privacy',
                'View our Terms of Service and Privacy Policy at:\n\nmaaapp.com/terms\nmaaapp.com/privacy',
              )
            }
          />
          <SettingsRow
            label="Helpdesk"
            onPress={() =>
              Alert.alert(
                'Helpdesk',
                'Need help? Reach out to our support team.\n\nEmail: support@maaapp.com\nResponse time: Within 24 hours',
              )
            }
          />
          <SettingsRow label="Logout" onPress={handleLogout} />
          <SettingsRow
            label="Delete Account"
            danger
            onPress={() =>
              Alert.alert(
                'Delete Account',
                'This will permanently delete your account and all associated data (meditation sessions, streaks, course progress). This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete Forever',
                    style: 'destructive',
                    onPress: () =>
                      Alert.alert(
                        'Account Deletion',
                        'Account deletion will be processed once backend deletion service is active.',
                      ),
                  },
                ],
              )
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5EE',
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ED7624', // Timer primary orange
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#ED7624',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C250E', // Timer text dark
  },
  levelBadge: {
    backgroundColor: 'rgba(240, 127, 46, 0.15)',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ED7624',
    textTransform: 'capitalize',
  },
  editProfileBtn: {
    marginTop: 8,
  },
  editProfileText: {
    color: '#ED7624',
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.12)',
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ED7624',
  },
  statCardLabel: {
    fontSize: 12,
    color: '#87553E', // Timer text secondary
    marginTop: 4,
  },
  premiumCard: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(240, 127, 46, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.12)',
  },
  premiumPlanLabel: {
    fontSize: 12,
    color: '#87553E',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C250E',
    marginBottom: 8,
  },
  premiumDesc: {
    fontSize: 14,
    color: '#87553E',
    marginBottom: 12,
  },
  premiumBtn: {
    backgroundColor: '#ED7624',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#ED7624',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  premiumBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  settingsSection: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 127, 46, 0.12)',
  },
  settingsLabel: {
    fontSize: 16,
  },
  settingsLabelNormal: {
    color: '#5C250E',
  },
  settingsLabelDanger: {
    color: colors.error,
  },
  settingsChevron: {
    color: '#87553E',
    fontSize: 18,
  },
});

export default ProfileMain;
