import z from 'zod';

const YT_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
];

export const createSubmissionSchema = z.object({
  youtubeURL: z.url().refine(
    (u) => {
      const host = new URL(u).hostname;
      return YT_HOSTS.some((h) => host.includes(h));
    },
    { error: 'URL must be in valid format' }
  ),
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters long')
    .max(255),
  description: z.string().max(1000).optional(),
  topic: z
    .string()
    .min(2, 'Topic of the video must be at least 2 characters')
    .max(100, 'Topic of the video must be at most 100 characters'),
});

export const reviewSubmissionSchema = z.object({
  adminFeedback: z.string().max(1000).optional(),
});

export const reviewSubmissionParamsSchema = z.object({
  submissionId: z.uuid({ message: 'Invalid submission ID format' }),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
export type ReviewSubmissionParamsInput = z.infer<
  typeof reviewSubmissionParamsSchema
>;
