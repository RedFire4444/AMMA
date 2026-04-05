import crypto from 'crypto';
import { supabase } from './supabase.service';

interface OrderResult {
  order_id: string;
  amount: number;
  currency: string;
  plan_type: string;
  payment_id: string;
}

interface SubscriptionResult {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  expires_at: string;
}

type PlanType = 'monthly' | 'annual';

const PLAN_AMOUNTS: Record<PlanType, number> = {
  monthly: 19900,
  annual: 149900,
};

const PLAN_DAYS: Record<PlanType, number> = {
  monthly: 30,
  annual: 365,
};

/**
 * Generate a mock order ID for development
 */
const generateOrderId = (): string => {
  return `order_${crypto.randomBytes(12).toString('hex')}`;
};

export const paymentService = {
  /**
   * Create a new payment order
   * In production, this would call the Razorpay SDK to create an order
   */
  async createOrder(planType: PlanType, userId: string): Promise<OrderResult> {
    const amount = PLAN_AMOUNTS[planType];
    const orderId = generateOrderId();

    // Create a pending payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        gateway: 'razorpay',
        gateway_order_id: orderId,
        amount,
        currency: 'INR',
        amount_display: `₹${(amount / 100).toFixed(2)}`,
        status: 'pending',
        plan_type: planType,
      })
      .select('id')
      .single();

    if (paymentError) {
      throw new Error(`Failed to create payment record: ${paymentError.message}`);
    }

    return {
      order_id: orderId,
      amount,
      currency: 'INR',
      plan_type: planType,
      payment_id: payment.id,
    };
  },

  /**
   * Verify Razorpay payment signature
   * In production: HMAC SHA256 verification with Razorpay secret
   * For development: validates presence of all required fields
   */
  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (razorpaySecret) {
      // Production: HMAC SHA256 verification
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(body)
        .digest('hex');

      return expectedSignature === signature;
    }

    // Development: validate all fields are present
    return orderId.length > 0 && paymentId.length > 0 && signature.length > 0;
  },

  /**
   * Process a verified payment: update payment record, create/update subscription
   */
  async processPayment(
    userId: string,
    orderId: string,
    paymentId: string,
    signature: string,
    planType: PlanType
  ): Promise<SubscriptionResult> {
    // Verify signature
    const isValid = this.verifySignature(orderId, paymentId, signature);
    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Update payment record to captured
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        gateway_payment_id: paymentId,
        gateway_signature: signature,
        status: 'captured',
        updated_at: new Date().toISOString(),
      })
      .eq('gateway_order_id', orderId)
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(`Failed to update payment record: ${updateError.message}`);
    }

    // Calculate subscription period
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + PLAN_DAYS[planType]);

    // Get the payment record ID for the subscription FK
    const { data: paymentRecord } = await supabase
      .from('payments')
      .select('id')
      .eq('gateway_order_id', orderId)
      .eq('user_id', userId)
      .single();

    // Upsert subscription (one active subscription per user)
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: userId,
          plan_type: planType === 'annual' ? 'yearly' : 'monthly',
          status: 'active',
          amount_cents: PLAN_AMOUNTS[planType],
          currency: 'INR',
          billing_cycle: planType === 'annual' ? 'yearly' : 'monthly',
          current_period_start: now.toISOString(),
          current_period_end: expiresAt.toISOString(),
          payment_method_id: paymentRecord?.id ?? null,
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          cancel_at_period_end: false,
          cancelled_at: null,
          cancellation_reason: null,
          updated_at: now.toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (subError) {
      throw new Error(`Failed to upsert subscription: ${subError.message}`);
    }

    return subscription as SubscriptionResult;
  },
};
