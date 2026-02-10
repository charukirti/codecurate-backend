import { Request, Response, NextFunction } from 'express';
import { ReviewIdParams } from '../reviews.schema';
import { UnauthorizedError } from '../../../shared/errors';
import { reviewLikeService } from '../services/like.service';

export async function likeReview(
  req: Request<ReviewIdParams, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const { reviewId } = req.params;

    await reviewLikeService.likeReview({ userId, reviewId });

    res.status(200).json({
      message: 'Review liked successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function unlikeReview(
  req: Request<ReviewIdParams, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const { reviewId } = req.params;

    await reviewLikeService.unlikeReview({ reviewId, userId });

    res.status(200).json({
      message: 'Review unliked successfully',
    });
  } catch (error) {
    next(error);
  }
}
