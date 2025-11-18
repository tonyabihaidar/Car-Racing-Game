import { z } from 'zod';

export const SignUpSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(72)
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});
