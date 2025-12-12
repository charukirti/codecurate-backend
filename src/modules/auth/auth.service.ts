import { eq, or } from 'drizzle-orm';
import { db } from '../../db';
import { User, users } from '../../db/schema';
import { SignInInput, SignUpInput } from './auth.schema';
import {
  ConflictError,
  InternalError,
  InvalidCredentialError,
} from '../../shared/errors';
import bcrypt from 'bcryptjs';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../utils/generateToken';

export const authService = {
  /**
   * Creates new user with hashed password
   * @param data accepts user data
   * @throws {ConflictError} if email or username already exists/taken
   * @throws {InternalError} if DB operation fails
   * @returns userData excluding password
   */

  async signUp(data: SignUpInput): Promise<Omit<User, 'password'>> {
    const { name, username, email, password } = data;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)));

    if (existingUser) {
      throw new ConflictError('User already exists!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        username,
        email,
        password: hashedPassword,
      })
      .returning();

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
    userData: Omit<User, 'password'>;
  }> {
    const { email, password } = data;

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      throw new InvalidCredentialError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialError('Invalid username or password');
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await db
      .update(users)
      .set({ refreshToken: refreshToken })
      .where(eq(users.id, user.id));

    const { password: _, ...userData } = user;

    return { accessToken, refreshToken, userData };
  },
};
