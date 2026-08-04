import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(3, 'Name is required and must be at least 3 characters'),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});