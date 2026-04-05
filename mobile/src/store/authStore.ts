import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  onboardingComplete: false,

  requestOTP: async (phone: string) => {
    set({ isLoading: true });
    try {
      await authService.requestOTP(phone);
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOTP: async (phone: string, token: string) => {
    set({ isLoading: true });
    try {
      const data = await authService.verifyOTP(phone, token);
      if (data.session) {
        await SecureStore.saveToken('supabase_session', JSON.stringify(data.session));
        // Check onboarding status from user metadata or profile
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_complete')
          .eq('id', data.user?.id)
          .single();
        set({
          session: data.session,
          user: data.user ?? null,
          onboardingComplete: profile?.onboarding_complete ?? false,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  emailLogin: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const data = await authService.emailLogin(email, password);
      if (data.session) {
        await SecureStore.saveToken('supabase_session', JSON.stringify(data.session));
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_complete')
          .eq('id', data.user?.id)
          .single();
        set({
          session: data.session,
          user: data.user ?? null,
          onboardingComplete: profile?.onboarding_complete ?? false,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  emailSignup: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      await authService.emailSignup(email, password);
    } finally {
      set({ isLoading: false });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const stored = await SecureStore.getToken('supabase_session');
      if (stored) {
        const parsed: Session = JSON.parse(stored);
        // Verify the session is still valid
        const { data, error } = await supabase.auth.setSession({
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        });
        if (data.session && !error) {
          // Save refreshed session
          await SecureStore.saveToken('supabase_session', JSON.stringify(data.session));
          const { data: profile } = await supabase
            .from('users')
            .select('onboarding_complete')
            .eq('id', data.user?.id)
            .single();
          set({
            session: data.session,
            user: data.user ?? null,
            onboardingComplete: profile?.onboarding_complete ?? false,
          });
        } else {
          // Session expired, clear stored data
          await SecureStore.deleteToken('supabase_session');
          set({ session: null, user: null, onboardingComplete: false });
        }
      }
    } catch {
      await SecureStore.deleteToken('supabase_session');
      set({ session: null, user: null, onboardingComplete: false });
    } finally {
      set({ isLoading: false });
    }
  },

  completeOnboarding: async (interests: string[], goalMinutes: number) => {
    const userId = get().user?.id;
    if (!userId) return;
    set({ isLoading: true });
    try {
      await supabase
        .from('users')
        .update({
          interests,
          meditation_goal_minutes: goalMinutes,
          onboarding_complete: true,
          notification_enabled: true,
        })
        .eq('id', userId);
      set({ onboardingComplete: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    await SecureStore.deleteToken('supabase_session');
    set({ user: null, session: null, onboardingComplete: false });
  },
}));
