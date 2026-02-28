import { eq } from 'drizzle-orm';
import { reviewTags } from '../../../db/schema/reviewTags.js';
import { Transaction } from '../reviews.types.js';

export const reviewTagsRepository = {
  async createMany(
    tx: Transaction,
    reviewId: string,
    tagIds: string[]
  ): Promise<void> {
    await tx.insert(reviewTags).values(
      tagIds.map((tagId) => ({
        reviewId: reviewId,
        tagId: tagId,
      }))
    );
  },

  async deleteByReviewId(tx: Transaction, reviewId: string): Promise<void> {
    await tx.delete(reviewTags).where(eq(reviewTags.reviewId, reviewId));
  },
};
