import { z } from 'zod';

// Puck Data structure validation.
// Puck component items have dynamic shapes determined by registered components,
// so we validate the top-level structure (content array, root object, optional zones)
// while allowing component-specific fields to pass through.
export const puckDataSchema = z.object({
  content: z.array(z.record(z.string(), z.unknown())),
  root: z.record(z.string(), z.unknown()),
  zones: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))).optional(),
});

const pageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  content: puckDataSchema,
});

const pagesSchema = z.array(pageSchema).min(1);

const pageMarginsSchema = z.object({
  top: z.number().min(0).optional(),
  right: z.number().min(0).optional(),
  bottom: z.number().min(0).optional(),
  left: z.number().min(0).optional(),
});

const pageConfigSchema = z.object({
  paperSize: z.enum(['A4', 'Letter', 'Legal', 'A3', 'Custom']).optional(),
  orientation: z.enum(['portrait', 'landscape']).optional(),
  margins: pageMarginsSchema.optional(),
  customWidth: z.number().positive().optional(),
  customHeight: z.number().positive().optional(),
  // Keep backward compat with older format
  width: z.number().optional(),
  height: z.number().optional(),
  margin: z.object({
    top: z.number().optional(),
    right: z.number().optional(),
    bottom: z.number().optional(),
    left: z.number().optional(),
  }).optional(),
}).passthrough();

export const templateCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  templateData: puckDataSchema.optional(),
  pages: pagesSchema.optional(),
  sampleData: z.record(z.string(), z.unknown()).optional(),
  pageConfig: pageConfigSchema.optional(),
  tags: z.array(z.string()).optional(),
  organizationId: z.string().optional(),
});

export const templateUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  templateData: puckDataSchema.optional(),
  pages: pagesSchema.optional(),
  sampleData: z.record(z.string(), z.unknown()).optional(),
  pageConfig: pageConfigSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const templateListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type TemplateCreateInput = z.infer<typeof templateCreateSchema>;
export type TemplateUpdateInput = z.infer<typeof templateUpdateSchema>;
export type TemplateListQuery = z.infer<typeof templateListQuerySchema>;
export type TemplatePage = z.infer<typeof pageSchema>;
