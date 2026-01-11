import { Router } from 'express';
import { createReview, getAllTags } from './reviews.controller';
import { validate, validateParams } from '../../middlewares/validate';
import { createReviewSchema, resourceIdSchema } from './reviews.schema';
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

export { tagsRouter };
export default router;
