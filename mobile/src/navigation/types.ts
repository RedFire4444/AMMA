import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  OTP: { phone: string };
};

export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingInterests: undefined;
  OnboardingGoal: { interests: string[] };
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

export type DirectoryStackParamList = {
  DirectoryMain: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

export type MainTabParamList = {
  Journey: NavigatorScreenParams<JourneyStackParamList>;
  Courses: NavigatorScreenParams<CoursesStackParamList>;
  Home: NavigatorScreenParams<HomeStackParamList>;
  Directory: NavigatorScreenParams<DirectoryStackParamList>;
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
