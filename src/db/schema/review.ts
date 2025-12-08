import { integer, uuid, text, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { resources } from './resources';
import * as t from 'drizzle-orm/pg-core';

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
    reviewText: text('review_text'), // review text is optional, here

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    t.uniqueIndex('unique_user_resource').on(table.userId, table.resourceId), // this will prevent duplicate reviews from one person

    t.index('idx_reviews_resource_id').on(table.resourceId),
  ]
);

// type for data comming out of db after querying
export type Reviews = typeof reviews.$inferSelect;

// type for data going inside database
export type NewReview = typeof reviews.$inferInsert;
