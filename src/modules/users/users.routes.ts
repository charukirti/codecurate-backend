import { Router } from 'express';
import { verifyToken } from '../auth/auth.middleware';
import { getProfile, updateProfile } from './users.controller';
import { validate } from '../../middlewares/validate';
import { updateUser } from './users.schema';

const router = Router();

router.get('/me', verifyToken, getProfile);
router.patch('/me', verifyToken, validate(updateUser), updateProfile);

export default router;
