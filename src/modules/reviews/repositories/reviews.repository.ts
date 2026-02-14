import { and, asc, desc, eq, sql, count } from 'drizzle-orm';
import { db } from '../../../db';
import { Reviews, reviews } from '../../../db/schema';
import {
  createReviewData,
  ReviewWithRelations,
  Transaction,
} from '../reviews.types';
import { SortType } from '../../../shared/schema';

export const reviewsRepository = {
  async create(
    tx: Transaction,
    data: createReviewData
  ): Promise<Reviews | undefined> {
    const [newReview] = await tx
      .insert(reviews)
      .values({
        userId: data.userId,
        resourceId: data.resourceId,
        reviewText: data.reviewText,
        rating: data.rating,
      })
      .returning();

    return newReview;
  },

  async update(
    tx: Transaction,
    reviewId: string,
    data: {
      reviewText?: string;
      rating?: number;
    }
  ): Promise<Reviews | undefined> {
    const [updatedReview] = await tx
      .update(reviews)
      .set({
        reviewText: data.reviewText,
        rating: data.rating,
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    return updatedReview;
  },

  async delete(tx: Transaction, reviewId: string): Promise<void> {
    await tx.delete(reviews).where(eq(reviews.id, reviewId));
  },

  async findByUserAndResource(
    userId: string,
    resourceId: string
  ): Promise<Reviews | undefined> {
    const existingReview = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.userId, userId),
        eq(reviews.resourceId, resourceId)
      ),
    });

    return existingReview;
  },

  async findById(reviewId: string): Promise<Reviews | undefined> {
    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
    });

    return existingReview;
  },

  async findReviewWithIdAndRelations(
    reviewId: string,
    tx?: Transaction
  ): Promise<ReviewWithRelations | undefined> {
    const review = await (tx || db).query.reviews.findFirst({
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

    return review;
  },

  async getAllPaginated(
    resourceId: string,
    sort: SortType,
    limit: number,
    offset: number
  ): Promise<ReviewWithRelations[]> {
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

    return allReviews;
  },

  async calculateAvgRating(
    tx: Transaction,
    resourceId: string
  ): Promise<string> {
    const [result] = await tx
      .select({
        average: sql<string>`avg(${reviews.rating})`,
      })
      .from(reviews)
      .where(eq(reviews.resourceId, resourceId));

    return result?.average ? String(Number(result.average).toFixed(1)) : '0';
  },

  async countByResourceId(resourceId: string): Promise<number> {
    const [countResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.resourceId, resourceId));

    return Number(countResult?.count ?? 0);
  },

  async incrementLikeCount(tx: Transaction, reviewId: string): Promise<void> {
    await tx
      .update(reviews)
      .set({ reviewLikeCount: sql`${reviews.reviewLikeCount} + 1` })
      .where(eq(reviews.id, reviewId));
  },

  async decrementLikeCount(tx: Transaction, reviewId: string): Promise<void> {
    await tx
      .update(reviews)
      .set({
        reviewLikeCount: sql`GREATEST(${reviews.reviewLikeCount} - 1, 0)`,
      })
      .where(eq(reviews.id, reviewId));
  },

  async findUsersReviews(
    userId: string,
    sort: SortType,
    limit: number,
    offset: number
  ) {
    const sortMapping = {
      newest: desc(reviews.createdAt),
      oldest: asc(reviews.createdAt),
      highest: desc(reviews.rating),
      lowest: asc(reviews.rating),
    };

    const userReviews = await db.query.reviews.findMany({
      where: eq(reviews.userId, userId),
      limit: limit,
      offset: offset,
      orderBy: sortMapping[sort],
      with: {
        resource: {
          columns: {
            id: true,
            title: true,
            thumbnails: true,
            avgRating: true,
            type: true,
          },
        },

        reviewTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    return userReviews;
  },

  async countByUserId(userId: string) {
    const [reviewCount] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.userId, userId));

    return Number(reviewCount?.count || 0);
  },
};
