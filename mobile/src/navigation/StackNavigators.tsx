import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeMain from '../screens/HomeMain';
import CoursesMain from '../screens/CoursesMain';
import JourneyMain from '../screens/JourneyMain';
import DirectoryMain from '../screens/DirectoryMain';
import ProfileMain from '../screens/ProfileMain';

const Home = createNativeStackNavigator();
export const HomeStack = () => (
  <Home.Navigator screenOptions={{ headerShown: false }}>
    <Home.Screen name="HomeMain" component={HomeMain} />
  </Home.Navigator>
);

const Courses = createNativeStackNavigator();
export const CoursesStack = () => (
  <Courses.Navigator screenOptions={{ headerShown: false }}>
    <Courses.Screen name="CoursesMain" component={CoursesMain} />
  </Courses.Navigator>
);

const Journey = createNativeStackNavigator();
export const JourneyStack = () => (
  <Journey.Navigator screenOptions={{ headerShown: false }}>
    <Journey.Screen name="JourneyMain" component={JourneyMain} />
  </Journey.Navigator>
);

const Directory = createNativeStackNavigator();
export const DirectoryStack = () => (
  <Directory.Navigator screenOptions={{ headerShown: false }}>
    <Directory.Screen name="DirectoryMain" component={DirectoryMain} />
  </Directory.Navigator>
);

const Profile = createNativeStackNavigator();
export const ProfileStack = () => (
  <Profile.Navigator screenOptions={{ headerShown: false }}>
    <Profile.Screen name="ProfileMain" component={ProfileMain} />
  </Profile.Navigator>
);
