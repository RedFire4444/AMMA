import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { supabase } from '../services/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  onboardingComplete: boolean;
  requestOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, token: string) => Promise<void>;
  emailLogin: (email: string, password: string) => Promise<void>;
  emailSignup: (email: string, password: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  completeOnboarding: (interests: string[], goalMinutes: number) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  onboardingComplete: false,

  requestOTP: async (phone: string) => {
    set({ isLoading: true });
    try {
      await authService.requestOTP(phone);
    } catch (err) {
      if (__DEV__) console.warn('[Store] OTP request failed:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOTP: async (phone: string, token: string) => {
    set({ isLoading: true });
    try {
      const data = await authService.verifyOTP(phone, token);
      if (data?.session) {
        let onboardingComplete = false;
        try {
          const profile = await userService.getProfile();
          onboardingComplete = profile?.onboarding_complete ?? false;
        } catch (e) {
          if (__DEV__) console.warn('[Store] Profile fetch during verifyOTP failed:', e);
        }
        set({
          session: data.session,
          user: data.user ?? null,
          onboardingComplete,
        });
      }
    } catch (err) {
      if (__DEV__) console.warn('[Store] OTP verification failed:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  emailLogin: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const data = await authService.emailLogin(email, password);
      if (data?.session) {
        let onboardingComplete = false;
        try {
          const profile = await userService.getProfile();
          onboardingComplete = profile?.onboarding_complete ?? false;
        } catch (e) {
          if (__DEV__) console.warn('[Store] Profile fetch during login failed:', e);
        }
        set({
          session: data.session,
          user: data.user ?? null,
          onboardingComplete,
        });
      }
    } catch (err) {
      if (__DEV__) console.warn('[Store] Email login failed:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  emailSignup: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      await authService.emailSignup(email, password);
    } catch (err) {
      if (__DEV__) console.warn('[Store] Email signup failed:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session && !error) {
        let onboardingComplete = false;
        try {
          const profile = await userService.getProfile();
          onboardingComplete = profile?.onboarding_complete ?? false;
        } catch (e) {
          if (__DEV__) console.warn('[Store] Profile fetch during restore failed:', e);
        }
        set({
          session,
          user: session.user ?? null,
          onboardingComplete,
        });
      } else {
        if (__DEV__ && error) console.warn('[Store] Supabase session error:', error);
        set({ session: null, user: null, onboardingComplete: false });
      }
    } catch (err) {
      if (__DEV__) console.warn('[Store] Session restoration exception:', err);
      set({ session: null, user: null, onboardingComplete: false });
    } finally {
      set({ isLoading: false });
    }
  },

  completeOnboarding: async (interests: string[], goalMinutes: number) => {
    set({ isLoading: true });
    try {
      const result = await userService.updateProfile({
        interests,
        meditation_goal_minutes: goalMinutes,
        onboarding_complete: true,
        notification_enabled: true,
      });
      // Mark onboarding complete locally even if the API returned null
      // (network/5xx) so the user isn't trapped on the onboarding flow.
      // The profile will reconcile on next session restore.
      set({ onboardingComplete: result?.onboarding_complete ?? true });
    } catch (err) {
      if (__DEV__) console.warn('[Store] completeOnboarding failed:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, onboardingComplete: false });
  },
}));
