import z from 'zod';

const YT_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
];

/* Validation schema for creating a submission */

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

/* Validation schema for rejecting a submission */
export const rejectSubmissionSchema = z.object({
  adminFeedback: z.string().max(1000).optional(),
});

/* Validation schema for parameters when accepting a submission */
export const acceptSubmissionParamSchema = z.object({
  submissionId: z.uuid({ message: 'Invalid submission ID format' }),
});

/* Validation schema for parameters when getting all submissions */
export const getAllSubmissionsQuerySchema = z.object({
  status: z
    .enum(['pending', 'accepted', 'rejected'], {
      error: 'Invalid status value',
    })
    .optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

/* Validation schema for accepting a submission */

export const acceptSubmissionSchema = z.object({
  videoLang: z
    .string()
    .min(2, 'Video language must be at least 2 characters')
    .max(100, 'Video language must be at most 100 characters'),
  codeLang: z
    .enum(
      [
        'HTML',
        'CSS',
        'JavaScript',
        'Tailwind',
        'React',
        'TypeScript',
        'Node.js',
        'Go',
        'Python',
        'Rust',
        'Java',
        'C',
        'C++',
        'C#',
      ],
      { error: 'Select correct coding language' }
    )
    .optional(),
  instructorName: z
    .string()
    .min(2, 'Instructor name must be at least 2 characters')
    .max(100, 'Instructor name must be at most 255 characters'),

  adminFeedback: z.string().max(1000).optional(),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type RejectSubmissionInput = z.infer<typeof rejectSubmissionSchema>;
export type AcceptSubmissionParamsInput = z.infer<
  typeof acceptSubmissionParamSchema
>;
export type GetAllSubmissionsQueryInput = z.infer<
  typeof getAllSubmissionsQuerySchema
>;
export type AcceptSubmissionInput = z.infer<typeof acceptSubmissionSchema>;
