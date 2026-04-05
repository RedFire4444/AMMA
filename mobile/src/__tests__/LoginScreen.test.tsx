import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders phone input and Send OTP button', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    expect(getByPlaceholderText('9876543210')).toBeTruthy();
    expect(getByText('Send OTP')).toBeTruthy();
  });

  it('renders country code +91', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('+91')).toBeTruthy();
  });

  it('shows email toggle link', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Or use your email instead')).toBeTruthy();
  });

  it('shows Google Sign-In button', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Continue with Google')).toBeTruthy();
  });

  it('shows error when phone is empty and Send OTP pressed', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Send OTP'));
    expect(getByText('Please enter a valid phone number')).toBeTruthy();
  });

  it('toggles to email mode when link pressed', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    fireEvent.press(getByText('Or use your email instead'));
    expect(getByPlaceholderText('your@email.com')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('toggles back to phone mode', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    fireEvent.press(getByText('Or use your email instead'));
    fireEvent.press(getByText('Or use phone number instead'));
    expect(getByPlaceholderText('9876543210')).toBeTruthy();
  });
});
