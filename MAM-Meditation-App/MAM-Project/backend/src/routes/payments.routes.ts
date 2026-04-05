import { Router } from 'express';
import { createOrder, verifyPayment, getPaymentHistory } from '../controllers/payments.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { createOrderSchema, verifyPaymentSchema } from '../validators/payment.validator';

const router = Router();

// POST /api/payments/create-order — create a payment order for a plan
router.post('/create-order', authenticateToken, validate(createOrderSchema), createOrder);

// POST /api/payments/verify — verify payment and activate subscription
router.post('/verify', authenticateToken, validate(verifyPaymentSchema), verifyPayment);

// GET /api/payments/history — fetch user's payment history
router.get('/history', authenticateToken, getPaymentHistory);

export default router;
