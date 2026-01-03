/**
 * validation schema for resource module
 * data taking from user/admin
 * url : url of the resource (video/playlist)
 * type of resource (video or playlist)
 * coding language used in tutorial
 * topic of the tutorial/playlist
 */

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

export type createResourceInput = z.infer<typeof createResourceSchema>;
