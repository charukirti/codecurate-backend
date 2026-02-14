import { and, eq } from 'drizzle-orm';
import { db } from '../../../db';
import { ReviewLike, reviewLikes } from '../../../db/schema';
import { Transaction } from '../reviews.types';

export const reviewLikeRepository = {
  async findByReviewAndUser(reviewId: string, userId: string) {
    const existingLike = await db.query.reviewLikes.findFirst({
      where: and(
        eq(reviewLikes.reviewId, reviewId),
        eq(reviewLikes.userId, userId)
      ),
      columns: { id: true, userId: true },
    });

    return existingLike;
  },

  async create(
    reviewId: string,
    userId: string,
    tx: Transaction
  ): Promise<ReviewLike | undefined> {
    const [newLike] = await tx
      .insert(reviewLikes)
      .values({
        userId,
        reviewId,
      })
      .returning();

    return newLike;
  },

  async delete(likeId: string, tx: Transaction) {
    await tx.delete(reviewLikes).where(eq(reviewLikes.id, likeId));
  },
};
