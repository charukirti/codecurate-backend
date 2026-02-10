import { Router } from 'express';
import {
  createReview,
  deleteReview,
  getAllReviews,
  getAllTags,
  updateReview,
} from './controllers/reviews.controller';
import { likeReview, unlikeReview } from './controllers/like.controller';
import {
  addReply,
  deleteReply,
  getAllReplies,
  updateReply,
} from './controllers/reply.controller';

import { validate } from '../../middlewares/validate';

import {
  addReplySchema,
  createReviewSchema,
  reviewAndReplyIdParamSchema,
  resourceIdParamSchema,
  reviewAndResourceParamsSchema,
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
  validate({ body: createReviewSchema }),
  validate({ params: resourceIdParamSchema }),
  createReview
);

router.get('/', validate({ params: resourceIdParamSchema }), getAllReviews);

router.patch(
  '/:reviewId',
  verifyToken,
  validate({ params: reviewAndResourceParamsSchema }),
  validate({ body: updateReviewSchema }),
  updateReview
);

router.delete(
  '/:reviewId',
  verifyToken,
  validate({ params: reviewAndResourceParamsSchema }),
  deleteReview
);

router.post(
  '/:reviewId/like',
  verifyToken,
  validate({ params: reviewIdParamSchema }),
  likeReview
);

router.delete(
  '/:reviewId/like',
  verifyToken,
  validate({ params: reviewIdParamSchema }),
  unlikeReview
);

router.post(
  '/:reviewId/replies',
  verifyToken,
  validate({ params: reviewIdParamSchema, body: addReplySchema }),
  addReply
);

router.patch(
  '/:reviewId/replies/:replyId',
  verifyToken,
  validate({ params: reviewAndReplyIdParamSchema, body: addReplySchema }),
  updateReply
);

router.get(
  '/:reviewId/replies',
  validate({ params: reviewIdParamSchema }),
  getAllReplies
);

router.delete(
  '/:reviewId/replies/:replyId',
  verifyToken,
  validate({ params: reviewAndReplyIdParamSchema }),
  deleteReply
);

export { tagsRouter };
export default router;
