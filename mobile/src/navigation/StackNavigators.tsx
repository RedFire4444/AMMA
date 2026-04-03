import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeMain from '../screens/HomeMain';
import CoursesMain from '../screens/CoursesMain';
import JourneyMain from '../screens/JourneyMain';
import EventsMain from '../screens/EventsMain';
import ProfileMain from '../screens/ProfileMain';

const Home = createNativeStackNavigator();
export const HomeStack = () => (
  <Home.Navigator><Home.Screen name="HomeMain" component={HomeMain} /></Home.Navigator>
);

const Courses = createNativeStackNavigator();
export const CoursesStack = () => (
  <Courses.Navigator><Courses.Screen name="CoursesMain" component={CoursesMain} /></Courses.Navigator>
);

const Journey = createNativeStackNavigator();
export const JourneyStack = () => (
  <Journey.Navigator><Journey.Screen name="JourneyMain" component={JourneyMain} /></Journey.Navigator>
);

const Events = createNativeStackNavigator();
export const EventsStack = () => (
  <Events.Navigator><Events.Screen name="EventsMain" component={EventsMain} /></Events.Navigator>
);

const Profile = createNativeStackNavigator();
export const ProfileStack = () => (
  <Profile.Navigator><Profile.Screen name="ProfileMain" component={ProfileMain} /></Profile.Navigator>
);
