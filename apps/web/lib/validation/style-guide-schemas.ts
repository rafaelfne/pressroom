import { z } from 'zod';

// Regex for kebab-case validation (e.g. "text-primary", "bg-primary-500")
const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Single style token validation
export const styleTokenSchema = z.object({
  name: z
    .string()
    .min(1, 'Token name is required')
    .regex(kebabCaseRegex, 'Token name must be in kebab-case (e.g. "text-primary")'),
  label: z.string().min(1, 'Token label is required'),
  category: z.enum(['color', 'typography', 'spacing', 'background', 'border'], {
    error: 'Invalid token category',
  }),
  cssProperty: z.string().min(1, 'CSS property is required'),
  value: z.string().min(1, 'Token value is required'),
  sortOrder: z.number().int().min(0).default(0),
});

// StyleGuide create schema
export const styleGuideCreateSchema = z.object({
  name: z.string().min(1, 'Style guide name is required'),
  organizationId: z.string().min(1, 'Organization ID is required'),
  isDefault: z.boolean().optional().default(false),
  tokens: z.array(styleTokenSchema).optional(),
});

// StyleGuide update schema (all fields optional except validation when present)
export const styleGuideUpdateSchema = z.object({
  name: z.string().min(1, 'Style guide name is required').optional(),
  isDefault: z.boolean().optional(),
  tokens: z.array(styleTokenSchema).optional(),
});

// Inferred TypeScript types
export type StyleTokenInput = z.infer<typeof styleTokenSchema>;
export type StyleGuideCreateInput = z.infer<typeof styleGuideCreateSchema>;
export type StyleGuideUpdateInput = z.infer<typeof styleGuideUpdateSchema>;
