import { UserData } from '../../db/schema';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors';
import { UpdateUserInput } from './users.schema';
import { SortType } from '../../shared/schema';
import { userRepository } from './user.repository';
import { reviewsRepository } from '../reviews/repositories/reviews.repository';
import bcrypt from 'bcryptjs';

export const userService = {
  /**
   * Get user profile
   * @param userId - user id
   * @returns user profile without password and refresh token
   * @throws {NotFoundError} if user does not exist
   */

  async getProfile(
    userId: string
  ): Promise<Omit<UserData, 'password' | 'refreshToken'>> {
    const user = await userRepository.findById(userId);

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
  ): Promise<Omit<UserData, 'password' | 'refreshToken'>> {
    if (data.username) {
      const existingUser = await userRepository.findByUsername(data.username);

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError('Username is already taken');
      }
    }

    const updatedUser = await userRepository.update(data, userId);

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

    const existingUser = await userRepository.findByUsername(username);

    if (!existingUser) {
      throw new NotFoundError('User does not exist.');
    }

    const userReviews = await reviewsRepository.findUsersReviews(
      existingUser.id,
      sort,
      limit,
      offset
    );

    const totalItems = await reviewsRepository.countByUserId(existingUser.id);

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

  async deleteUser(userId: string, password: string): Promise<void> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User does not exist');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ValidationError('Password does not match');
    }

    await userRepository.deleteUserById(user.id);
  },
};
