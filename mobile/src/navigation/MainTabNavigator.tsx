import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { HomeStack, CoursesStack, JourneyStack, EventsStack, ProfileStack } from './StackNavigators';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Courses" component={CoursesStack} />
      <Tab.Screen name="Journey" component={JourneyStack} />
      <Tab.Screen name="Events" component={EventsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};
