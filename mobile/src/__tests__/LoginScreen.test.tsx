import React from 'react';
import { render } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';

describe('LoginScreen Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<LoginScreen />);
    
    expect(getByText('Welcome Back')).toBeTruthy();
  });
});
