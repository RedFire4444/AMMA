import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  OTP: { phoneNumber: string };
  OnboardingWelcome: undefined;
  OnboardingInterests: undefined;
  OnboardingGoal: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
};

export type CoursesStackParamList = {
  CoursesMain: undefined;
};

export type JourneyStackParamList = {
  JourneyMain: undefined;
};

export type EventsStackParamList = {
  EventsMain: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Courses: NavigatorScreenParams<CoursesStackParamList>;
  Journey: NavigatorScreenParams<JourneyStackParamList>;
  Events: NavigatorScreenParams<EventsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
