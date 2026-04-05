import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ActivityIndicator,
} from 'react-native';
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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-8 justify-between">
        <View>
          <Text className="text-2xl font-serif font-bold text-primary mb-2">
            Set your daily goal
          </Text>
          <Text className="text-base text-text-secondary mb-8">
            How many minutes would you like to meditate each day?
          </Text>

          <View className="flex-row flex-wrap justify-between mb-8">
            {DURATIONS.map((duration) => {
              const isSelected = selectedDuration === duration;
              return (
                <TouchableOpacity
                  key={duration}
                  onPress={() => setSelectedDuration(duration)}
                  className={`w-[30%] mb-3 py-4 rounded-pill items-center border-2 ${
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-border bg-surface'
                  }`}
                >
                  <Text
                    className={`text-lg font-bold ${
                      isSelected ? 'text-white' : 'text-text-primary'
                    }`}
                  >
                    {duration}
                  </Text>
                  <Text
                    className={`text-xs ${
                      isSelected ? 'text-white/80' : 'text-text-secondary'
                    }`}
                  >
                    min
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="flex-row items-center justify-between bg-surface p-4 rounded-card border border-border">
            <View className="flex-1 mr-4">
              <Text className="text-base font-semibold text-text-primary">
                Daily Reminders
              </Text>
              <Text className="text-sm text-text-secondary mt-1">
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
            className={`w-full py-4 rounded-button items-center ${
              isLoading ? 'bg-primary-light' : 'bg-primary'
            }`}
            onPress={handleStart}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Start My Journey
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4 space-x-2">
            <View className="w-2 h-2 rounded-full bg-gray-300" />
            <View className="w-2 h-2 rounded-full bg-gray-300" />
            <View className="w-8 h-2 rounded-full bg-primary" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingGoal;
