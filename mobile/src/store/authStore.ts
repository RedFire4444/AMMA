import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { SecureStore } from '../utils/keychain';

interface AuthState {
  user: any | null;
  session: any | null;
  isLoading: boolean;
  requestOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,

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
        set({ session: data.session, user: data.user });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteToken('supabase_session');
    set({ user: null, session: null });
  }
}));
