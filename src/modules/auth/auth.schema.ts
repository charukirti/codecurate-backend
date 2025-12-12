import z from 'zod';

/**
 * Sign up schema
 * validates the payload for creating new user account
 */

export const signUpSchema = z.object({
  name: z.string().min(5, 'Name must be at least 5 characters'),
  username: z
    .string()
    .min(5, 'Username must be at least 5 characters')
    .max(15, 'Username must be at least 15 characters'),
  email: z.email({
    error: (issue) =>
      issue.input === undefined ? 'Email is required' : 'Invalid email format',
  }),
  password: z
    .string()
    .min(7, 'Password must be at least 7 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  isAdmin: z.boolean().default(false).optional(),
});

/**
 * Sign in schema
 * validates the payload for signing user back
 */

export const signInSchema = z.object({
  email: z.email({
    error: (issue) =>
      issue.input === undefined ? 'Email is required' : 'Invalid email address',
  }),

  password: z.string().min(1, 'password is required!'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
