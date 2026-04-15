import { get, patch } from './api';

export const userService = {
  async getProfile() {
    return get<any>('/users/me');
  },

  async updateProfile(updates: Record<string, unknown>) {
    return patch<any>('/users/me', updates);
  },
};
