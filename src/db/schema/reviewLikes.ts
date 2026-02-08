import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { reviews } from './review';

export const reviewLikes = pgTable(
  'reviewLikes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    reviewId: uuid('review_id')
      .references(() => reviews.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('unique_user_review_like').on(table.reviewId, table.userId),
  ]
);

export type NewReviewLike = typeof reviewLikes.$inferInsert;
export type ReviewLike = typeof reviewLikes.$inferSelect;
