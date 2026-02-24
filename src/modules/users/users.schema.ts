/** Schema for update user */

import z from 'zod';
import { sort } from '../../shared/schema';

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

export const usersReviewsParamSchema = z.object({
  username: z
    .string()
    .min(5, 'Username must be at least 5 characters')
    .max(15, 'Username must not exceed 15 characters'),
});

export const getUserReviewsQuerySchema = z.object({
  page: z.coerce.number().int().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  sort: sort.optional().default('newest'),
});

export const deleteUserSchema = z.object({
  password: z.string().min(1, 'password is required'),
  confirmDeletion: z.boolean().refine((val) => val === true, {
    error: 'You must confirm account deletion',
  }),
});

export type UpdateUserInput = z.infer<typeof updateUser>;
export type UsersReviewsParam = z.infer<typeof usersReviewsParamSchema>;
export type GetUserReviewsQuery = z.infer<typeof getUserReviewsQuerySchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
