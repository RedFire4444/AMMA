import React from 'react';
import { render } from '@testing-library/react-native';
import OTPScreen from '../screens/OTPScreen';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => ({ params: { phone: '+919876543210' } }),
}));

describe('OTPScreen', () => {
  it('renders verification heading', () => {
    const { getByText } = render(<OTPScreen />);
    expect(getByText('Verification')).toBeTruthy();
  });

  it('displays the phone number', () => {
    const { getByText } = render(<OTPScreen />);
    expect(getByText('+919876543210')).toBeTruthy();
  });

  it('shows Verify OTP button', () => {
    const { getByText } = render(<OTPScreen />);
    expect(getByText('Verify OTP')).toBeTruthy();
  });

  it('shows resend timer initially', () => {
    const { getByText } = render(<OTPScreen />);
    expect(getByText(/Resend in/)).toBeTruthy();
  });
});
