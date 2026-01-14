import { Router } from 'express';
import { createReview, getAllReviews, getAllTags } from './reviews.controller';
import {
  validate,
  validateParams,
  validateQuery,
} from '../../middlewares/validate';
import {
  createReviewSchema,
  getReviewsQuerySchema,
  resourceIdSchema,
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

export { tagsRouter };
export default router;
