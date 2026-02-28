import { Router } from 'express';
import {
  forgotPassword,
  refreshToken,
  resetPassword,
  signIn,
  signOut,
  signUp,
  verifyEmail,
} from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from './auth.schema.js';
import { verifyToken } from './auth.middleware.js';
import { authRateLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();

router.post(
  '/signup',
  authRateLimiter,
  validate({ body: signUpSchema }),
  signUp
);
router.post(
  '/signin',
  authRateLimiter,
  validate({ body: signInSchema }),
  signIn
);
router.post('/signout', verifyToken, signOut);
router.post('/refresh-token', refreshToken);
router.get('/verify-email', verifyEmail);
router.post(
  '/forgot-password',
  authRateLimiter,
  validate({ body: forgotPasswordSchema }),
  forgotPassword
);
router.post(
  '/reset-password',
  authRateLimiter,
  validate({ body: resetPasswordSchema }),
  resetPassword
);

export default router;
