import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email format');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[0-9]/, 'Password must contain number');

export const loginSchema = z.object({
  user: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password cannot be empty'),
  }),
});

export const registerSchema = z.object({
  user: z.object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username cannot exceed 20 characters'),
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const updateUserSchema = z.object({
  user: z.object({
    username: z.string().trim().min(3).max(20).optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    image: z.string().url().optional(),
    bio: z.string().optional(),
  }),
});
