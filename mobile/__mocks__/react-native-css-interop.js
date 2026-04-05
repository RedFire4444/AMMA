const React = require('react');

module.exports = {
  cssInterop: (component) => component,
  remapProps: () => {},
  unstable_styled: (component) => component,
  createElement: React.createElement,
  createElementAndCheckCssInterop: React.createElement,
  useColorScheme: () => ({ colorScheme: 'light', setColorScheme: () => {}, toggleColorScheme: () => {} }),
};
