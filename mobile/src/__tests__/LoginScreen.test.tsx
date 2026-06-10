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
    expect(getByText('Use email instead')).toBeTruthy();
  });

  it('shows Google Sign-In button', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Continue with Google')).toBeTruthy();
  });

  it('shows error when phone is empty and Send OTP pressed', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Send OTP'));
    expect(getByText('Enter your phone number')).toBeTruthy();
  });

  it('toggles to email mode when link pressed', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    fireEvent.press(getByText('Use email instead'));
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('toggles back to phone mode', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    fireEvent.press(getByText('Use email instead'));
    fireEvent.press(getByText('Use phone instead'));
    expect(getByPlaceholderText('9876543210')).toBeTruthy();
  });

  it('toggles password visibility when the eye icon is pressed', () => {
    const { getByText, getByLabelText } = render(<LoginScreen />);
    fireEvent.press(getByText('Use email instead'));
    
    const passwordInput = getByLabelText('Password');
    expect(passwordInput.props.secureTextEntry).toBe(true);

    const eyeButton = getByLabelText('Show password');
    fireEvent.press(eyeButton);

    expect(passwordInput.props.secureTextEntry).toBe(false);
    expect(getByLabelText('Hide password')).toBeTruthy();

    fireEvent.press(getByLabelText('Hide password'));
    expect(passwordInput.props.secureTextEntry).toBe(true);
    expect(getByLabelText('Show password')).toBeTruthy();
  });
});
