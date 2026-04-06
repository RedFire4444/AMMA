/**
 * File: OnboardingInterests.tsx
 *
 * Description: Second onboarding screen where users select their spiritual
 * interests (meditation, yoga, pranayama, etc.) to personalize their experience.
 *
 * Author: Navnit(Ninjacode911)
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { OnboardingStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingInterests'>;

const INTERESTS = [
  { id: 'meditation', label: 'Meditation', icon: '\u{1F9D8}' },
  { id: 'yoga', label: 'Yoga', icon: '\u{1F3CB}' },
  { id: 'pranayama', label: 'Pranayama', icon: '\u{1F32C}' },
  { id: 'chanting', label: 'Chanting', icon: '\u{1F3B6}' },
  { id: 'sleep', label: 'Sleep', icon: '\u{1F319}' },
  { id: 'stress', label: 'Stress Relief', icon: '\u{1F33F}' },
  { id: 'focus', label: 'Focus', icon: '\u{1F3AF}' },
  { id: 'spirituality', label: 'Spirituality', icon: '\u{2728}' },
];

const OnboardingInterests = () => {
  const navigation = useNavigation<NavigationProp>();
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');

  const toggleInterest = (id: string) => {
    setError('');
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleNext = () => {
    if (selected.length === 0) {
      setError('Please select at least one interest');
      return;
    }
    navigation.navigate('OnboardingGoal', { interests: selected });
  };

  const handleSkip = async () => {
    await completeOnboarding(['meditation', 'mindfulness'], 10);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-8">
        <TouchableOpacity onPress={handleSkip} className="self-end">
          <Text className="text-text-secondary text-base">Skip</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-serif font-bold text-primary mt-4 mb-2">
          What interests you?
        </Text>
        <Text className="text-base text-text-secondary mb-6">
          Select topics you'd like to explore. You can always change these later.
        </Text>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap justify-between">
            {INTERESTS.map((interest) => {
              const isSelected = selected.includes(interest.id);
              return (
                <TouchableOpacity
                  key={interest.id}
                  onPress={() => toggleInterest(interest.id)}
                  className={`w-[48%] mb-3 p-4 rounded-card border-2 items-center ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface'
                  }`}
                >
                  <Text className="text-3xl mb-2">{interest.icon}</Text>
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-primary' : 'text-text-primary'
                    }`}
                  >
                    {interest.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {error ? (
          <Text className="text-red-500 text-center text-sm mb-2">{error}</Text>
        ) : null}

        <TouchableOpacity
          className={`w-full py-4 rounded-button items-center mt-4 ${
            selected.length > 0 ? 'bg-primary' : 'bg-gray-300'
          }`}
          onPress={handleNext}
        >
          <Text className="text-white font-bold text-lg">Next</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4 space-x-2">
          <View className="w-2 h-2 rounded-full bg-gray-300" />
          <View className="w-8 h-2 rounded-full bg-primary" />
          <View className="w-2 h-2 rounded-full bg-gray-300" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingInterests;
