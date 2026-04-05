import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { CustomTabBar } from '../components/CustomTabBar';
import {
  HomeStack,
  CoursesStack,
  JourneyStack,
  DirectoryStack,
  ProfileStack,
} from './StackNavigators';

const Tab = createBottomTabNavigator<MainTabParamList>();

const renderTabBar = (props: BottomTabBarProps) => <CustomTabBar {...props} />;

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Journey"
        component={JourneyStack}
        options={{ tabBarLabel: 'My Journey' }}
      />
      <Tab.Screen name="Courses" component={CoursesStack} />
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Directory" component={DirectoryStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};
