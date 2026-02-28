import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { reviews } from './review.js';

export const reviewReply = pgTable('reviewReply', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  reviewId: uuid('review_id')
    .references(() => reviews.id, { onDelete: 'cascade' })
    .notNull(),
  replyText: varchar('reply_text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type NewReviewReplyInput = typeof reviewReply.$inferInsert;
export type ReviewReply = typeof reviewReply.$inferSelect;
