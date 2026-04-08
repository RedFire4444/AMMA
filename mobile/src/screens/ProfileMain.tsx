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
import { userService } from '../services/user.service';
import { ProfileStackParamList } from '../navigation/types';
import { colors } from '../utils/styles';

type ProfileNavProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

interface UserProfile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  level: string;
  created_at: string;
  subscription_status: string;
}

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
    const loadProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile(data as UserProfile);
      } catch {
        // Profile may not exist yet
      }
    };
    loadProfile();
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
      <ScrollView style={s.flex1} showsVerticalScrollIndicator={false}>
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
          <TouchableOpacity style={s.editProfileBtn}>
            <Text style={s.editProfileText}>
              Edit Profile
            </Text>
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
          <SettingsRow label="Subscription" onPress={() => navigation.navigate('Subscription')} />
          <SettingsRow label="Notifications" onPress={() => {}} />
          <SettingsRow label="Invite a Friend" onPress={() => {}} />
          <SettingsRow label="Terms & Privacy" onPress={() => {}} />
          <SettingsRow label="Helpdesk" onPress={() => {}} />
          <SettingsRow label="Logout" onPress={handleLogout} />
          <SettingsRow label="Delete Account" onPress={() => {}} danger />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1,
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.white,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  levelBadge: {
    backgroundColor: 'rgba(64, 145, 108, 0.2)',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    textTransform: 'capitalize',
  },
  editProfileBtn: {
    marginTop: 8,
  },
  editProfileText: {
    color: colors.accent,
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statCardLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  premiumCard: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(27, 67, 50, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(27, 67, 50, 0.2)',
  },
  premiumPlanLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  premiumDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  premiumBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumBtnText: {
    color: colors.white,
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
    borderBottomColor: colors.border,
  },
  settingsLabel: {
    fontSize: 16,
  },
  settingsLabelNormal: {
    color: colors.textPrimary,
  },
  settingsLabelDanger: {
    color: colors.error,
  },
  settingsChevron: {
    color: colors.textSecondary,
    fontSize: 18,
  },
});

export default ProfileMain;
