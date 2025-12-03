import { relations } from "drizzle-orm";
import { resources } from "./resources";
import { reviews } from "./review";
import { users } from "./users";
import { tags } from "./tags";
import { reviewTags } from "./reviewTags";

export const resourcesRelations = relations(resources, ({ many }) => ({
  reviews: many(reviews), // one resource can have multiple reviews
}));

export const userRelations = relations(users, ({ many }) => ({
  reviews: many(reviews), // one user can have many reviews
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  resource: one(resources, {
    fields: [reviews.resourceId],
    references: [resources.id],
  }), // review belongs to one resource
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id], // review belongs to one user (i.e who wrote it)
  }),
  reviewTags: many(reviewTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  reviewTags: many(reviewTags), // tag can be attached to many reviews
}));

export const reviewTagsRelations = relations(reviewTags, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewTags.reviewId],
    references: [reviews.id],
  }),
  tag: one(tags, {
    fields: [reviewTags.tagId],
    references: [tags.id],
  }),
}));
