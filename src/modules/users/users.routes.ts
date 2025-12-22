import { Router } from 'express';
import { verifyToken } from '../auth/auth.middleware';
import { getProfile, updateProfile } from './users.controller';
import { validate } from '../../middlewares/validate';
import { updateUser } from './users.schema';

const router = Router();

router.get('/user', verifyToken, getProfile);
router.patch('/update', verifyToken, validate(updateUser), updateProfile);

export default router;
