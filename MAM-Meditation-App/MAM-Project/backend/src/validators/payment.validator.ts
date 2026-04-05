import { z } from 'zod';

export const createOrderSchema = z.object({
  plan_type: z.enum(['monthly', 'annual']),
});

export const verifyPaymentSchema = z.object({
  gateway_order_id: z.string().min(1, 'Gateway order ID is required').max(100),
  gateway_payment_id: z.string().min(1, 'Gateway payment ID is required').max(100),
  gateway_signature: z.string().min(1, 'Gateway signature is required').max(256),
});

export const cancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional(),
}).strict();
