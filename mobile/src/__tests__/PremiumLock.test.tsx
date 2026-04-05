import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { PremiumLock } from '../components/premium/PremiumLock';

describe('PremiumLock', () => {
  const mockOnUpgrade = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when isPremium is true', () => {
    const { getByText } = render(
      <PremiumLock isPremium={true} onUpgrade={mockOnUpgrade}>
        <Text>Premium Content</Text>
      </PremiumLock>,
    );
    expect(getByText('Premium Content')).toBeTruthy();
  });

  it('shows lock overlay when isPremium is false', () => {
    const { getByText } = render(
      <PremiumLock isPremium={false} onUpgrade={mockOnUpgrade}>
        <Text>Premium Content</Text>
      </PremiumLock>,
    );
    expect(getByText(/Upgrade/i)).toBeTruthy();
  });

  it('calls onUpgrade when upgrade button pressed', () => {
    const { getByText } = render(
      <PremiumLock isPremium={false} onUpgrade={mockOnUpgrade}>
        <Text>Premium Content</Text>
      </PremiumLock>,
    );
    fireEvent.press(getByText(/Upgrade/i));
    expect(mockOnUpgrade).toHaveBeenCalled();
  });
});
