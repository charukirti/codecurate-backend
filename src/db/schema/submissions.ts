import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const submissionStatusEnum = pgEnum('submission_status', [
  'pending',
  'accepted',
  'rejected',
]);

export const submissions = pgTable(
  'submissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    youtubeURL: varchar('youtube_url', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    topic: varchar('topic', { length: 100 }).notNull(),
    status: submissionStatusEnum('status').default('pending').notNull(),
    adminFeedback: text('admin_feedback'),
    reviewedBy: uuid('reviewed_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_submissions_user_id').on(table.userId),
    index('idx_submissions_status').on(table.status),
    index('idx_submissions_reviewed_by').on(table.reviewedBy),
  ]
);

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
