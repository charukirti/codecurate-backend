import {
  integer,
  uuid,
  text,
  pgTable,
  timestamp,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { resources } from './resources';
import { sql } from 'drizzle-orm';

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    resourceId: uuid('resource_id')
      .references(() => resources.id, { onDelete: 'cascade' })
      .notNull(),

    rating: integer('rating').notNull(),
    reviewText: text('review_text'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('unique_user_resource').on(table.userId, table.resourceId),
    index('idx_reviews_resource_id').on(table.resourceId),
    index('idx_reviews_user_id').on(table.userId),
    check('rating_range', sql`rating >= 1 AND rating <= 10`),
  ]
);

// type for data comming out of db after querying
export type Reviews = typeof reviews.$inferSelect;

// type for data going inside database
export type NewReview = typeof reviews.$inferInsert;
