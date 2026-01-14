import { Request, Response, NextFunction } from 'express';
import { reviewService } from './reviews.service';
import {
  CreateReviewInput,
  ResourceId,
  ReviewsQueryInput,
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

    const { page, limit, sort } = req.query as unknown as ReviewsQueryInput;

    const { reviews, pagination } = await reviewService.getAllReviews({
      resourceId,
      page,
      limit,
      sort,
    });

    res.status(200).json({
      message: 'Fetched all reviews successfully',
      reviews,
      pagination,
    });
  } catch (error) {
    next(error);
  }
}
