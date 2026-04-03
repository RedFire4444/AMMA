import rateLimit from 'express-rate-limit';

// General API rate limiter: 100 requests per minute per IP
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later.',
    },
    meta: null,
  },
});

// Strict OTP rate limiter: 3 OTP requests per phone per 10 minutes
// Apply this specifically to the /api/auth/request-otp route
export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  keyGenerator: (req) => req.body?.phone || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: 'OTP_LIMIT_EXCEEDED',
      message: 'Too many OTP requests. Please wait 10 minutes before trying again.',
    },
    meta: null,
  },
});
