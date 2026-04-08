/**
 * File: OnboardingWelcome.tsx
 *
 * Description: First screen of the onboarding flow displaying app branding,
 * mission statement, and entry point to begin personalization or skip ahead.
 *
 * Author: Navnit(Ninjacode911)
 */

import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { OnboardingStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { colors } from '../utils/styles';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingWelcome'>;

const OnboardingWelcome = () => {
  const navigation = useNavigation<NavigationProp>();
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const handleSkip = async () => {
    await completeOnboarding(['meditation', 'mindfulness'], 10);
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        <TouchableOpacity onPress={handleSkip} style={s.skipBtn}>
          <Text style={s.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={s.centerContent}>
          <View style={s.iconCircle}>
            <Text style={s.iconText}>{'\u{1F33A}'}</Text>
          </View>

          <Text style={s.brandLabel}>
            Mata Amritanandamayi App
          </Text>

          <Text style={s.headline}>
            Begin your{'\n'}journey within
          </Text>

          <Text style={s.description}>
            Discover peace through meditation, yoga, pranayama, and spiritual wisdom guided by ancient traditions.
          </Text>
        </View>

        <View style={s.bottomSection}>
          <TouchableOpacity
            style={s.getStartedBtn}
            onPress={() => navigation.navigate('OnboardingInterests')}
          >
            <Text style={s.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          <View style={s.dotsRow}>
            <View style={s.dotActive} />
            <View style={s.dotInactive} />
            <View style={s.dotInactive} />
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  skipBtn: {
    alignSelf: 'flex-end',
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconText: {
    fontSize: 36,
    color: colors.white,
  },
  brandLabel: {
    fontSize: 14,
    letterSpacing: 2,
    color: colors.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: 30,
    fontFamily: 'PlayfairDisplay',
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  bottomSection: {
    gap: 12,
  },
  getStartedBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  getStartedText: {
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

export default OnboardingWelcome;
