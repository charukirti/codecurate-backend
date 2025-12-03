import { pgTable, uuid } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { reviews } from "./review";
import { tags } from "./tags";

export const reviewTags = pgTable(
  "review_tags",
  {
    reviewId: uuid("review_id")
      .references(() => reviews.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [t.primaryKey({ columns: [table.reviewId, table.tagId] })]
);

// type for data coming out of database after querying
export type ReviewTag = typeof reviewTags.$inferSelect;

// type for data going inside database
export type NewReviewTag = typeof reviewTags.$inferInsert;
