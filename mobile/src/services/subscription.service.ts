import { supabase } from './supabase';

export interface SubscriptionStatus {
  planType: 'monthly' | 'annual' | 'free';
  status: 'active' | 'trialing' | 'cancelled' | 'expired' | 'none';
  expiresAt: string | null;
  isPremium: boolean;
}

export const subscriptionService = {
  async getStatus(): Promise<SubscriptionStatus> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan_type, status, expires_at')
      .eq('user_id', user.id)
      .single();

    // No subscription found
    if (error && error.code === 'PGRST116') {
      return {
        planType: 'free',
        status: 'none',
        expiresAt: null,
        isPremium: false,
      };
    }
    if (error) throw error;

    const isActiveStatus =
      data.status === 'active' || data.status === 'trialing';
    const isNotExpired = data.expires_at
      ? new Date(data.expires_at) > new Date()
      : false;
    const isPremium = isActiveStatus && isNotExpired;

    return {
      planType: data.plan_type as 'monthly' | 'annual',
      status: data.status as SubscriptionStatus['status'],
      expiresAt: data.expires_at,
      isPremium,
    };
  },

  async cancelSubscription(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
    if (error) throw error;
  },
};
