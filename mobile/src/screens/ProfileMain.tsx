import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/user.service';

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
  <View className="w-[48%] bg-surface rounded-card border border-border p-4 mb-3 items-center">
    <Text className="text-xl font-bold text-primary">{value}</Text>
    <Text className="text-xs text-text-secondary mt-1">{label}</Text>
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
    className="flex-row items-center justify-between py-4 border-b border-border"
  >
    <Text
      className={`text-base ${danger ? 'text-red-500' : 'text-text-primary'}`}
    >
      {label}
    </Text>
    <Text className="text-text-secondary text-lg">{'\u{203A}'}</Text>
  </TouchableOpacity>
);

const ProfileMain = () => {
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
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Avatar + Name */}
        <View className="items-center pt-6 pb-4">
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-3">
            <Text className="text-3xl font-bold text-white">{initials}</Text>
          </View>
          <Text className="text-xl font-bold text-text-primary">
            {displayName}
          </Text>
          <View className="bg-accent/20 rounded-pill px-3 py-1 mt-2">
            <Text className="text-xs font-semibold text-accent capitalize">
              {level}
            </Text>
          </View>
          <TouchableOpacity className="mt-2">
            <Text className="text-accent text-sm font-semibold">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mt-2">
          <View className="flex-row flex-wrap justify-between">
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
          <View className="mx-6 mt-4 p-4 bg-primary/5 rounded-card border border-primary/20">
            <Text className="text-xs text-text-secondary uppercase tracking-wider mb-1">
              Current Plan: Free
            </Text>
            <Text className="text-base font-bold text-text-primary mb-2">
              Enhance Your Practice
            </Text>
            <Text className="text-sm text-text-secondary mb-3">
              Access all premium courses, ad-free meditations, and exclusive
              satsangs.
            </Text>
            <TouchableOpacity className="bg-primary py-3 rounded-button items-center">
              <Text className="text-white font-bold">Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings List */}
        <View className="px-6 mt-6 mb-8">
          <SettingsRow label="Subscription" onPress={() => {}} />
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

export default ProfileMain;
