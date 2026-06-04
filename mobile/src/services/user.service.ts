import { AxiosError } from 'axios';
import { get, patch } from './api';

export interface UserProfileStats {
  total_duration_minutes: number;
  total_sessions: number;
  longest_session_minutes: number;
  current_streak: number;
  longest_streak: number;
}

export interface UserProfile {
  id?: string;
  display_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  onboarding_complete?: boolean;
  interests?: string[];
  meditation_goal_minutes?: number;
  notification_enabled?: boolean;
  created_at?: string;
  level?: string;
  subscription_status?: string;
  // Backend returns computed stats nested under `stats` key
  stats?: UserProfileStats;
  // Legacy flat fields (kept for backward compat with any old callers)
  total_sessions?: number;
  total_duration_minutes?: number;
  longest_session_minutes?: number;
  current_streak?: number;
  longest_streak?: number;
}

const isAuthError = (err: unknown): boolean => {
  const status = (err as AxiosError | undefined)?.response?.status;
  return status === 401 || status === 403;
};

export const userService = {
  /**
   * Fetch the current user's profile.
   * Auth errors (401/403) are re-thrown so the auth layer can sign the user out.
   * Network/5xx errors return a minimal skeleton so the UI doesn't hang.
   */
  async getProfile(): Promise<UserProfile> {
    try {
      return await get<UserProfile>('/users/me');
    } catch (err) {
      if (isAuthError(err)) {
        throw err;
      }
      if (__DEV__) {
        console.warn('[User] Profile fetch failed, returning skeleton:', err);
      }
      return {
        onboarding_complete: false,
        display_name: 'Meditation User',
      };
    }
  },

  async updateProfile(updates: Record<string, unknown>): Promise<UserProfile | null> {
    try {
      return await patch<UserProfile>('/users/me', updates);
    } catch (err) {
      if (isAuthError(err)) {
        throw err;
      }
      if (__DEV__) {
        console.error('[User] Profile update failed:', err);
      }
      return null;
    }
  },

  async deleteAccount(): Promise<void> {
    await import('./api').then(({ del }) => del('/users/me'));
  },
};
