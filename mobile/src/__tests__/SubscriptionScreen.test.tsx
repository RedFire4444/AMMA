import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

const SubscriptionScreen = require('../screens/SubscriptionScreen').default;

describe('SubscriptionScreen', () => {
  it('renders subscription heading', () => {
    const { getByText } = render(<SubscriptionScreen />);
    expect(getByText(/Subscription/i)).toBeTruthy();
  });

  it('renders current plan section', () => {
    const { getByText } = render(<SubscriptionScreen />);
    expect(getByText(/Current Plan/i)).toBeTruthy();
  });

  it('renders billing history section', () => {
    const { getByText } = render(<SubscriptionScreen />);
    expect(getByText(/Billing History/i)).toBeTruthy();
  });
});
