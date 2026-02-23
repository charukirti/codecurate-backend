import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const tokenTypesEnum = pgEnum('token_type', [
  'email_verification',
  'password_reset',
]);
export const verificationTokens = pgTable('verificationTokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: text('token').unique().notNull(),
  tokenType: tokenTypesEnum('token_type').notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// type for data coming out of database after querying
export type VerificationTokensOutput = typeof verificationTokens.$inferSelect;

// type for data going inside database
export type CreateVerificationTokens = typeof verificationTokens.$inferInsert;
