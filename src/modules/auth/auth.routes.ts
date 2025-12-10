import { Router } from 'express';
import { SignUp } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { signUpSchema } from './auth.schema';

const router = Router();

// signUp route

router.post('/signup', validate(signUpSchema), SignUp);

export default router;
