import { get, post } from './api';

export interface SubscriptionStatus {
  planType: 'monthly' | 'annual' | 'free';
  status: 'active' | 'trialing' | 'cancelled' | 'expired' | 'none';
  expiresAt: string | null;
  isPremium: boolean;
}

export const subscriptionService = {
  async getStatus(): Promise<SubscriptionStatus> {
    try {
      const data = await get<SubscriptionStatus>('/subscriptions/status');
      return data;
    } catch {
      return {
        planType: 'free',
        status: 'none',
        expiresAt: null,
        isPremium: false,
      };
    }
  },

  async cancelSubscription(): Promise<void> {
    await post('/subscriptions/cancel');
  },
};
