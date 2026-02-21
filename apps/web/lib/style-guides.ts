import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { StyleGuideCreateInput, StyleGuideUpdateInput } from '@/lib/validation/style-guide-schemas';

/**
 * Creates a new style guide with optional tokens.
 * If isDefault is true, unsets any existing default for that organization.
 */
export async function createStyleGuide(data: StyleGuideCreateInput) {
  // If this is marked as default, unset any existing default in the org
  if (data.isDefault) {
    await prisma.styleGuide.updateMany({
      where: { organizationId: data.organizationId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const styleGuide = await prisma.styleGuide.create({
    data: {
      name: data.name,
      organizationId: data.organizationId,
      isDefault: data.isDefault ?? false,
      tokens: data.tokens
        ? {
            create: data.tokens.map((token, index) => ({
              name: token.name,
              label: token.label,
              category: token.category,
              cssProperty: token.cssProperty,
              value: token.value,
              sortOrder: token.sortOrder ?? index,
            })),
          }
        : undefined,
    },
    include: {
      tokens: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return styleGuide;
}

/**
 * Lists all style guides for an organization, including their tokens.
 */
export async function listStyleGuides(organizationId: string) {
  const styleGuides = await prisma.styleGuide.findMany({
    where: { organizationId },
    include: {
      tokens: {
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: [
      { isDefault: 'desc' }, // Default style guide first
      { createdAt: 'desc' },
    ],
  });

  return styleGuides;
}

/**
 * Gets a single style guide with its tokens.
 */
export async function getStyleGuide(id: string) {
  const styleGuide = await prisma.styleGuide.findUnique({
    where: { id },
    include: {
      tokens: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return styleGuide;
}

/**
 * Updates a style guide.
 * If tokens are provided, replaces all existing tokens (delete old + create new).
 * If isDefault is true, unsets any existing default for that organization.
 */
export async function updateStyleGuide(id: string, data: StyleGuideUpdateInput) {
  // Get the current style guide to know its organization
  const existing = await prisma.styleGuide.findUnique({
    where: { id },
  });

  if (!existing) {
    return null;
  }

  // If setting as default, unset any other defaults in the same org
  if (data.isDefault === true) {
    await prisma.styleGuide.updateMany({
      where: {
        organizationId: existing.organizationId,
        isDefault: true,
        id: { not: id },
      },
      data: { isDefault: false },
    });
  }

  const updateData: Prisma.StyleGuideUpdateInput = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.isDefault !== undefined) {
    updateData.isDefault = data.isDefault;
  }

  // If tokens are provided, replace them all
  if (data.tokens !== undefined) {
    updateData.tokens = {
      deleteMany: {},
      create: data.tokens.map((token, index) => ({
        name: token.name,
        label: token.label,
        category: token.category,
        cssProperty: token.cssProperty,
        value: token.value,
        sortOrder: token.sortOrder ?? index,
      })),
    };
  }

  const styleGuide = await prisma.styleGuide.update({
    where: { id },
    data: updateData,
    include: {
      tokens: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return styleGuide;
}

/**
 * Deletes a style guide (cascades to tokens via Prisma schema).
 * Returns the count of templates that were using it (their styleGuideId becomes null).
 */
export async function deleteStyleGuide(id: string) {
  // First, disconnect any templates using this style guide
  const affectedTemplates = await prisma.template.updateMany({
    where: { styleGuideId: id },
    data: { styleGuideId: null },
  });

  // Then delete the style guide (tokens cascade automatically)
  await prisma.styleGuide.delete({
    where: { id },
  });

  return affectedTemplates.count;
}

/**
 * Clones a style guide into a new organization.
 * Used for cross-org template cloning.
 */
export async function cloneStyleGuide(sourceId: string, targetOrgId: string) {
  const source = await prisma.styleGuide.findUnique({
    where: { id: sourceId },
    include: {
      tokens: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!source) {
    return null;
  }

  // Create a new style guide in the target organization
  const cloned = await prisma.styleGuide.create({
    data: {
      name: source.name,
      organizationId: targetOrgId,
      isDefault: false, // Never clone as default
      tokens: {
        create: source.tokens.map((token) => ({
          name: token.name,
          label: token.label,
          category: token.category,
          cssProperty: token.cssProperty,
          value: token.value,
          sortOrder: token.sortOrder,
        })),
      },
    },
    include: {
      tokens: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return cloned;
}
