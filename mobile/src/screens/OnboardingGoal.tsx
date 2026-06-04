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
  Switch,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';

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
              trackColor={{ false: 'rgba(240, 127, 46, 0.2)', true: '#F0A16C' }}
              thumbColor={notificationsEnabled ? '#ED7624' : '#f4f4f4'}
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
    backgroundColor: '#FFF5EE',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay',
    fontWeight: 'bold',
    color: '#5C250E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#87553E',
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
    justifyContent: 'center',
    borderWidth: 2,
  },
  durationPillSelected: {
    borderColor: '#ED7624',
    backgroundColor: '#ED7624',
  },
  durationPillUnselected: {
    borderColor: 'rgba(240, 127, 46, 0.12)',
    backgroundColor: '#FFFFFF',
  },
  durationValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  durationValueSelected: {
    color: '#FFFFFF',
  },
  durationValueUnselected: {
    color: '#5C250E',
  },
  durationUnit: {
    fontSize: 12,
  },
  durationUnitSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  durationUnitUnselected: {
    color: '#87553E',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.12)',
  },
  reminderTextWrap: {
    flex: 1,
    marginRight: 16,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C250E',
  },
  reminderDesc: {
    fontSize: 14,
    color: '#87553E',
    marginTop: 4,
  },
  startBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startBtnActive: {
    backgroundColor: '#ED7624',
  },
  startBtnLoading: {
    backgroundColor: '#F07F2E',
  },
  startBtnText: {
    color: '#FFFFFF',
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
    backgroundColor: '#ED7624',
  },
  dotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(240, 127, 46, 0.2)',
  },
});

export default OnboardingGoal;
