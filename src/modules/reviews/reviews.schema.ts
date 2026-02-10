import z from 'zod';
import { sort } from '../../shared/schema';

/* ---------- Schema for request body ------------ */

export const createReviewSchema = z.object({
  reviewText: z
    .string()
    .min(10, { error: 'Review text must be at least 10 characters.' })
    .max(500, { error: 'Review text must be at most 500 characters' })
    .optional(),

  rating: z
    .number({
      error: (iss) =>
        iss.input === undefined
          ? 'Field is required.'
          : 'Rating must be between 1 to 10 stars.',
    })
    .min(1)
    .max(10),

  tagIds: z
    .array(z.string(), {
      error: (iss) =>
        iss.input === undefined
          ? 'Field is required'
          : 'Select at least 2 - 3 tags',
    })
    .min(2)
    .max(3),
});

export const updateReviewSchema = z.object({
  reviewText: z
    .string()
    .min(10, { error: 'Review text must be at least 10 characters.' })
    .max(500, { error: 'Review text must be at most 500 characters' })
    .optional(),

  rating: z
    .number({
      error: (iss) =>
        iss.input === undefined
          ? 'Field is required.'
          : 'Rating must be between 1 to 10 stars.',
    })
    .min(1)
    .max(10)
    .optional(),

  tagIds: z
    .array(z.string(), {
      error: (iss) =>
        iss.input === undefined
          ? 'Field is required'
          : 'Select at least 2 - 3 tags',
    })
    .min(2)
    .max(3)
    .optional(),
});

export const addReplySchema = z.object({
  replyText: z
    .string()
    .min(10, { error: 'Review text must be at least 10 characters.' })
    .max(500, { error: 'Review text must be at most 500 characters' }),
});

/* ---------- Schema for request params ------------ */

export const resourceIdParamSchema = z.object({
  resourceId: z.uuid({ error: 'Not a valid resourceId' }),
});

export const reviewAndResourceParamsSchema = z.object({
  reviewId: z.uuid({ error: 'This is not a valid review id' }),
  resourceId: z.uuid({ error: 'This is not a valid resource id' }),
});

export const reviewIdParamSchema = z.object({
  reviewId: z.uuid({ error: 'This is not a valid review id' }),
});

export const reviewAndReplyIdParamSchema = z.object({
  reviewId: z.uuid({ error: 'This is not a valid review id' }),
  replyId: z.uuid({ error: 'This is not a valid reply id' }),
});

/* ---------- Schema for request query ------------ */

export const getReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  sort: sort.optional().default('newest'),
});

export const getRepliesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type AddReplyInput = z.infer<typeof addReplySchema>;

export type ReviewAndResourceParams = z.infer<
  typeof reviewAndResourceParamsSchema
>;
export type ReviewIdParams = z.infer<typeof reviewIdParamSchema>;
export type ReviewAndReplyIdParams = z.infer<
  typeof reviewAndReplyIdParamSchema
>;
export type ResourceIdParams = z.infer<typeof resourceIdParamSchema>;

export type ReviewsQueryInput = z.infer<typeof getReviewsQuerySchema>;
export type ReplyQueryInput = z.infer<typeof getRepliesQuerySchema>;
