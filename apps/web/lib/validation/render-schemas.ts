import { z } from 'zod';

export const renderRequestSchema = z.object({
  templateId: z.string().min(1).optional(),
  templateData: z.object({
    content: z.array(z.record(z.string(), z.unknown())),
    root: z.record(z.string(), z.unknown()),
    zones: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))).optional(),
  }).optional(),
  pages: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    content: z.object({
      content: z.array(z.record(z.string(), z.unknown())),
      root: z.record(z.string(), z.unknown()),
      zones: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))).optional(),
    }),
  })).min(1).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  format: z.enum(['pdf', 'html']).default('pdf'),
  pageConfig: z.object({
    format: z.enum(['A4', 'A3', 'Letter', 'Legal', 'Tabloid']).optional(),
    paperSize: z.enum(['A4', 'Letter', 'Legal', 'A3', 'Custom']).optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    margin: z.object({
      top: z.string().optional(),
      right: z.string().optional(),
      bottom: z.string().optional(),
      left: z.string().optional(),
    }).optional(),
    margins: z.object({
      top: z.number().min(0).optional(),
      right: z.number().min(0).optional(),
      bottom: z.number().min(0).optional(),
      left: z.number().min(0).optional(),
    }).optional(),
    customWidth: z.number().positive().optional(),
    customHeight: z.number().positive().optional(),
    orientation: z.enum(['portrait', 'landscape']).optional(),
  }).optional(),
}).refine(
  (data) => data.templateId || data.templateData || data.pages,
  { message: 'Either templateId, templateData, or pages must be provided' },
);

export type RenderRequest = z.infer<typeof renderRequestSchema>;
