import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { useAuthStore } from '../store/authStore';
import { colors } from '../utils/styles';

export const RootNavigator = () => {
  const { user, session, onboardingComplete, restoreSession } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      console.log('[RootNavigator] Initializing...');
      await restoreSession();
      setIsInitializing(false);
    };
    init();
  }, [restoreSession]);

  useEffect(() => {
    if (!isInitializing) {
      console.log('[RootNavigator] Current State:', {
        hasSession: !!session,
        onboardingComplete,
        userId: session?.user?.id
      });
    }
  }, [isInitializing, session, onboardingComplete]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!session ? (
        <AuthNavigator />
      ) : !onboardingComplete ? (
        <OnboardingNavigator />
      ) : (
        <MainTabNavigator />
      )}
    </NavigationContainer>
  );
};
