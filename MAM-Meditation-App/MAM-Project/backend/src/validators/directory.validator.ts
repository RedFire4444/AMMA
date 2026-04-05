import { z } from 'zod';

export const contentIdParamSchema = z.object({
  id: z.string().uuid('Invalid content ID format'),
});
