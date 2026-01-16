import z from 'zod';

const YT_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
];

export const createResourceSchema = z.object({
  url: z.url().refine(
    (u) => {
      const host = new URL(u).hostname;
      return YT_HOSTS.some((h) => host.includes(h));
    },
    { error: 'URL must be in valid format' }
  ),

  codeLang: z.enum(
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
  ),

  topic: z
    .string()
    .min(2, 'Topic of the video must be at least 2 characters')
    .max(100, 'Topic of the video must be at most 100 characters'),

  resourceType: z.enum(['video', 'playlist'], {
    error: 'Resource type must be either video or playlist',
  }),

  videoLang: z
    .string()
    .min(2, 'Language of the video must be at least 2 characters')
    .max(100, 'Language of the video must be at most 100 characters')
    .optional(),
});

export const getResourcesQuerySchema = z.object({
  search: z.string().optional(),
  codeLang: z
    .enum([
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
    ])
    .optional(),
  topic: z.string().optional(),
  type: z.enum(['video', 'playlist']).optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .optional()
    .default(1),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .optional()
    .default(10),
});

export const getResourceParamSchema = z.object({
  id: z.uuid({ error: 'invalid UUID format' }),
});

export type createResourceInput = z.infer<typeof createResourceSchema>;
export type getResourcesQuery = z.infer<typeof getResourcesQuerySchema>;
export type getResourceByIdParam = z.infer<typeof getResourceParamSchema>;
