module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['MAA-Meditation-App/'],
  env: {
    jest: true,
  },
  rules: {
    'react-native/no-inline-styles': 'warn',
    'no-shadow': 'off',
  },
};
