/**
 * File: OnboardingWelcome.tsx
 *
 * Description: First screen of the onboarding flow displaying app branding,
 * mission statement, and entry point to begin personalization or skip ahead.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { OnboardingStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import apiClient from '../services/api';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingWelcome'>;

const OnboardingWelcome = () => {
  const navigation = useNavigation<NavigationProp>();
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [isSkipping, setIsSkipping] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const checkConnection = async () => {
      try {
        await apiClient.get('/health');
      } catch (err) {
        if (cancelled || !__DEV__) return;
        console.warn('[Onboarding] Backend unreachable on mount:', err);
        Alert.alert(
          'Connection Issue',
          'The app cannot reach the backend right now. Make sure the backend server is running and that your mobile/.env API_BASE_URL is set correctly for your setup (see docs/REQUIREMENTS.md).',
        );
      }
    };
    checkConnection();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSkip = async () => {
    if (isSkipping) return;
    setIsSkipping(true);
    try {
      await completeOnboarding(['meditation', 'mindfulness'], 10);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Please try again.';
      Alert.alert('Could not complete onboarding', message);
    } finally {
      setIsSkipping(false);
    }
  };

  const handleGetStarted = () => {
    navigation.navigate('OnboardingInterests');
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        <TouchableOpacity
          onPress={handleSkip}
          style={s.skipBtn}
          disabled={isSkipping}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text style={[s.skipText, isSkipping && s.skipTextDisabled]}>
            {isSkipping ? 'Skipping…' : 'Skip'}
          </Text>
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
            onPress={handleGetStarted}
            accessibilityRole="button"
            accessibilityLabel="Get started"
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
    backgroundColor: '#FFF5EE',
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
    color: '#87553E',
    fontSize: 16,
  },
  skipTextDisabled: {
    opacity: 0.5,
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
    backgroundColor: '#ED7624',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconText: {
    fontSize: 36,
    color: '#FFFFFF',
  },
  brandLabel: {
    fontSize: 14,
    letterSpacing: 2,
    color: '#87553E',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: 30,
    fontFamily: 'PlayfairDisplay',
    fontWeight: 'bold',
    color: '#5C250E',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#87553E',
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
    backgroundColor: '#ED7624',
    alignItems: 'center',
  },
  getStartedText: {
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

export default OnboardingWelcome;
