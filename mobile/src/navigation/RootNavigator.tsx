import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MainTabNavigator } from './MainTabNavigator';

// DEV MODE: Bypass auth to preview all screens
// Remove this and restore the auth check when Supabase is configured
export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <MainTabNavigator />
    </NavigationContainer>
  );
};
