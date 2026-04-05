module.exports = function (api) {
  api.cache(true);

  const isTest = process.env.NODE_ENV === 'test';

  return {
    presets: [
      'module:@react-native/babel-preset',
      // Disable nativewind babel preset in test environment
      // to avoid className processing issues with Jest
      ...(isTest ? [] : ['nativewind/babel']),
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
