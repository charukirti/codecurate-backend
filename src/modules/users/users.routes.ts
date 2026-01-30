import { Router } from 'express';
import { verifyToken } from '../auth/auth.middleware';
import { getProfile, getUserReviews, updateProfile } from './users.controller';
import { validate } from '../../middlewares/validate';
import { updateUser, usersReviewsParamSchema } from './users.schema';

const router = Router();

router.get('/me', verifyToken, getProfile);
router.patch('/me', verifyToken, validate({ body: updateUser }), updateProfile);
router.get(
  '/:username/reviews',
  validate({
    params: usersReviewsParamSchema,
  }),
  getUserReviews
);

export default router;
