import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 700,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: 'Too many requests from this IP, please try again later',
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  statusCode: 429,
  message: 'Too many requests from this IP, please try again later',
  keyGenerator: (req) => {
    const email = req.body.email ?? 'no-email';
    const ip = ipKeyGenerator(req.ip!);
    return `${ip}-${email}`;
  },
});
