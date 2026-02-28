import { Router } from 'express';
import {
  forgotPassword,
  refreshToken,
  resetPassword,
  signIn,
  signOut,
  signUp,
  verifyEmail,
} from './auth.controller';
import { validate } from '../../middlewares/validate';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from './auth.schema';
import { verifyToken } from './auth.middleware';
import { authRateLimiter } from '../../middlewares/rateLimiter';

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
