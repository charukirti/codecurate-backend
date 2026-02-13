import { eq, inArray } from 'drizzle-orm';
import { db } from '../../../db';
import { reviewTags, Tags, tags } from '../../../db/schema';
import {
  PaginatedReviewsResponse,
  reviewData,
  ReviewResponse,
} from '../reviews.types';
import { UpdateReviewInput } from '../reviews.schema';

import {
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  ValidationError,
} from '../../../shared/errors';
import { SortType } from '../../../shared/schema';
import { reviewsRepository } from '../repositories/reviews.repository';
import { resourceRepository } from '../../resource/resource.repository';

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export const reviewService = {
  /* ============================================
   *           HELPER METHODS
   * ============================================ */

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
    const result = await reviewsRepository.calculateAvgRating(tx, resourceId);

    const newAverage = result ? String(Number(result).toFixed(1)) : '0';

    await resourceRepository.updateAvgRating(newAverage, resourceId, tx);
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

  /* ============================================
   *           REVIEW OPERATIONS
   * ============================================ */

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
    const { userId, resourceId, tagIds } = data;

    const existingResource = await resourceRepository.findById(resourceId);

    if (!existingResource) {
      throw new NotFoundError('Video or Playlist does not found');
    }

    const existingReview = await reviewsRepository.findByUserAndResource(
      userId,
      resourceId
    );

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
      const newReview = await reviewsRepository.create(tx, data);

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

      const reviewWithTags =
        await reviewsRepository.findReviewWithIdAndRelations(newReview.id, tx);

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

    const allReviews = await reviewsRepository.getAllPaginated(
      resourceId,
      sort,
      limit,
      offset
    );

    const reviewsWithTags = allReviews.map((review) => ({
      ...review,
      reviewTags: undefined,
      tags: review.reviewTags.map((rt) => rt.tag),
    }));

    const countResult = await reviewsRepository.countByResourceId(resourceId);

    const totalItems = Number(countResult || 0);

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
   * @returns {Promise<ReviewWithTags>} updated review with tags
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

    const existingReview = await reviewsRepository.findById(reviewId);

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
      const updatedReview = await reviewsRepository.update(tx, reviewId, {
        reviewText: data?.reviewText,
        rating: data.rating,
      });
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

      const updatedReviewWithTags =
        await reviewsRepository.findReviewWithIdAndRelations(
          updatedReview.id,
          tx
        );

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

    const existingReview = await reviewsRepository.findById(reviewId);

    if (!existingReview) {
      throw new NotFoundError('Review does not exist!');
    }

    if (existingReview.userId !== userId) {
      throw new ForbiddenError('Review does not belong to this user');
    }

    await db.transaction(async (tx) => {
      await reviewsRepository.delete(tx, reviewId);
      await this._calculateAndUpdateRating(tx, existingReview.resourceId);
    });
  },
};
