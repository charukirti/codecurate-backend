import { relations } from 'drizzle-orm';
import { resources } from './resources.js';
import { reviews } from './review.js';
import { users } from './users.js';
import { tags } from './tags.js';
import { reviewTags } from './reviewTags.js';
import { reviewLikes } from './reviewLikes.js';
import { reviewReply } from './reviewReply.js';
import { submissions } from './submissions.js';

export const resourcesRelations = relations(resources, ({ many }) => ({
  reviews: many(reviews), // one resource can have multiple reviews
}));

export const userRelations = relations(users, ({ many }) => ({
  reviews: many(reviews), // one user can have many reviews
  reviewLikes: many(reviewLikes),
  reviewReply: many(reviewReply),
  submissions: many(submissions, {
    relationName: 'submitter',
  }),
  reviewedSubmissions: many(submissions, {
    relationName: 'reviewer',
  }),
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

export const submissionsRelations = relations(submissions, ({ one }) => ({
  submitter: one(users, {
    fields: [submissions.userId],
    references: [users.id],
    relationName: 'submitter',
  }),
  reviewer: one(users, {
    fields: [submissions.reviewedBy],
    references: [users.id],
    relationName: 'reviewer',
  }),
}));
