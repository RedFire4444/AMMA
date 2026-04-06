/**
 * File: OnboardingWelcome.tsx
 *
 * Description: First screen of the onboarding flow displaying app branding,
 * mission statement, and entry point to begin personalization or skip ahead.
 *
 * Author: Navnit(Ninjacode911)
 */

import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { OnboardingStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingWelcome'>;

const OnboardingWelcome = () => {
  const navigation = useNavigation<NavigationProp>();
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const handleSkip = async () => {
    await completeOnboarding(['meditation', 'mindfulness'], 10);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-between px-6 py-8">
        <TouchableOpacity onPress={handleSkip} className="self-end">
          <Text className="text-text-secondary text-base">Skip</Text>
        </TouchableOpacity>

        <View className="items-center flex-1 justify-center">
          <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-8">
            <Text className="text-4xl text-white">{'\u{1F33A}'}</Text>
          </View>

          <Text className="text-sm tracking-widest text-text-secondary mb-4 uppercase">
            Mata Amritanandamayi App
          </Text>

          <Text className="text-3xl font-serif font-bold text-primary text-center mb-4">
            Begin your{'\n'}journey within
          </Text>

          <Text className="text-base text-text-secondary text-center px-8 leading-6">
            Discover peace through meditation, yoga, pranayama, and spiritual wisdom guided by ancient traditions.
          </Text>
        </View>

        <View className="space-y-3">
          <TouchableOpacity
            className="w-full py-4 rounded-button bg-primary items-center"
            onPress={() => navigation.navigate('OnboardingInterests')}
          >
            <Text className="text-white font-bold text-lg">Get Started</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4 space-x-2">
            <View className="w-8 h-2 rounded-full bg-primary" />
            <View className="w-2 h-2 rounded-full bg-gray-300" />
            <View className="w-2 h-2 rounded-full bg-gray-300" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingWelcome;
