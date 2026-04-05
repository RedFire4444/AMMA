import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';

export const RootNavigator = () => {
  const session = useAuthStore((state) => state.session);
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const renderNavigator = () => {
    if (!session) {
      return <AuthNavigator />;
    }
    if (!onboardingComplete) {
      return <OnboardingNavigator />;
    }
    return <MainTabNavigator />;
  };

  return <NavigationContainer>{renderNavigator()}</NavigationContainer>;
};
