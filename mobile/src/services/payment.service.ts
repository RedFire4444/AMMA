import { supabase } from './supabase';

export interface PaymentOrder {
  id: string;
  gateway_order_id: string;
  amount: number;
  currency: string;
  plan_type: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  plan_type: string;
  created_at: string;
}

export const paymentService = {
  async createOrder(planType: 'monthly' | 'annual'): Promise<PaymentOrder> {
    const amount = planType === 'monthly' ? 19900 : 149900;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        gateway: 'razorpay',
        amount,
        currency: 'INR',
        status: 'pending',
        plan_type: planType,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      gateway_order_id: data.id,
      amount,
      currency: 'INR',
      plan_type: planType,
    };
  },

  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch the order to get the plan type
    const { data: order, error: orderError } = await supabase
      .from('payments')
      .select('plan_type')
      .eq('id', orderId)
      .single();
    if (orderError) throw orderError;

    const planType = (order.plan_type as 'monthly' | 'annual') || 'monthly';

    // Update payment to captured
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'captured',
        gateway_payment_id: paymentId,
        gateway_signature: signature,
      })
      .eq('id', orderId);
    if (updateError) throw updateError;

    // Create or update subscription
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (planType === 'annual' ? 365 : 30));

    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: user.id,
          plan_type: planType,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        },
        { onConflict: 'user_id' },
      );
    if (subError) throw subError;
  },

  async getPaymentHistory(): Promise<PaymentRecord[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('payments')
      .select('id, amount, currency, status, plan_type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as PaymentRecord[]) || [];
  },
};
