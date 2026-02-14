import { z } from 'zod';

export const templateUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
});

export type TemplateUpdateInput = z.infer<typeof templateUpdateSchema>;
