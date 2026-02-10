import { desc, eq, count } from 'drizzle-orm';
import { db } from '../../../db';
import { ReviewReply, reviewReply, reviews, users } from '../../../db/schema';
import { paginatedRepliesResponse, replyResponse } from '../reviews.types';
import {
  ForbiddenError,
  InternalError,
  NotFoundError,
} from '../../../shared/errors';

export const reviewReplyService = {
  /* ============================================
   *           REVIEW REPLY OPERATIONS
   * ============================================ */

  /**
   * Adds reply to the review
   * @param params - object containing reviewId, userId, and replyText
   * @throws {NotFoundError} - if review does not exist
   * @throws {InternalError} - if replying or fetching user data fails
   * @returns {replyResponse}
   */

  async addReply(params: {
    reviewId: string;
    userId: string;
    replyText: string;
  }): Promise<replyResponse> {
    const { reviewId, replyText, userId } = params;

    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
      columns: { id: true },
    });

    if (!existingReview) {
      throw new NotFoundError('Review does not exist');
    }

    const [reply] = await db
      .insert(reviewReply)
      .values({
        userId: userId,
        reviewId: existingReview.id,
        replyText: replyText,
      })
      .returning();

    if (!reply) {
      throw new InternalError('Unable to add reply');
    }

    const [user] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new InternalError('Unable to fetch user');
    }

    return {
      id: reply.id,
      username: user.username,
      replyText: reply.replyText,
      createdAt: reply.createdAt,
    };
  },

  /**
   * Updates existing reply with ownership check
   * @param params - object containing reviewId, userId, replyId, and updated replyText
   * @throws {NotFoundError} - if review or reply does not exist
   * @throws {ForbiddenError} - if reply does not belong to current user
   * @throws {InternalError} - if updating reply fails
   * @returns {ReviewReply}
   */

  async updateReply(params: {
    reviewId: string;
    userId: string;
    replyId: string;
    replyText: string;
  }): Promise<ReviewReply> {
    const { reviewId, userId, replyText, replyId } = params;

    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
      columns: { id: true },
    });

    if (!existingReview) {
      throw new NotFoundError('Review does not exist');
    }

    const existingReply = await db.query.reviewReply.findFirst({
      where: eq(reviewReply.id, replyId),
      columns: { id: true, userId: true, reviewId: true },
    });

    if (!existingReply) {
      throw new NotFoundError('Reply does not exist');
    }

    if (existingReply.userId !== userId) {
      throw new ForbiddenError('Reply does not belong to this user');
    }

    if (existingReply.reviewId !== reviewId) {
      throw new NotFoundError('Reply does not belong to this review');
    }

    const [updatedReply] = await db
      .update(reviewReply)
      .set({ replyText: replyText, updatedAt: new Date() })
      .where(eq(reviewReply.id, replyId))
      .returning();

    if (!updatedReply) {
      throw new InternalError('Failed to update the reply');
    }

    return updatedReply;
  },

  /**
   * Retrieves all the replies on the review in paginated format
   * @param params - object containing reviewId, page and limit for pagination
   * @returns {paginatedRepliesResponse}
   */

  async getAllReplies(params: {
    reviewId: string;
    page: number;
    limit: number;
  }): Promise<paginatedRepliesResponse> {
    const { reviewId, page, limit } = params;
    const offset = (page - 1) * limit;

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
            username: true,
          },
        },
      },
    });

    const [countResult] = await db
      .select({ count: count() })
      .from(reviewReply)
      .where(eq(reviewReply.reviewId, reviewId));

    const totalItems = Number(countResult?.count || 0);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      replies,
      pagination: {
        currentPage: page,
        totalItems,
        totalPages,
      },
    };
  },

  /**
   * Deletes reply with ownership check
   * @param params - object containing userId, and replyId
   * @throws {NotFoundError} - if reply does not exist
   * @throws {ForbiddenError} - if reply does not belong to current user
   */

  async deleteReply(params: {
    replyId: string;
    userId: string;
  }): Promise<void> {
    const { userId, replyId } = params;

    const reply = await db.query.reviewReply.findFirst({
      where: eq(reviewReply.id, replyId),
      columns: { id: true, userId: true },
    });

    if (!reply) {
      throw new NotFoundError('Reply does not exist');
    }

    if (reply.userId !== userId) {
      throw new ForbiddenError('Reply does not belong to this user');
    }

    await db.delete(reviewReply).where(eq(reviewReply.id, replyId));
  },
};
