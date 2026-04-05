import { z } from 'zod';

export const createSessionSchema = z.object({
  duration_minutes: z.number().int().positive('Duration must be greater than 0'),
  session_type: z
    .enum(['guided', 'unguided', 'breathing', 'body_scan', 'loving_kindness'])
    .default('guided'),
  lesson_id: z.string().uuid('Invalid lesson ID').optional(),
  mood_before: z.number().int().min(1).max(10).optional(),
  mood_after: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(1000, 'Notes must be under 1000 characters').optional(),
});
