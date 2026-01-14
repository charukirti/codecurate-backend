import { Router } from 'express';
import {
  createReview,
  getAllReviews,
  getAllTags,
  updateReview,
} from './reviews.controller';
import {
  validate,
  validateParams,
  validateQuery,
} from '../../middlewares/validate';
import {
  createReviewSchema,
  getReviewsQuerySchema,
  resourceIdSchema,
  reviewIdParamSchema,
  updateReviewSchema,
} from './reviews.schema';
import { verifyToken } from '../auth/auth.middleware';

const router = Router({ mergeParams: true });
const tagsRouter = Router();

tagsRouter.get('/', getAllTags);

router.post(
  '/',
  verifyToken,
  validate(createReviewSchema),
  validateParams(resourceIdSchema),
  createReview
);

router.get(
  '/',
  validateQuery(getReviewsQuerySchema),
  validateParams(resourceIdSchema),
  getAllReviews
);

router.patch(
  '/:reviewId',
  verifyToken,
  validateParams(reviewIdParamSchema),
  validate(updateReviewSchema),
  updateReview
);

export { tagsRouter };
export default router;
