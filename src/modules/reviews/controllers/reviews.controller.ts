import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/reviews.service';
import {
  CreateReviewInput,
  getReviewsQuerySchema,
  ResourceIdParams,
  ReviewAndResourceParams,
  UpdateReviewInput,
} from '../reviews.schema';
import { UnauthorizedError } from '../../../shared/errors';

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
  req: Request<ResourceIdParams, {}, CreateReviewInput>,
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
  req: Request<ResourceIdParams, {}, {}>,
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
  req: Request<ReviewAndResourceParams, {}, UpdateReviewInput>,
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

export async function deleteReview(
  req: Request<ReviewAndResourceParams, {}, {}>,
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
