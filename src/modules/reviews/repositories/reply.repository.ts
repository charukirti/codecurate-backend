import { count, desc, eq } from 'drizzle-orm';
import { db } from '../../../db';
import { ReviewReply, reviewReply } from '../../../db/schema';
import { ReplyWithUser, reply } from '../reviews.types';

export const reviewsReplyRepository = {
  async findById(replyId: string): Promise<reply | undefined> {
    const existingReply = await db.query.reviewReply.findFirst({
      where: eq(reviewReply.id, replyId),
      columns: { id: true, userId: true, reviewId: true },
    });

    return existingReply;
  },

  async getAllPaginated(
    reviewId: string,
    limit: number,
    offset: number
  ): Promise<ReplyWithUser[]> {
    const replies = await db.query.reviewReply.findMany({
      where: eq(reviewReply.reviewId, reviewId),
      orderBy: desc(reviewReply.createdAt),
      offset: offset,
      limit: limit,
      columns: {
        id: true,
        replyText: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    });

    return replies;
  },

  async countByReviewId(reviewId: string): Promise<number> {
    const [countResult] = await db
      .select({ count: count() })
      .from(reviewReply)
      .where(eq(reviewReply.reviewId, reviewId));

    return Number(countResult?.count ?? 0);
  },

  async create(
    userId: string,
    reviewId: string,
    replyText: string
  ): Promise<ReviewReply | undefined> {
    const [newReply] = await db
      .insert(reviewReply)
      .values({
        userId: userId,
        reviewId: reviewId,
        replyText: replyText,
      })
      .returning();

    return newReply;
  },

  async update(
    replyId: string,
    replyText: string
  ): Promise<ReviewReply | undefined> {
    const [updatedReply] = await db
      .update(reviewReply)
      .set({ replyText: replyText, updatedAt: new Date() })
      .where(eq(reviewReply.id, replyId))
      .returning();

    return updatedReply;
  },

  async delete(replyId: string): Promise<void> {
    await db.delete(reviewReply).where(eq(reviewReply.id, replyId));
  },
};
