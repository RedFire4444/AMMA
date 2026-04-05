import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingInterests from '../screens/OnboardingInterests';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('OnboardingInterests', () => {
  it('renders heading', () => {
    const { getByText } = render(<OnboardingInterests />);
    expect(getByText('What interests you?')).toBeTruthy();
  });

  it('renders 8 interest options', () => {
    const { getByText } = render(<OnboardingInterests />);
    expect(getByText('Meditation')).toBeTruthy();
    expect(getByText('Yoga')).toBeTruthy();
    expect(getByText('Pranayama')).toBeTruthy();
    expect(getByText('Chanting')).toBeTruthy();
    expect(getByText('Sleep')).toBeTruthy();
    expect(getByText('Stress Relief')).toBeTruthy();
    expect(getByText('Focus')).toBeTruthy();
    expect(getByText('Spirituality')).toBeTruthy();
  });

  it('renders Next button', () => {
    const { getByText } = render(<OnboardingInterests />);
    expect(getByText('Next')).toBeTruthy();
  });

  it('renders Skip button', () => {
    const { getByText } = render(<OnboardingInterests />);
    expect(getByText('Skip')).toBeTruthy();
  });

  it('shows error when Next pressed with no selection', () => {
    const { getByText } = render(<OnboardingInterests />);
    fireEvent.press(getByText('Next'));
    expect(getByText('Please select at least one interest')).toBeTruthy();
  });

  it('navigates to OnboardingGoal after selecting interest and pressing Next', () => {
    const { getByText } = render(<OnboardingInterests />);
    fireEvent.press(getByText('Meditation'));
    fireEvent.press(getByText('Next'));
    expect(mockNavigate).toHaveBeenCalledWith('OnboardingGoal', {
      interests: ['meditation'],
    });
  });
});
