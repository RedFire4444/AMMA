import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

// Lazy import to allow mock setup first
const PaywallScreen = require('../screens/PaywallScreen').default;

describe('PaywallScreen', () => {
  it('renders plan comparison heading', () => {
    const { getByText } = render(<PaywallScreen />);
    expect(getByText(/Premium/i)).toBeTruthy();
  });

  it('renders monthly plan card', () => {
    const { getByText } = render(<PaywallScreen />);
    expect(getByText(/199/)).toBeTruthy();
  });

  it('renders annual plan card', () => {
    const { getByText } = render(<PaywallScreen />);
    expect(getByText(/1,499/)).toBeTruthy();
  });

  it('renders Save 37% badge on annual plan', () => {
    const { getByText } = render(<PaywallScreen />);
    expect(getByText(/Save 37%/)).toBeTruthy();
  });

  it('renders Subscribe button', () => {
    const { getByText } = render(<PaywallScreen />);
    expect(getByText(/Subscribe/i)).toBeTruthy();
  });

  it('renders feature comparison items', () => {
    const { getByText } = render(<PaywallScreen />);
    expect(getByText(/Guided Meditations/i)).toBeTruthy();
    expect(getByText(/Courses/i)).toBeTruthy();
  });
});
