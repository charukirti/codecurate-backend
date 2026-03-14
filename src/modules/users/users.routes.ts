import { Router } from 'express';
import { verifyToken } from '../auth/auth.middleware.js';
import {
  deleteUser,
  getProfile,
  getPublicProfile,
  getUserReviews,
  updateProfile,
} from './users.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  deleteUserSchema,
  updateUser,
  usersReviewsParamSchema,
} from './users.schema.js';

const router = Router();

router.get('/me', verifyToken, getProfile);
router.patch('/me', verifyToken, validate({ body: updateUser }), updateProfile);
router.get(
  '/:username',
  validate({ params: usersReviewsParamSchema }),
  getPublicProfile
);
router.get(
  '/:username/reviews',
  validate({
    params: usersReviewsParamSchema,
  }),
  getUserReviews
);
router.delete(
  '/me',
  verifyToken,
  validate({ body: deleteUserSchema }),
  deleteUser
);

export default router;
