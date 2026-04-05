import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileMain from '../screens/ProfileMain';

describe('ProfileMain', () => {
  it('renders Edit Profile link', () => {
    const { getByText } = render(<ProfileMain />);
    expect(getByText('Edit Profile')).toBeTruthy();
  });

  it('renders 6 stat cards', () => {
    const { getByText } = render(<ProfileMain />);
    expect(getByText('Member Since')).toBeTruthy();
    expect(getByText('Longest Streak')).toBeTruthy();
    expect(getByText('Total Duration')).toBeTruthy();
    expect(getByText('Sessions')).toBeTruthy();
    expect(getByText('Longest Session')).toBeTruthy();
    expect(getByText('Monthly Progress')).toBeTruthy();
  });

  it('renders premium upsell card', () => {
    const { getByText } = render(<ProfileMain />);
    expect(getByText('Upgrade to Premium')).toBeTruthy();
  });

  it('renders settings list items', () => {
    const { getByText } = render(<ProfileMain />);
    expect(getByText('Notifications')).toBeTruthy();
    expect(getByText('Logout')).toBeTruthy();
    expect(getByText('Delete Account')).toBeTruthy();
  });

  it('shows logout confirmation alert when Logout pressed', () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText } = render(<ProfileMain />);
    fireEvent.press(getByText('Logout'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Logout',
      'Are you sure you want to logout?',
      expect.any(Array),
    );
    alertSpy.mockRestore();
  });
});
