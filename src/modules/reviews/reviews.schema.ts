import z from 'zod';

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

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ResourceId = z.infer<typeof resourceIdSchema>;
