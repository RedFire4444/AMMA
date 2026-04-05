import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';
import OnboardingWelcome from '../screens/OnboardingWelcome';
import OnboardingInterests from '../screens/OnboardingInterests';
import OnboardingGoal from '../screens/OnboardingGoal';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcome} />
      <Stack.Screen name="OnboardingInterests" component={OnboardingInterests} />
      <Stack.Screen name="OnboardingGoal" component={OnboardingGoal} />
    </Stack.Navigator>
  );
};
