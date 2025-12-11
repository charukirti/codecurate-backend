import { eq, or } from 'drizzle-orm';
import { db } from '../../db';
import { User, users } from '../../db/schema';
import { SignUpInput } from './auth.schema';
import { ConflictError, InternalError } from '../../shared/errors';
import bcrypt from 'bcryptjs';

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
};
