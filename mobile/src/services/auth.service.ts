import { supabase } from './supabase';

export const authService = {
  async requestOTP(phone: string): Promise<any> {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) throw error;
    return data;
  },

  async verifyOTP(phone: string, token: string): Promise<any> {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (error) throw error;
    return data;
  },

  async emailLogin(email: string, password: string): Promise<any> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async emailSignup(email: string, password: string): Promise<any> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async googleLogin(): Promise<any> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
    return data;
  },

  async updateCredentials(email?: string, password?: string): Promise<any> {
    const updates: any = {};
    if (email) updates.email = email;
    if (password) updates.password = password;
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data;
  },
};
