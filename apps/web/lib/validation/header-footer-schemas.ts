import { z } from 'zod';

/**
 * Shared Zod schemas for header/footer configuration.
 * Used by both template-schemas.ts and render-schemas.ts.
 */

/** Schema for zone content (text, image, pageNumber, or empty) */
export const zoneContentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    value: z.string(),
    fontSize: z.number().positive().optional(),
    fontWeight: z.enum(['normal', 'bold']).optional(),
    color: z.string().optional(),
  }).passthrough(),
  z.object({
    type: z.literal('image'),
    src: z.string(),
    alt: z.string().optional(),
    height: z.number().positive().optional(),
  }).passthrough(),
  z.object({
    type: z.literal('pageNumber'),
    format: z.enum(['{page}', '{page}/{total}', 'Page {page} of {total}']),
    fontSize: z.number().positive().optional(),
    fontWeight: z.enum(['normal', 'bold']).optional(),
    color: z.string().optional(),
  }).passthrough(),
  z.object({ type: z.literal('empty') }).passthrough(),
]);

/** Schema for border configuration */
export const borderConfigSchema = z.object({
  enabled: z.boolean(),
  color: z.string().optional(),
  thickness: z.number().min(0).optional(),
}).passthrough();

/** Schema for header/footer zones (left, center, right) */
export const zonesSchema = z.object({
  left: zoneContentSchema,
  center: zoneContentSchema,
  right: zoneContentSchema,
}).passthrough();

/** Schema for header configuration */
export const headerConfigSchema = z.object({
  enabled: z.boolean(),
  height: z.number().positive(),
  zones: zonesSchema,
  bottomBorder: borderConfigSchema.optional(),
  backgroundColor: z.string().optional(),
}).passthrough();

/** Schema for footer configuration */
export const footerConfigSchema = z.object({
  enabled: z.boolean(),
  height: z.number().positive(),
  zones: zonesSchema,
  topBorder: borderConfigSchema.optional(),
  backgroundColor: z.string().optional(),
}).passthrough();

/** Schema for combined header/footer configuration */
export const headerFooterConfigSchema = z.object({
  header: headerConfigSchema.optional(),
  footer: footerConfigSchema.optional(),
}).passthrough();
