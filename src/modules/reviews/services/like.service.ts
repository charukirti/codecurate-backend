import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../../db';
import { reviewLikes, reviews } from '../../../db/schema';
import { ConflictError, NotFoundError } from '../../../shared/errors';

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

    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
      columns: { id: true },
    });

    const existingLike = await db.query.reviewLikes.findFirst({
      where: and(
        eq(reviewLikes.userId, userId),
        eq(reviewLikes.reviewId, reviewId)
      ),
      columns: { id: true },
    });

    if (!existingReview) {
      throw new NotFoundError('Review does not exist');
    }

    if (existingLike) {
      throw new ConflictError('You already liked review');
    }

    await db.transaction(async (tx) => {
      await tx.insert(reviewLikes).values({
        userId,
        reviewId,
      });

      await tx
        .update(reviews)
        .set({ reviewLikeCount: sql`${reviews.reviewLikeCount} +1` })
        .where(eq(reviews.id, reviewId));
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

    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
      columns: { id: true },
    });

    if (!existingReview) {
      throw new NotFoundError('Review does not exist');
    }

    const existingLike = await db.query.reviewLikes.findFirst({
      where: and(
        eq(reviewLikes.reviewId, reviewId),
        eq(reviewLikes.userId, userId)
      ),
      columns: { id: true },
    });

    if (!existingLike) {
      return;
    }

    await db.transaction(async (tx) => {
      await tx.delete(reviewLikes).where(eq(reviewLikes.id, existingLike.id));

      await tx
        .update(reviews)
        .set({
          reviewLikeCount: sql`GREATEST(${reviews.reviewLikeCount} - 1, 0)`,
        })
        .where(eq(reviews.id, reviewId));
    });
  },
};
