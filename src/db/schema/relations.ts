import { relations } from 'drizzle-orm';
import { resources } from './resources';
import { reviews } from './review';
import { users } from './users';
import { tags } from './tags';
import { reviewTags } from './reviewTags';
import { reviewLikes } from './reviewLikes';
import { reviewReply } from './reviewReply';

export const resourcesRelations = relations(resources, ({ many }) => ({
  reviews: many(reviews), // one resource can have multiple reviews
}));

export const userRelations = relations(users, ({ many }) => ({
  reviews: many(reviews), // one user can have many reviews
  reviewLikes: many(reviewLikes),
  reviewReply: many(reviewReply),
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
  reviewLikes: many(reviewLikes),
  reviewReply: many(reviewReply),
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

export const reviewLikesRelation = relations(reviewLikes, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewLikes.reviewId],
    references: [reviews.id],
  }),

  user: one(users, {
    fields: [reviewLikes.userId],
    references: [users.id],
  }),
}));

export const reviewReplyRelation = relations(reviewReply, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewReply.reviewId],
    references: [reviews.id],
  }),

  user: one(users, {
    fields: [reviewReply.userId],
    references: [users.id],
  }),
}));
