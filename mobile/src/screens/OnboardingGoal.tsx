/**
 * File: OnboardingGoal.tsx
 *
 * Description: Third onboarding screen where users set their daily meditation
 * goal duration and configure daily reminder preferences.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { colors } from '../utils/styles';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingGoal'>;

const DURATIONS = [3, 5, 10, 15, 20, 30];

const OnboardingGoal = ({ route }: Props) => {
  const { interests } = route.params;
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { completeOnboarding, isLoading } = useAuthStore();

  const handleStart = async () => {
    await completeOnboarding(interests, selectedDuration);
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        <View>
          <Text style={s.title}>
            Set your daily goal
          </Text>
          <Text style={s.subtitle}>
            How many minutes would you like to meditate each day?
          </Text>

          <View style={s.durationsGrid}>
            {DURATIONS.map((duration) => {
              const isSelected = selectedDuration === duration;
              return (
                <TouchableOpacity
                  key={duration}
                  onPress={() => setSelectedDuration(duration)}
                  style={[
                    s.durationPill,
                    isSelected ? s.durationPillSelected : s.durationPillUnselected,
                  ]}
                >
                  <Text
                    style={[
                      s.durationValue,
                      isSelected ? s.durationValueSelected : s.durationValueUnselected,
                    ]}
                  >
                    {duration}
                  </Text>
                  <Text
                    style={[
                      s.durationUnit,
                      isSelected ? s.durationUnitSelected : s.durationUnitUnselected,
                    ]}
                  >
                    min
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.reminderRow}>
            <View style={s.reminderTextWrap}>
              <Text style={s.reminderTitle}>
                Daily Reminders
              </Text>
              <Text style={s.reminderDesc}>
                Get gentle reminders to keep your practice consistent
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E7EB', true: '#2D6A4F' }}
              thumbColor={notificationsEnabled ? '#1B4332' : '#f4f4f4'}
            />
          </View>
        </View>

        <View>
          <TouchableOpacity
            style={[s.startBtn, isLoading ? s.startBtnLoading : s.startBtnActive]}
            onPress={handleStart}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={s.startBtnText}>
                Start My Journey
              </Text>
            )}
          </TouchableOpacity>

          <View style={s.dotsRow}>
            <View style={s.dotInactive} />
            <View style={s.dotInactive} />
            <View style={s.dotActive} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay',
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  durationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  durationPill: {
    width: '30%',
    marginBottom: 12,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  durationPillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  durationPillUnselected: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  durationValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  durationValueSelected: {
    color: colors.white,
  },
  durationValueUnselected: {
    color: colors.textPrimary,
  },
  durationUnit: {
    fontSize: 12,
  },
  durationUnitSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  durationUnitUnselected: {
    color: colors.textSecondary,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reminderTextWrap: {
    flex: 1,
    marginRight: 16,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  reminderDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  startBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startBtnActive: {
    backgroundColor: colors.primary,
  },
  startBtnLoading: {
    backgroundColor: colors.primaryLight,
  },
  startBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  dotActive: {
    width: 32,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray300,
  },
});

export default OnboardingGoal;
