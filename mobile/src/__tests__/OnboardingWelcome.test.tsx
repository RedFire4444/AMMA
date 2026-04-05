import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingWelcome from '../screens/OnboardingWelcome';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('OnboardingWelcome', () => {
  it('renders MAM branding text', () => {
    const { getByText } = render(<OnboardingWelcome />);
    expect(getByText('Mata Amritanandamayi Math')).toBeTruthy();
  });

  it('renders journey heading', () => {
    const { getByText } = render(<OnboardingWelcome />);
    expect(getByText(/Begin your/)).toBeTruthy();
  });

  it('renders Get Started button', () => {
    const { getByText } = render(<OnboardingWelcome />);
    expect(getByText('Get Started')).toBeTruthy();
  });

  it('renders Skip button', () => {
    const { getByText } = render(<OnboardingWelcome />);
    expect(getByText('Skip')).toBeTruthy();
  });

  it('navigates to OnboardingInterests on Get Started press', () => {
    const { getByText } = render(<OnboardingWelcome />);
    fireEvent.press(getByText('Get Started'));
    expect(mockNavigate).toHaveBeenCalledWith('OnboardingInterests');
  });
});
