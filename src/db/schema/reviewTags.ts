import { pgTable, uuid } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { reviews } from "./review.js";
import { tags } from "./tags.js";

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
