import { Router } from 'express';
import { refreshToken, signIn, signOut, signUp } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { signInSchema, signUpSchema } from './auth.schema';
import { verifyToken } from './auth.middleware';

const router = Router();

router.post('/signup', validate(signUpSchema), signUp);
router.post('/signin', validate(signInSchema), signIn);
router.post('/signout', verifyToken, signOut);
router.post('/refresh-token', refreshToken);

export default router;
