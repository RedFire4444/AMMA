

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
    useRoute: () => ({
      params: { phone: '+919876543210' },
    }),
    NavigationContainer: ({children}) => children,
  };
});

// Mock bottom-tabs and native-stack
jest.mock('@react-navigation/bottom-tabs', () => {
  return {
    createBottomTabNavigator: jest.fn().mockReturnValue({
      Navigator: ({children}) => children,
      Screen: ({children}) => children,
    }),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  return {
    createNativeStackNavigator: jest.fn().mockReturnValue({
      Navigator: ({children}) => children,
      Screen: ({children}) => children,
    }),
  };
});

// Mock supabase
jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => ({
      auth: {
        signInWithOtp: jest.fn(),
        verifyOtp: jest.fn(),
      },
    })),
  };
});
