import React from 'react';
import { render } from '@testing-library/react-native';
import HomeMain from '../screens/HomeMain';

describe('HomeMain', () => {
  it('renders greeting', () => {
    const { getByText } = render(<HomeMain />);
    expect(getByText(/Good/)).toBeTruthy();
  });

  it('renders Total Time stat', () => {
    const { getByText } = render(<HomeMain />);
    expect(getByText('Total Time')).toBeTruthy();
  });

  it('renders Day Streak stat', () => {
    const { getByText } = render(<HomeMain />);
    expect(getByText('Day Streak')).toBeTruthy();
  });

  it('renders Trending Videos section', () => {
    const { getByText } = render(<HomeMain />);
    expect(getByText('Trending Videos')).toBeTruthy();
  });
});
