import { and, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { verificationTokens } from '../../db/schema/verificationTokens.js';
import { Transaction } from '../reviews/reviews.types.js';

export const authRepository = {
  async createToken(data: {
    userId: string;
    hashedToken: string;
    tokenType: 'email_verification' | 'password_reset';
    expiresAt: Date;
  }) {
    const { userId, hashedToken, tokenType, expiresAt } = data;
    await db.insert(verificationTokens).values({
      userId: userId,
      token: hashedToken,
      tokenType: tokenType,
      expiresAt: expiresAt,
    });
  },

  async findByTokenAndType(data: {
    hashedToken: string;
    tokenType: 'email_verification' | 'password_reset';
  }) {
    const { hashedToken, tokenType } = data;
    const [token] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.token, hashedToken),
          eq(verificationTokens.tokenType, tokenType)
        )
      );

    return token;
  },

  async deleteTokenById(tx: Transaction, id: string) {
    await tx.delete(verificationTokens).where(eq(verificationTokens.id, id));
  },
};
