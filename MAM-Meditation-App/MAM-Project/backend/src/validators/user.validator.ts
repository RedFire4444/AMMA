import { z } from 'zod';

export const updateUserSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  avatar_url: z.string().url().max(2048).optional(),
  date_of_birth: z.string().date().optional(),
  meditation_goal_minutes: z.number().int().min(1).max(480).optional(),
  preferred_language: z.string().max(10).optional(),
  notification_enabled: z.boolean().optional(),
}).strict();

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});
