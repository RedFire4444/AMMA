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
jest.mock('../components/meditation/TimerCircle', () => ({
  TimerCircle: () => 'TimerCircle',
}));

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

  it('renders the Start button (play icon)', () => {
    const { getByText } = render(<MeditationTimerScreen />);
    // The start button shows the play symbol
    expect(getByText('\u25B6')).toBeTruthy();
  });

  it('renders the "Meditation" header', () => {
    const { getByText } = render(<MeditationTimerScreen />);
    expect(getByText('Meditation')).toBeTruthy();
  });
});
