import React from 'react';
import { render } from '@testing-library/react-native';
import OTPScreen from '../screens/OTPScreen';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => ({ params: { phone: '+919876543210' } }),
}));

const mockRoute = {
  key: 'OTP',
  name: 'OTP' as const,
  params: { phone: '+919876543210' },
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as any;

describe('OTPScreen', () => {
  it('renders verification heading', () => {
    const { getByText } = render(
      <OTPScreen route={mockRoute as any} navigation={mockNavigation} />
    );
    expect(getByText('Verification')).toBeTruthy();
  });

  it('displays the phone number', () => {
    const { getByText } = render(
      <OTPScreen route={mockRoute as any} navigation={mockNavigation} />
    );
    expect(getByText('+919876543210')).toBeTruthy();
  });

  it('shows Verify OTP button', () => {
    const { getByText } = render(
      <OTPScreen route={mockRoute as any} navigation={mockNavigation} />
    );
    expect(getByText('Verify OTP')).toBeTruthy();
  });

  it('shows resend timer initially', () => {
    const { getByText } = render(
      <OTPScreen route={mockRoute as any} navigation={mockNavigation} />
    );
    expect(getByText(/Resend in/)).toBeTruthy();
  });
});
