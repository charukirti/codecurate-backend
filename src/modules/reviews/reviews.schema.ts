import z from 'zod';
import { sort } from '../../shared/schema';

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

/* Schema for param validation */

export const resourceIdSchema = z.object({
  resourceId: z.uuid({ error: 'Not a valid resourceId' }),
});

export const getReviewsQuerySchema = z.object({
  page: z.coerce.number().int().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  sort: sort.optional().default('newest'),
});

export const reviewIdParamSchema = z.object({
  reviewId: z.uuid({ error: 'This is not a valid review id' }),
  resourceId: z.uuid({ error: 'This is not a valid resource id' }),
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

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ResourceId = z.infer<typeof resourceIdSchema>;
export type ReviewsQueryInput = z.infer<typeof getReviewsQuerySchema>;

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewIdParams = z.infer<typeof reviewIdParamSchema>;
