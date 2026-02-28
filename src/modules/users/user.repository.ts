import { eq, or } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { CreateUserData, UserData, users } from '../../db/schema/users.js';
import { Transaction } from '../reviews/reviews.types.js';

export const userRepository = {
  async create(data: CreateUserData): Promise<UserData | undefined> {
    const [newUser] = await db.insert(users).values(data).returning();
    return newUser;
  },

  async update(data: Partial<CreateUserData>, userId: string) {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  },

  async updateRefreshToken(refreshToken: string, id: string) {
    return await db
      .update(users)
      .set({ refreshToken: refreshToken })
      .where(eq(users.id, id));
  },

  async clearRefreshToken(id: string) {
    return await db
      .update(users)
      .set({ refreshToken: null })
      .where(eq(users.id, id));
  },

  async findByEmailOrUsername(
    email: string,
    username: string
  ): Promise<UserData | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)));

    return user;
  },

  async findById(id: string): Promise<UserData | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));

    return user;
  },

  async findByEmail(email: string): Promise<UserData | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return user;
  },

  async findByUsername(username: string): Promise<UserData | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    return user;
  },

  async findUsernameById(id: string) {
    const [user] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, id));

    return user?.username;
  },

  async updateIsVerifiedById(tx: Transaction, userId: string) {
    await tx
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.id, userId));
  },

  async updatePasswordById(
    tx: Transaction,
    userId: string,
    hashedPassword: string
  ) {
    await tx
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
  },

  async deleteUserById(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  },
};
