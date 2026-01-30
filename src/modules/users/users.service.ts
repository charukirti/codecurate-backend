import { asc, count, desc, eq } from 'drizzle-orm';
import { db } from '../../db';
import { reviews, User, users } from '../../db/schema';
import { ConflictError, NotFoundError } from '../../shared/errors';
import { UpdateUserInput } from './users.schema';
import { SortType } from '../../shared/schema';

export const userService = {
  /**
   * Get user profile
   * @param userId - user id
   * @returns user profile without password and refresh token
   * @throws {NotFoundError} if user does not exist
   */

  async getProfile(
    userId: string
  ): Promise<Omit<User, 'password' | 'refreshToken'>> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      throw new NotFoundError('User does not exist.');
    }

    const {
      password: _password,
      refreshToken: _refreshToken,
      ...userData
    } = user;

    return userData;
  },

  /**
   * Update user profile
   * @param userId - user id
   * @param data - fields to update
   * @returns updated user profile
   * @throws {NotFoundError} if user does not exists
   * @throws {ConflictError} if username is already taken
   */

  async updateProfile(
    userId: string,
    data: UpdateUserInput
  ): Promise<Omit<User, 'password' | 'refreshToken'>> {
    if (data.username) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, data.username));

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError('Username is already taken');
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new NotFoundError('User does not exist');
    }

    const {
      password: _password,
      refreshToken: _refreshToken,
      ...userData
    } = updatedUser;

    return userData;
  },

  async getUserReviews(params: {
    username: string;
    page: number;
    limit: number;
    sort: SortType;
  }) {
    const { username, page, limit, sort } = params;

    const offset = (page - 1) * limit;

    const sortMapping = {
      newest: desc(reviews.createdAt),
      oldest: asc(reviews.createdAt),
      highest: desc(reviews.rating),
      lowest: asc(reviews.rating),
    };

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username));

    if (!existingUser) {
      throw new NotFoundError('User does not exist.');
    }

    const userReviews = await db.query.reviews.findMany({
      where: eq(reviews.userId, existingUser.id),
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

    const [reviewCount] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.userId, existingUser.id));

    const totalItems = Number(reviewCount?.count || 0);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      reviews: userReviews,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  },
};
