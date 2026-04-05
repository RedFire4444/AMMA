import { Router } from 'express';
import { getSubscriptionStatus, cancelSubscription } from '../controllers/subscriptions.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { cancelSubscriptionSchema } from '../validators/payment.validator';

const router = Router();

// GET /api/subscriptions/status — get current subscription details
router.get('/status', authenticateToken, getSubscriptionStatus);

// POST /api/subscriptions/cancel — cancel active subscription
router.post('/cancel', authenticateToken, validate(cancelSubscriptionSchema), cancelSubscription);

export default router;
