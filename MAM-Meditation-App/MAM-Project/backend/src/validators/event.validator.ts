import { z } from 'zod';

export const registerEventParamsSchema = z.object({
  id: z.string().uuid('Invalid event ID'),
});
