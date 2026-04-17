import { get, patch } from './api';

export const userService = {
  async getProfile() {
    try {
      return await get<any>('/users/me');
    } catch (err) {
      console.warn('[User] Failed to fetch profile from backend:', err);
      // Return a skeleton profile to prevent the app from hanging
      return {
        onboarding_complete: false,
        display_name: 'Meditation User'
      };
    }
  },

  async updateProfile(updates: Record<string, unknown>) {
    try {
      return await patch<any>('/users/me', updates);
    } catch (err) {
      console.error('[User] Failed to update profile on backend:', err);
      return null;
    }
  },
};
