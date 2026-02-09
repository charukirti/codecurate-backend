import { and, asc, count, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../../db';
import {
  resources,
  reviewLikes,
  ReviewRelply,
  reviewReply,
  reviews,
  reviewTags,
  Tags,
  tags,
  users,
} from '../../db/schema';
import {
  paginatedRepliesResponse,
  PaginatedReviewsResponse,
  replyResponse,
  reviewData,
  ReviewResponse,
} from './reviews.types';
import { UpdateReviewInput } from './reviews.schema';

import {
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors';
import { SortType } from '../../shared/schema';

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export const reviewService = {
  /**
   * Calculates the average rating and updates the resource table column
   * @param tx - database transaction
   * @param resourceId - resource id of the resource whose average rating is being calculated
   * @returns {Promise<void>}
   */

  async _calculateAndUpdateRating(
    tx: Transaction,
    resourceId: string
  ): Promise<void> {
    const [result] = await tx
      .select({
        average: sql<string>`avg(${reviews.rating})`,
      })
      .from(reviews)
      .where(eq(reviews.resourceId, resourceId));

    const newAverage = result?.average
      ? String(Number(result.average).toFixed(1))
      : '0';

    await tx
      .update(resources)
      .set({
        avgRating: newAverage,
      })
      .where(eq(resources.id, resourceId));
  },

  /**
   * Retrieves all tags from the database
   * @returns {Promise<Tags[]>} array of all tags
   * @throws {NotFoundError} if no tags exist
   */

  async getAllTags(): Promise<Tags[]> {
    const allTags = await db.select().from(tags);
    if (!allTags || allTags.length === 0) {
      throw new NotFoundError('Tags does not exist');
    }
    return allTags;
  },

  /**
   * Creates a new review with user selected tags for a resource
   * @param data - review data object containing userId, resourceId, rating, reviewText, and tagIds
   * @returns {Promise<ReviewResponse | undefined>} created review with user selected tags
   * @throws {NotFoundError} if resource is not found
   * @throws {ConflictError} if review already exists for user and resource
   * @throws {ValidationError} if tags are not valid
   * @throws {InternalError} if review creation fails
   */

  async createReview(data: reviewData): Promise<ReviewResponse> {
    const { userId, resourceId, rating, reviewText, tagIds } = data;

    const [existingResource] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, resourceId));

    if (!existingResource) {
      throw new NotFoundError('Video or Playlist does not found');
    }

    const existingReview = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.userId, userId),
        eq(reviews.resourceId, resourceId)
      ),
    });

    if (existingReview) {
      throw new ConflictError('Review already exists');
    }

    const validTags = await db
      .select()
      .from(tags)
      .where(inArray(tags.id, tagIds));

    if (validTags.length !== tagIds.length) {
      throw new ValidationError('Tags are not valid');
    }

    const createdReview = await db.transaction(async (tx) => {
      const [newReview] = await tx
        .insert(reviews)
        .values({
          userId,
          resourceId,
          reviewText,
          rating,
        })
        .returning();

      if (!newReview) {
        throw new InternalError('Failed to create review');
      }

      await tx.insert(reviewTags).values(
        tagIds.map((tagId) => ({
          reviewId: newReview.id,
          tagId: tagId,
        }))
      );

      await this._calculateAndUpdateRating(tx, data.resourceId);

      const reviewWithTags = await tx.query.reviews.findFirst({
        where: eq(reviews.id, newReview.id),
        with: {
          user: {
            columns: { id: true, username: true },
          },

          reviewTags: {
            with: {
              tag: true,
            },
          },
        },
      });

      if (!reviewWithTags) {
        throw new InternalError('Failed to fetch the created review');
      }

      return {
        ...reviewWithTags,
        reviewTags: undefined,
        tags: reviewWithTags?.reviewTags.map((rt) => rt.tag),
      };
    });

    return createdReview;
  },

  /**
   * Retrieves paginated reviews for a resource with sorting options
   * @param params - object containing resourceId, page, limit, and sort type
   * @returns {Promise<PaginatedReviewsResponse>} paginated reviews with user info and tags, plus pagination metadata
   */

  async getAllReviews(params: {
    resourceId: string;
    page: number;
    limit: number;
    sort: SortType;
  }): Promise<PaginatedReviewsResponse> {
    const { resourceId, page, limit, sort } = params;

    const offset = (page - 1) * limit;

    const sortMapping = {
      newest: desc(reviews.createdAt),
      oldest: asc(reviews.createdAt),
      highest: desc(reviews.rating),
      lowest: asc(reviews.rating),
    };

    const allReviews = await db.query.reviews.findMany({
      where: eq(reviews.resourceId, resourceId),
      limit: limit,
      offset: offset,
      orderBy: sortMapping[sort],
      with: {
        user: {
          columns: { id: true, username: true },
        },
        reviewTags: {
          with: { tag: true },
        },
      },
    });

    const reviewsWithTags = allReviews.map((review) => ({
      ...review,
      reviewTags: undefined,
      tags: review.reviewTags.map((rt) => rt.tag),
    }));

    const [countResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.resourceId, resourceId));

    const totalItems = Number(countResult?.count || 0);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      reviews: reviewsWithTags,
      pagination: {
        currentPage: page,
        totalItems,
        totalPages,
      },
    };
  },

  /**
   * Updates an existing review and recalculates average rating
   * @param params - object containing reviewId, userId, resourceId, and data to update
   * @returns {Promise<ReviewWithTags | undefined>} updated review with tags
   * @throws {NotFoundError} if review does not exist
   * @throws {ForbiddenError} if review does not belong to current user
   * @throws {ValidationError} if tags are not valid
   * @throws {InternalError} if review update fails
   */

  async updateReview(params: {
    reviewId: string;
    userId: string;
    resourceId: string;
    data: UpdateReviewInput;
  }): Promise<ReviewResponse> {
    const { userId, resourceId, reviewId, data } = params;

    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
      with: {
        reviewTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    if (!existingReview) {
      throw new NotFoundError('Review does not exist');
    }

    if (existingReview.userId !== userId) {
      throw new ForbiddenError('Review does not belong to this user');
    }

    if (data.tagIds) {
      const validTags = await db
        .select()
        .from(tags)
        .where(inArray(tags.id, data.tagIds));

      if (validTags.length !== data.tagIds.length) {
        throw new ValidationError('Tags are not valid');
      }
    }

    const updatedReview = await db.transaction(async (tx) => {
      const [updatedReview] = await tx
        .update(reviews)
        .set({
          reviewText: data.reviewText,
          rating: data.rating,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, reviewId))
        .returning();

      if (!updatedReview) {
        throw new InternalError('Failed to create review');
      }

      if (data.tagIds) {
        await tx.delete(reviewTags).where(eq(reviewTags.reviewId, reviewId));

        await tx.insert(reviewTags).values(
          data.tagIds.map((tagId) => ({
            reviewId: reviewId,
            tagId: tagId,
          }))
        );
      }

      await this._calculateAndUpdateRating(tx, resourceId);

      const updatedReviewWithTags = await tx.query.reviews.findFirst({
        where: eq(reviews.id, reviewId),
        with: {
          user: {
            columns: {
              id: true,
              username: true,
            },
          },
          reviewTags: {
            with: {
              tag: true,
            },
          },
        },
      });

      if (!updatedReviewWithTags) {
        throw new InternalError('Failed to fetch the updated review');
      }

      return {
        ...updatedReviewWithTags,
        reviewTags: undefined,
        tags: updatedReviewWithTags?.reviewTags.map((rt) => rt.tag),
      };
    });

    return updatedReview;
  },

  async likeReview(params: { reviewId: string; userId: string }) {
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

  async unlikeReview(params: { reviewId: string; userId: string }) {
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

  /**
   * Deletes a review for the user and recalculates average rating
   * @param params - object containing reviewId and userId
   * @returns {Promise<void>}
   * @throws {NotFoundError} if review does not exist
   * @throws {ForbiddenError} if review does not belong to current user
   */

  async deleteReview(params: {
    reviewId: string;
    userId: string;
  }): Promise<void> {
    const { reviewId, userId } = params;

    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
    });

    if (!existingReview) {
      throw new NotFoundError('Review does not exist!');
    }

    if (existingReview.userId !== userId) {
      throw new ForbiddenError('Review does not belong to this user');
    }

    await db.transaction(async (tx) => {
      await tx.delete(reviews).where(eq(reviews.id, reviewId));
      await this._calculateAndUpdateRating(tx, existingReview.resourceId);
    });
  },

  /* reply to review */

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

  async updateReply(params: {
    reviewId: string;
    userId: string;
    replyId: string;
    replyText: string;
  }): Promise<ReviewRelply> {
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
