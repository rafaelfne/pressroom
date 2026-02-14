import { z } from 'zod';

// Puck Data structure validation
const puckDataSchema = z.object({
  content: z.array(z.record(z.string(), z.unknown())),
  root: z.record(z.string(), z.unknown()),
  zones: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))).optional(),
});

export const templateUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  content: puckDataSchema.optional(),
});

export type TemplateUpdateInput = z.infer<typeof templateUpdateSchema>;
