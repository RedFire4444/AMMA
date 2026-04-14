import { get, post } from './api';

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
    return post<PaymentOrder>('/payments/create-order', { plan_type: planType });
  },

  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
  ): Promise<void> {
    await post('/payments/verify', {
      order_id: orderId,
      gateway_payment_id: paymentId,
      gateway_signature: signature,
    });
  },

  async getPaymentHistory(): Promise<PaymentRecord[]> {
    const data = await get<any>('/payments/history');
    return data || [];
  },
};
