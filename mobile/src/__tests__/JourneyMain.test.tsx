import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import JourneyMain from '../screens/JourneyMain';

// Mock all services used by JourneyMain
jest.mock('../services/habits.service', () => ({
  habitsService: {
    getAllHabits: jest.fn().mockResolvedValue({
      streaks: {},
      logs: [],
    }),
    getWeeklyPerformance: jest.fn().mockResolvedValue([]),
    getVisionBoard: jest.fn().mockResolvedValue([]),
    getDayJourney: jest.fn().mockResolvedValue([]),
    logHabit: jest.fn().mockResolvedValue({}),
    ratePerformance: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../services/home.service', () => ({
  homeService: {
    getHomeFeed: jest.fn().mockResolvedValue({
      dailyQuote: {
        quote_text: 'The mind is everything. What you think you become.',
        author: 'Buddha',
        category: 'mindfulness',
      },
      trendingCourses: [],
      upcomingEvents: [],
      stats: { totalMinutes: 0, currentStreak: 0 },
    }),
  },
}));

// Mock the HabitGrid component to simplify rendering
jest.mock('../components/journey/HabitGrid', () => ({
  HabitGrid: ({ habitName }: { habitName: string }) => {
    const RN = require('react-native');
    return require('react').createElement(RN.Text, null, habitName);
  },
}));

describe('JourneyMain', () => {
  it('renders "My Journey" heading after loading', async () => {
    const { getByText } = render(<JourneyMain />);
    await waitFor(() => {
      expect(getByText('My Journey')).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);

  it('renders "Start Meditation" button after loading', async () => {
    const { getByText } = render(<JourneyMain />);
    await waitFor(() => {
      expect(getByText('Start Meditation')).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);

  it('renders "Daily Affirmation" section after loading', async () => {
    const { getByText } = render(<JourneyMain />);
    await waitFor(() => {
      expect(getByText('Daily Affirmation')).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);

  it('renders subtitle text', async () => {
    const { getByText } = render(<JourneyMain />);
    await waitFor(() => {
      expect(getByText('Track your daily sadhana')).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);
});
