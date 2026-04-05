module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-keychain|react-native-reanimated|nativewind|react-native-css-interop)/'
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
    'react-native-worklets-core': '<rootDir>/__mocks__/styleMock.js',
  },
};
