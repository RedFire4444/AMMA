import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { SecureStore } from '../utils/keychain';

interface User {
  id: string;
  email?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
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

export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  isAuthenticated: false,
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
      
      // Store tokens from backend response
      if (data.access_token) {
        await SecureStore.saveToken('auth_token', data.access_token);
      }
      if (data.refresh_token) {
        await SecureStore.saveToken('refresh_token', data.refresh_token);
      }
      
      if (data.user) {
        let onboardingComplete = false;
        try {
          const profile = await userService.getProfile();
          onboardingComplete = profile?.onboarding_complete ?? false;
        } catch (e) {
          if (__DEV__) console.warn('[Store] Profile fetch during verifyOTP failed:', e);
        }
        set({
          user: data.user,
          isAuthenticated: true,
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
      
      // Store tokens from backend response
      if (data.access_token) {
        await SecureStore.saveToken('auth_token', data.access_token);
      }
      if (data.refresh_token) {
        await SecureStore.saveToken('refresh_token', data.refresh_token);
      }
      
      if (data.user) {
        let onboardingComplete = false;
        try {
          const profile = await userService.getProfile();
          onboardingComplete = profile?.onboarding_complete ?? false;
        } catch (e) {
          if (__DEV__) console.warn('[Store] Profile fetch during login failed:', e);
        }
        set({
          user: data.user,
          isAuthenticated: true,
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
      const token = await SecureStore.getToken('auth_token');
      
      if (token) {
        try {
          const sessionData = await authService.getSession();
          
          if (sessionData.user) {
            let onboardingComplete = false;
            try {
              const profile = await userService.getProfile();
              onboardingComplete = profile?.onboarding_complete ?? false;
            } catch (e) {
              if (__DEV__) console.warn('[Store] Profile fetch during restore failed:', e);
            }
            set({
              user: sessionData.user,
              isAuthenticated: true,
              onboardingComplete,
            });
          } else {
            // Invalid session, clear tokens
            await SecureStore.deleteToken('auth_token');
            await SecureStore.deleteToken('refresh_token');
            set({ user: null, isAuthenticated: false, onboardingComplete: false });
          }
        } catch {
          // Session validation failed, clear tokens
          await SecureStore.deleteToken('auth_token');
          await SecureStore.deleteToken('refresh_token');
          set({ user: null, isAuthenticated: false, onboardingComplete: false });
        }
      } else {
        set({ user: null, isAuthenticated: false, onboardingComplete: false });
      }
    } catch (err) {
      if (__DEV__) console.warn('[Store] Session restoration exception:', err);
      set({ user: null, isAuthenticated: false, onboardingComplete: false });
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
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors, still clear local state
    }
    
    // Clear tokens and state
    await SecureStore.deleteToken('auth_token');
    await SecureStore.deleteToken('refresh_token');
    set({ user: null, isAuthenticated: false, onboardingComplete: false });
  },
}));
