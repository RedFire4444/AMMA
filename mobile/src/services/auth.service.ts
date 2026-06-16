import { post } from './api';

export const authService = {
  async requestOTP(phone: string, purpose: 'login' | 'signup' = 'login'): Promise<any> {
    return await post('/auth/request-otp', { phone, purpose });
  },

  async verifyOTP(phone: string, otp: string): Promise<any> {
    // Backend validator expects field name 'otp' (not 'token')
    return await post('/auth/verify-otp', { phone, otp });
  },

  async emailLogin(email: string, password: string): Promise<any> {
    return await post('/auth/email-login', { email, password });
  },

  async emailSignup(email: string, password: string): Promise<any> {
    return await post('/auth/email-signup', { email, password });
  },

  async googleLogin(): Promise<void> {
    // Google OAuth is handled via the GoogleAuthWebView screen.
    // The WebView opens the Supabase authorize URL, captures tokens via postMessage,
    // and calls authStore.handleGoogleSession() directly.
    // This method is a placeholder for future native SDK integration.
  },

  async registerGoogleProfile(): Promise<any> {
    return await post('/auth/google-profile', {});
  },

  async updateCredentials(email?: string, password?: string): Promise<any> {
    const updates: any = {};
    if (email) updates.email = email;
    if (password) updates.password = password;
    return await post('/auth/update-credentials', updates);
  },

  async logout(): Promise<void> {
    await post('/auth/logout', {});
  },

  async refreshToken(): Promise<any> {
    return await post('/auth/refresh', {});
  },

  async getSession(): Promise<any> {
    return await post('/auth/session', {});
  },
};
