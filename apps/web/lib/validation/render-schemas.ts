import { z } from 'zod';

// Header/footer zone content schemas (shared with template-schemas)
const zoneContentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    value: z.string(),
    fontSize: z.number().positive().optional(),
    fontWeight: z.enum(['normal', 'bold']).optional(),
    color: z.string().optional(),
  }),
  z.object({
    type: z.literal('image'),
    src: z.string(),
    alt: z.string().optional(),
    height: z.number().positive().optional(),
  }),
  z.object({
    type: z.literal('pageNumber'),
    format: z.enum(['{page}', '{page}/{total}', 'Page {page} of {total}']),
    fontSize: z.number().positive().optional(),
    fontWeight: z.enum(['normal', 'bold']).optional(),
    color: z.string().optional(),
  }),
  z.object({ type: z.literal('empty') }),
]);

const borderConfigSchema = z.object({
  enabled: z.boolean(),
  color: z.string().optional(),
  thickness: z.number().min(0).optional(),
});

const zonesSchema = z.object({
  left: zoneContentSchema,
  center: zoneContentSchema,
  right: zoneContentSchema,
});

const headerFooterConfigSchema = z.object({
  header: z.object({
    enabled: z.boolean(),
    height: z.number().positive(),
    zones: zonesSchema,
    bottomBorder: borderConfigSchema.optional(),
    backgroundColor: z.string().optional(),
  }).optional(),
  footer: z.object({
    enabled: z.boolean(),
    height: z.number().positive(),
    zones: zonesSchema,
    topBorder: borderConfigSchema.optional(),
    backgroundColor: z.string().optional(),
  }).optional(),
});

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
    headerTemplate: z.string().optional(),
    footerTemplate: z.string().optional(),
    displayHeaderFooter: z.boolean().optional(),
  }).optional(),
  headerFooterConfig: headerFooterConfigSchema.optional(),
}).refine(
  (data) => data.templateId || data.templateData || data.pages,
  { message: 'Either templateId, templateData, or pages must be provided' },
);

export type RenderRequest = z.infer<typeof renderRequestSchema>;
