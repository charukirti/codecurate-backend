import { Request, Response, NextFunction } from 'express';
import { reviewService } from './reviews.service';
import {
  AddReplyInput,
  CreateReviewInput,
  getReviewsQuerySchema,
  ResourceId,
  ReviewIdParams,
  ReviewIdParam,
  UpdateReviewInput,
  ReplyIdParam,
  getRepliesQuerySchema,
} from './reviews.schema';
import { UnauthorizedError } from '../../shared/errors';

export async function getAllTags(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tags = await reviewService.getAllTags();
    res.status(200).json({
      message: 'Retrieved all tags.',
      data: tags,
    });
  } catch (error) {
    next(error);
  }
}

export async function createReview(
  req: Request<ResourceId, {}, CreateReviewInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }
    const { resourceId } = req.params;

    const { reviewText, rating, tagIds } = req.body;

    const reviewData = {
      reviewText,
      rating,
      tagIds,
    };

    const createdReview = await reviewService.createReview({
      userId,
      resourceId,
      ...reviewData,
    });

    res.status(201).json({
      message: 'Review has been added',
      data: createdReview,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllReviews(
  req: Request<ResourceId, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const { resourceId } = req.params;

    const { page, limit, sort } = getReviewsQuerySchema.parse(req.query);

    const { reviews, pagination } = await reviewService.getAllReviews({
      resourceId,
      page,
      limit,
      sort,
    });

    res.status(200).json({
      message: 'Fetched all reviews successfully',
      data: {
        reviews,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReview(
  req: Request<ReviewIdParams, {}, UpdateReviewInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { reviewText, rating, tagIds } = req.body;
    const { resourceId, reviewId } = req.params;

    const updatedReview = await reviewService.updateReview({
      reviewId,
      userId,
      resourceId,
      data: {
        reviewText,
        rating,
        tagIds,
      },
    });

    res.status(200).json({
      message: 'Review updated successfully',
      data: updatedReview,
    });
  } catch (error) {
    next(error);
  }
}

export async function likeReview(
  req: Request<ReviewIdParam, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const { reviewId } = req.params;

    await reviewService.likeReview({ userId, reviewId });

    res.status(200).json({
      message: 'Review liked successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function unlikeReview(
  req: Request<ReviewIdParam, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const { reviewId } = req.params;

    await reviewService.unlikeReview({ reviewId, userId });

    res.status(200).json({
      message: 'Review unliked successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(
  req: Request<ReviewIdParams, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { reviewId } = req.params;

    await reviewService.deleteReview({
      userId,
      reviewId,
    });

    res.status(200).json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function addReply(
  req: Request<ReviewIdParams, {}, AddReplyInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { reviewId } = req.params;

    const { replyText } = req.body;

    const reply = await reviewService.addReply({
      reviewId,
      userId,
      replyText,
    });

    res.status(201).json({
      message: 'Reply added successfully',
      data: reply,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReply(
  req: Request<ReplyIdParam, {}, AddReplyInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { reviewId, replyId } = req.params;
    const { replyText } = req.body;

    const reply = await reviewService.updateReply({
      reviewId,
      userId,
      replyId,
      replyText,
    });

    res.status(200).json({
      message: 'Reply updated successfully',
      data: reply,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllReplies(
  req: Request<ReviewIdParam, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const { reviewId } = req.params;
    const { page, limit } = getRepliesQuerySchema.parse(req.query);

    const { replies, pagination } = await reviewService.getAllReplies({
      reviewId,
      page,
      limit,
    });

    res.status(200).json({
      message: 'Fetched all replies successfully',
      data: {
        replies,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteReply(
  req: Request<ReplyIdParam, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const { replyId } = req.params;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    await reviewService.deleteReply({ replyId, userId });

    res.status(200).json({
      message: 'Reply deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
