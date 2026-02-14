import { z } from 'zod';

// Puck Data structure validation.
// Puck component items have dynamic shapes determined by registered components,
// so we validate the top-level structure (content array, root object, optional zones)
// while allowing component-specific fields to pass through.
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
