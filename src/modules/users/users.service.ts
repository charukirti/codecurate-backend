import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { User, users } from '../../db/schema';
import { ConflictError, NotFoundError } from '../../shared/errors';
import { UpdateUserInput } from './users.schema';

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
};
