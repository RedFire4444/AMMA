import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HabitGrid } from '../components/journey/HabitGrid';

// Mock the StreakBadge component so we can verify streak count rendering
jest.mock('../components/journey/StreakBadge', () => ({
  StreakBadge: ({ count, label }: { count: number; label: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, `${count} ${label}`);
  },
}));

describe('HabitGrid', () => {
  const defaultProps = {
    habitType: 'meditation',
    habitIcon: '\u{1F9D8}',
    habitName: 'Meditation',
    logs: [],
    streakCount: 7,
    onLogToday: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders habit label', () => {
    const { getByText } = render(<HabitGrid {...defaultProps} />);
    expect(getByText('Meditation')).toBeTruthy();
  });

  it('renders streak count', () => {
    const { getByText } = render(<HabitGrid {...defaultProps} />);
    expect(getByText('7 Days')).toBeTruthy();
  });

  it('renders "Log Today" button', () => {
    const { getByText } = render(<HabitGrid {...defaultProps} />);
    expect(getByText('+ Log Today')).toBeTruthy();
  });

  it('calls onLogToday when "Log Today" is pressed', () => {
    const onLogToday = jest.fn();
    const { getByText } = render(
      <HabitGrid {...defaultProps} onLogToday={onLogToday} />,
    );
    fireEvent.press(getByText('+ Log Today'));
    expect(onLogToday).toHaveBeenCalledTimes(1);
  });

  it('renders habit icon', () => {
    const { getByText } = render(<HabitGrid {...defaultProps} />);
    expect(getByText('\u{1F9D8}')).toBeTruthy();
  });

  it('renders with zero streak count', () => {
    const { getByText } = render(
      <HabitGrid {...defaultProps} streakCount={0} />,
    );
    expect(getByText('0 Days')).toBeTruthy();
  });
});
