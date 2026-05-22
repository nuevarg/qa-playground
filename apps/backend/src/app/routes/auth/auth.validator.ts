import { z } from 'zod';

export const loginSchema = z.object({
  user: z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email format'),

    password: z.string().min(1, 'Password cannot be empty'),
  }),
});

export const registerSchema = z.object({
  user: z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username cannot exceed 20 characters'),

    email: z.string().min(1, 'Email is required').email('Invalid email format'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letter')
      .regex(/[0-9]/, 'Password must contain number'),
  }),
});
