import React from 'react';
import { render } from '@testing-library/react-native';
import OTPScreen from '../screens/OTPScreen';

describe('OTPScreen Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<OTPScreen route={{params: {phone: '+919876543210'}}} />);
    
    expect(getByText('Verification')).toBeTruthy();
  });
});
