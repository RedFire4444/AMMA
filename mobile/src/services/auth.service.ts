import { supabase } from './supabase';
import { post } from './api';

export const authService = {
  async requestOTP(phone: string): Promise<any> {
    return post<any>('/auth/request-otp', { phone });
  },

  async verifyOTP(phone: string, token: string): Promise<any> {
    // The backend verified OTP and returns { user, session }
    return post<any>('/auth/verify-otp', { phone, otp: token });
  },

  async emailLogin(email: string, password: string): Promise<any> {
    return post<any>('/auth/email-login', { email, password });
  },

  async emailSignup(email: string, password: string): Promise<any> {
    return post<any>('/auth/email-signup', { email, password });
  },

  async googleLogin(): Promise<any> {
    // Platform OAuth often requires exact client redirection flows mapped to Supabase
    // This connects directly to Supabase Native Auth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
    return data;
  },
};
