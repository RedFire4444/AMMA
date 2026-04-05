import { z } from 'zod';

export const createOrderSchema = z.object({
  plan_type: z.enum(['monthly', 'annual']),
});

export const verifyPaymentSchema = z.object({
  gateway_order_id: z.string().min(1, 'Gateway order ID is required'),
  gateway_payment_id: z.string().min(1, 'Gateway payment ID is required'),
  gateway_signature: z.string().min(1, 'Gateway signature is required'),
});
