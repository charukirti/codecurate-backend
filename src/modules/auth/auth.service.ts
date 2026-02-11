import { UserData } from '../../db/schema';
import { SignInInput, SignUpInput } from './auth.schema';
import {
  ConflictError,
  InternalError,
  InvalidCredentialError,
  NotFoundError,
  UnauthorizedError,
} from '../../shared/errors';
import bcrypt from 'bcryptjs';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../utils/generateToken';
import jwt from 'jsonwebtoken';
import authConfig from '../../config/auth.config';
import { userRepository } from '../users/user.repository';

export const authService = {
  /**
   * Creates new user with hashed password
   * @param data accepts user data
   * @throws {ConflictError} if email or username already exists/taken
   * @throws {InternalError} if DB operation fails
   * @returns userData excluding password
   */

  async signUp(data: SignUpInput): Promise<Omit<UserData, 'password'>> {
    const { name, username, email, password } = data;

    const existingUser = await userRepository.findByEmailOrUsername(
      email,
      username
    );

    if (existingUser) {
      throw new ConflictError('User already exists!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userRepository.create({
      name,
      username,
      email,
      password: hashedPassword,
      role: 'user',
    });

    if (!newUser) {
      throw new InternalError('Failed to register user');
    }

    const { password: _, ...userData } = newUser;

    return userData;
  },

  /**
   * Authenticates user and generates token
   * @param data - Accepts user credentials (email, password)
   * @throws {InvalidCredentialError} if credentials are invalid
   * @returns Access token, refresh token, and user data
   */

  async signIn(data: SignInInput): Promise<{
    accessToken: string;
    refreshToken: string;
    userData: Omit<UserData, 'password' | 'refreshToken'>;
  }> {
    const { email, password } = data;

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialError('Invalid email or password');
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await userRepository.updateRefreshToken(refreshToken, user.id);

    const {
      password: _password,
      refreshToken: _refreshToken,
      ...userData
    } = user;

    return { accessToken, refreshToken, userData };
  },

  /**
   * Signs out user by clearing refresh token
   * @param userId - User ID from JWT
   */

  async signOut(userId: string): Promise<void> {
    await userRepository.clearRefreshToken(userId);
  },

  /**
   * Refreshes access token using refresh token
   * @param refreshToken - Refresh token from cookie
   * @returns New access token and refresh token
   * @throws {UnauthorizedError} if token is invalid
   * @throws {NotFoundError} if user does not exists
   */

  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const decode = jwt.verify(refreshToken, authConfig.refresh_secret) as {
      userId: string;
    };

    const userId = decode.userId;

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User does not exists');
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const accessToken = generateAccessToken(user.id, user.role);

    const newRefreshToken = generateRefreshToken(user.id);

    await userRepository.updateRefreshToken(newRefreshToken, user.id);

    return { accessToken, refreshToken: newRefreshToken };
  },
};
