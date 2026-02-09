import { Router } from 'express';
import {
  addReply,
  createReview,
  deleteReview,
  getAllReplies,
  getAllReviews,
  getAllTags,
  likeReview,
  unlikeReview,
  updateReply,
  updateReview,
} from './reviews.controller';
import { validate } from '../../middlewares/validate';
import {
  addReplySchema,
  createReviewSchema,
  replyParamSchema,
  resourceIdSchema,
  reviewIdParamSchema,
  reviewParamSchema,
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
  validate({ params: reviewParamSchema }),
  likeReview
);

router.delete(
  '/:reviewId/like',
  verifyToken,
  validate({ params: reviewParamSchema }),
  unlikeReview
);

router.post(
  '/:reviewId/replies',
  verifyToken,
  validate({ params: reviewParamSchema, body: addReplySchema }),
  addReply
);

router.patch(
  '/:reviewId/replies/:replyId',
  verifyToken,
  validate({ params: replyParamSchema, body: addReplySchema }),
  updateReply
);

router.get(
  '/:reviewId/replies',
  validate({ params: reviewParamSchema }),
  getAllReplies
);

export { tagsRouter };
export default router;
