import { and, asc, count, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../../db';
import { resources, reviews, reviewTags, Tags, tags } from '../../db/schema';
import { reviewData, ReviewWithTags } from './reviews.types';
import { SortType } from './reviews.schema';

import {
  ConflictError,
  InternalError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors';

export const reviewService = {
  async getAllTags(): Promise<Tags[]> {
    const allTags = await db.select().from(tags);
    if (!allTags || allTags.length === 0) {
      throw new NotFoundError('Tags does not exist');
    }
    return allTags;
  },

  async createReview(data: reviewData): Promise<ReviewWithTags | undefined> {
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

      const reviewWithTags = await tx.query.reviews.findFirst({
        where: eq(reviews.id, newReview.id),
        with: {
          reviewTags: {
            with: {
              tag: true,
            },
          },
        },
      });

      return reviewWithTags;
    });

    return createdReview;
  },

  async getAllReviews(params: {
    resourceId: string;
    page: number;
    limit: number;
    sort: SortType;
  }) {
    const { resourceId, page, limit, sort } = params;
    // calculate offset

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

    const [countResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.resourceId, resourceId));

    const totalItems = Number(countResult?.count || 0);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      reviews: allReviews,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  },
};
