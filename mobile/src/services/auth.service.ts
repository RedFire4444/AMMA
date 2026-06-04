import { post } from './api';

export const authService = {
  async requestOTP(phone: string): Promise<any> {
    return await post('/auth/request-otp', { phone });
  },

  async verifyOTP(phone: string, token: string): Promise<any> {
    return await post('/auth/verify-otp', { phone, token });
  },

  async emailLogin(email: string, password: string): Promise<any> {
    return await post('/auth/email-login', { email, password });
  },

  async emailSignup(email: string, password: string): Promise<any> {
    return await post('/auth/email-signup', { email, password });
  },

  async googleLogin(): Promise<any> {
    // This would need to be implemented in your backend
    throw new Error('Google login should be implemented through backend OAuth flow');
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
