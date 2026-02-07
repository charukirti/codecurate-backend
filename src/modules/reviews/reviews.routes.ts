import { Router } from 'express';
import {
  createReview,
  deleteReview,
  getAllReviews,
  getAllTags,
  likeReview,
  updateReview,
} from './reviews.controller';
import { validate } from '../../middlewares/validate';
import {
  createReviewSchema,
  resourceIdSchema,
  reviewIdParamSchema,
  reviewLikeParamSchema,
  updateReviewSchema,
} from './reviews.schema';
import { verifyToken } from '../auth/auth.middleware';

const router = Router({ mergeParams: true });
const tagsRouter = Router();

tagsRouter.get('/', getAllTags);

router.post(
  '/',
  verifyToken,
  validate({ body: createReviewSchema }),
  validate({ params: resourceIdSchema }),
  createReview
);

router.get('/', validate({ params: resourceIdSchema }), getAllReviews);

router.patch(
  '/:reviewId',
  verifyToken,
  validate({ params: reviewIdParamSchema }),
  validate({ body: updateReviewSchema }),
  updateReview
);

router.delete(
  '/:reviewId',
  verifyToken,
  validate({ params: reviewIdParamSchema }),
  deleteReview
);

router.post(
  '/:reviewId/like',
  verifyToken,
  validate({ params: reviewLikeParamSchema }),
  likeReview
);

export { tagsRouter };
export default router;
