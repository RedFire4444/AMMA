import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

jest.mock('../hooks/useSubscription', () => ({
  useSubscription: () => ({
    isPremium: false,
    planType: 'free',
    expiresAt: null,
    isLoading: false,
    refresh: jest.fn(),
  }),
}));

jest.mock('../services/subscription.service', () => ({
  subscriptionService: {
    getSubscriptionStatus: jest.fn().mockResolvedValue({ planType: 'free', status: 'none', expiresAt: null, isPremium: false }),
    cancelSubscription: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../services/payment.service', () => ({
  paymentService: {
    getPaymentHistory: jest.fn().mockResolvedValue([]),
  },
}));

const SubscriptionScreen = require('../screens/SubscriptionScreen').default;

describe('SubscriptionScreen', () => {
  it('renders subscription heading', () => {
    const { getByText } = render(<SubscriptionScreen />);
    expect(getByText('Subscription')).toBeTruthy();
  });

  it('renders current plan section', () => {
    const { getByText } = render(<SubscriptionScreen />);
    expect(getByText('Current Plan')).toBeTruthy();
  });

  it('renders upgrade button for free users', () => {
    const { getByText } = render(<SubscriptionScreen />);
    expect(getByText('Upgrade to Premium')).toBeTruthy();
  });
});
