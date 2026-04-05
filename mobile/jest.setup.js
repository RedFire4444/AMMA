// Mock worklets core (used by react-native-reanimated)
jest.mock('react-native-worklets-core', () => ({}));

// Mock react-native-reanimated (MUST be before any other imports that use it)
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return {
    ...Reanimated,
    useSharedValue: jest.fn((init) => ({ value: init })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((val) => val),
    withSpring: jest.fn((val) => val),
    withDelay: jest.fn((_, val) => val),
    Easing: { linear: jest.fn(), ease: jest.fn(), bezier: jest.fn(() => jest.fn()) },
    FadeIn: { duration: jest.fn().mockReturnThis() },
    FadeOut: { duration: jest.fn().mockReturnThis() },
    SlideInRight: { duration: jest.fn().mockReturnThis() },
  };
});

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaView: ({ children }) => children,
    SafeAreaProvider: ({ children }) => children,
    useSafeAreaInsets: () => insets,
  };
});

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: { phone: '+919876543210' },
    }),
    NavigationContainer: ({ children }) => children,
  };
});

// Mock bottom-tabs and native-stack
jest.mock('@react-navigation/bottom-tabs', () => {
  return {
    createBottomTabNavigator: jest.fn().mockReturnValue({
      Navigator: ({ children }) => children,
      Screen: ({ children }) => children,
    }),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  return {
    createNativeStackNavigator: jest.fn().mockReturnValue({
      Navigator: ({ children }) => children,
      Screen: ({ children }) => children,
    }),
  };
});

// Mock react-native-config
jest.mock('react-native-config', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
}));

// Mock supabase
jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => ({
      auth: {
        signInWithOtp: jest.fn().mockResolvedValue({ data: {}, error: null }),
        verifyOtp: jest.fn().mockResolvedValue({
          data: {
            session: { access_token: 'test-token', refresh_token: 'test-refresh' },
            user: { id: 'test-user-id', email: null },
          },
          error: null,
        }),
        signInWithPassword: jest.fn().mockResolvedValue({
          data: {
            session: { access_token: 'test-token', refresh_token: 'test-refresh' },
            user: { id: 'test-user-id', email: 'test@example.com' },
          },
          error: null,
        }),
        signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null }),
        signInWithOAuth: jest.fn().mockResolvedValue({ data: {}, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
        setSession: jest.fn().mockResolvedValue({
          data: { session: null, user: null },
          error: { message: 'Invalid session' },
        }),
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { onboarding_complete: false }, error: null }),
        update: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      })),
      rpc: jest.fn().mockResolvedValue({ data: { current_streak: 5 }, error: null }),
    })),
  };
});

// Mock react-native-url-polyfill
jest.mock('react-native-url-polyfill/auto', () => {});
