import React from 'react';
import { render } from '@testing-library/react-native';
import OnboardingGoal from '../screens/OnboardingGoal';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => ({ params: { interests: ['meditation', 'yoga'] } }),
}));

describe('OnboardingGoal', () => {
  const defaultProps = {
    route: { params: { interests: ['meditation', 'yoga'] } } as any,
    navigation: {} as any,
  };

  it('renders heading', () => {
    const { getByText } = render(<OnboardingGoal {...defaultProps} />);
    expect(getByText('Set your daily goal')).toBeTruthy();
  });

  it('renders duration options', () => {
    const { getByText } = render(<OnboardingGoal {...defaultProps} />);
    expect(getByText('3')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
    expect(getByText('20')).toBeTruthy();
    expect(getByText('30')).toBeTruthy();
  });

  it('renders Daily Reminders toggle', () => {
    const { getByText } = render(<OnboardingGoal {...defaultProps} />);
    expect(getByText('Daily Reminders')).toBeTruthy();
  });

  it('renders Start My Journey button', () => {
    const { getByText } = render(<OnboardingGoal {...defaultProps} />);
    expect(getByText('Start My Journey')).toBeTruthy();
  });
});
