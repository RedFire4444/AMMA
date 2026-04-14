import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { SecureStore } from '../utils/keychain';
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
      console.log(`[Store] Requesting OTP for ${phone}...`);
      await authService.requestOTP(phone);
    } catch (err) {
      console.error('[Store] OTP request failed:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOTP: async (phone: string, token: string) => {
    set({ isLoading: true });
    try {
      console.log(`[Store] Verifying OTP for ${phone}...`);
      const data = await authService.verifyOTP(phone, token);
      if (data?.session) {
        let onboardingComplete = false;
        try {
          const profile = await userService.getProfile();
          onboardingComplete = profile?.onboarding_complete ?? false;
        } catch (e) { 
          console.warn('[Store] Profile fetch during verifyOTP failed (likely new user):', e);
        }
        set({
          session: data.session,
          user: data.user ?? null,
          onboardingComplete,
        });
      }
    } catch (err) {
      console.error('[Store] OTP verification failed:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  emailLogin: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      console.log(`[Store] Logging in with email ${email}...`);
      const data = await authService.emailLogin(email, password);
      if (data?.session) {
        let onboardingComplete = false;
        try {
          const profile = await userService.getProfile();
          onboardingComplete = profile?.onboarding_complete ?? false;
        } catch (e) {
          console.warn('[Store] Profile fetch during login failed:', e);
        }
        set({
          session: data.session,
          user: data.user ?? null,
          onboardingComplete,
        });
      }
    } catch (err) {
      console.error('[Store] Email login failed:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  emailSignup: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      console.log(`[Store] Signing up with email ${email}...`);
      await authService.emailSignup(email, password);
    } catch (err) {
      console.error('[Store] Email signup failed:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      console.log('[Store] Restoring session from Supabase...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session && !error) {
        console.log('[Store] Session found, loading profile...');
        let onboardingComplete = false;
        try {
          const profile = await userService.getProfile();
          onboardingComplete = profile?.onboarding_complete ?? false;
        } catch (e) { 
          console.warn('[Store] Profile fetch during restore failed (backend may be down):', e);
        }
        set({
          session,
          user: session.user ?? null,
          onboardingComplete,
        });
      } else {
        if (error) console.error('[Store] Supabase session error:', error);
        set({ session: null, user: null, onboardingComplete: false });
      }
    } catch (err) {
      console.error('[Store] Session restoration exception:', err);
      set({ session: null, user: null, onboardingComplete: false });
    } finally {
      set({ isLoading: false });
    }
  },

  completeOnboarding: async (interests: string[], goalMinutes: number) => {
    set({ isLoading: true });
    try {
      // Update profile via the backend API — no direct DB call
      await userService.updateProfile({
        interests,
        meditation_goal_minutes: goalMinutes,
        onboarding_complete: true,
        notification_enabled: true,
      });
      set({ onboardingComplete: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, onboardingComplete: false });
  },
}));
