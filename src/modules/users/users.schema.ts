/** Schema for update user */

import z from 'zod';

export const updateUser = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(255, 'Name must not exceed 255 characters')
      .optional(),
    username: z
      .string()
      .min(5, 'Username must be at least 5 characters')
      .max(15, 'Username must not exceed 15 characters')
      .optional(),
  })
  .refine((data) => data.name || data.username, {
    error: 'At least one field (username or password) must be provided',
  });

export type UpdateUserInput = z.infer<typeof updateUser>;
