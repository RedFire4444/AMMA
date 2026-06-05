import React from 'react';
import { render } from '@testing-library/react-native';
import MeditationTimerScreen from '../screens/MeditationTimerScreen';

// Mock services used by the screen
jest.mock('../services/meditation.service', () => ({
  meditationService: {
    logSession: jest.fn().mockResolvedValue({}),
    autoLogHabit: jest.fn().mockResolvedValue({}),
  },
}));

// Mock the TimerCircle component to avoid complex rendering
jest.mock('../components/meditation/TimerCircle', () => {
  const { Text } = require('react-native');
  return {
    TimerCircle: () => <Text>TimerCircle</Text>,
  };
});

describe('MeditationTimerScreen', () => {
  it('renders duration preset buttons', () => {
    const { getByText } = render(<MeditationTimerScreen />);
    expect(getByText('3')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
    expect(getByText('20')).toBeTruthy();
    expect(getByText('30')).toBeTruthy();
  });

  it('renders ambient sound options', () => {
    const { getByText } = render(<MeditationTimerScreen />);
    expect(getByText('Nature')).toBeTruthy();
    expect(getByText('Rain')).toBeTruthy();
    expect(getByText('Ocean')).toBeTruthy();
    expect(getByText('Birds')).toBeTruthy();
    expect(getByText('Bowl')).toBeTruthy();
  });

  it('renders session type options', () => {
    const { getByText } = render(<MeditationTimerScreen />);
    expect(getByText('Free')).toBeTruthy();
    expect(getByText('Guided')).toBeTruthy();
    expect(getByText('Breathing')).toBeTruthy();
  });

  it('renders the TimerCircle component', () => {
    const { getByText } = render(<MeditationTimerScreen />);
    expect(getByText('TimerCircle')).toBeTruthy();
  });

  it('renders the "Meditation" header', () => {
    const { getByText } = render(<MeditationTimerScreen />);
    expect(getByText('Meditation')).toBeTruthy();
  });
});
