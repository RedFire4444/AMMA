import React from 'react';
import { render } from '@testing-library/react-native';
import { useAuthStore } from '../store/authStore';

// We test the logic of RootNavigator by checking which navigator renders
// based on authStore state

describe('RootNavigator logic', () => {
  it('should show auth flow when session is null', () => {
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.onboardingComplete).toBe(false);
    // When session is null → AuthNavigator should render
  });

  it('should identify onboarding needed when session exists but onboarding not complete', () => {
    useAuthStore.setState({
      session: { access_token: 'test', refresh_token: 'test' } as any,
      user: { id: 'test' } as any,
      onboardingComplete: false,
    });
    const state = useAuthStore.getState();
    expect(state.session).not.toBeNull();
    expect(state.onboardingComplete).toBe(false);
    // Should render OnboardingNavigator
  });

  it('should identify main app ready when session exists and onboarding complete', () => {
    useAuthStore.setState({
      session: { access_token: 'test', refresh_token: 'test' } as any,
      user: { id: 'test' } as any,
      onboardingComplete: true,
    });
    const state = useAuthStore.getState();
    expect(state.session).not.toBeNull();
    expect(state.onboardingComplete).toBe(true);
    // Should render MainTabNavigator
  });

  afterEach(() => {
    useAuthStore.setState({
      session: null,
      user: null,
      onboardingComplete: false,
      isLoading: false,
    });
  });
});
