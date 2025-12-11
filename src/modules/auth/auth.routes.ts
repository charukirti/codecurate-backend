import { Router } from 'express';
import { signUp } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { signUpSchema } from './auth.schema';

const router = Router();

// signUp route

router.post('/signup', validate(signUpSchema), signUp);

export default router;
