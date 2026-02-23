import { Router } from 'express';
import {
  refreshToken,
  signIn,
  signOut,
  signUp,
  verifyEmail,
} from './auth.controller';
import { validate } from '../../middlewares/validate';
import { signInSchema, signUpSchema } from './auth.schema';
import { verifyToken } from './auth.middleware';

const router = Router();

router.post('/signup', validate({ body: signUpSchema }), signUp);
router.post('/signin', validate({ body: signInSchema }), signIn);
router.post('/signout', verifyToken, signOut);
router.post('/refresh-token', refreshToken);
router.get('/verify-email', verifyEmail);

export default router;
