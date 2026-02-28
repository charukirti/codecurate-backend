import { db } from '../../../db/index.js';
import { ConflictError, NotFoundError } from '../../../shared/errors.js';
import { reviewsRepository } from '../repositories/reviews.repository.js';
import { reviewLikeRepository } from '../repositories/reviewLike.repository.js';

export const reviewLikeService = {
  /**
   * Adds a like to a review and increments the like count
   * @param params - object containing reviewId and userId
   * @returns {Promise<void>}
   * @throws {NotFoundError} if review does not exist
   * @throws {ConflictError} if user has already liked the review
   */

  async likeReview(params: {
    reviewId: string;
    userId: string;
  }): Promise<void> {
    const { userId, reviewId } = params;

    const existingReview = await reviewsRepository.findById(reviewId);

    const existingLike = await reviewLikeRepository.findByReviewAndUser(
      reviewId,
      userId
    );

    if (!existingReview) {
      throw new NotFoundError('Review does not exist');
    }

    if (existingLike) {
      throw new ConflictError('You already liked review');
    }

    await db.transaction(async (tx) => {
      await reviewLikeRepository.create(reviewId, userId, tx);

      await reviewsRepository.incrementLikeCount(tx, reviewId);
    });
  },

  /**
   * Removes a like from a review and decrements the like count
   * @param params - object containing reviewId and userId
   * @returns {Promise<void>}
   * @throws {NotFoundError} if review does not exist
   */

  async unlikeReview(params: {
    reviewId: string;
    userId: string;
  }): Promise<void> {
    const { reviewId, userId } = params;

    const existingLike = await reviewLikeRepository.findByReviewAndUser(
      reviewId,
      userId
    );

    if (!existingLike) {
      return;
    }

    await db.transaction(async (tx) => {
      await reviewLikeRepository.delete(existingLike.id, tx);
      await reviewsRepository.decrementLikeCount(tx, reviewId);
    });
  },
};
