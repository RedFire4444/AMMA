import { Router } from 'express';
import { requestOTP, verifyOTP, emailLogin, emailSignup } from '../controllers/auth.controller';
import { validate } from '../middleware/validator.middleware';
import { otpRateLimiter } from '../middleware/rateLimiter.middleware';
import { requestOTPSchema, verifyOTPSchema } from '../validators/auth.validator';
import { z } from 'zod';

const router = Router();

// Phone OTP Auth
router.post('/request-otp', otpRateLimiter, validate(requestOTPSchema), requestOTP);
router.post('/verify-otp', validate(verifyOTPSchema), verifyOTP);

// Email Auth
const emailLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const emailSignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

router.post('/email-login', validate(emailLoginSchema), emailLogin);
router.post('/email-signup', validate(emailSignupSchema), emailSignup);

// Health check for auth routes
router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'Auth API is running' }, error: null, meta: null });
});

export default router;
