'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { DEFAULT_SAMPLE_DATA } from './default-sample-data';

type GetTemplatesParams = {
  search?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

type GetTemplatesResult = {
  templates: Array<{
    id: string;
    name: string;
    description: string | null;
    tags: string[];
    updatedAt: Date;
    templateData: unknown;
    version: number;
  }>;
  totalCount: number;
  totalPages: number;
};

export async function createTemplate(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized: Must be logged in to create a template');
  }

  const name = formData.get('name');

  if (!name || typeof name !== 'string') {
    throw new Error('Failed to create template: name is required');
  }

  const template = await prisma.template.create({
    data: {
      name,
      templateData: {},
      sampleData: DEFAULT_SAMPLE_DATA as unknown as Prisma.InputJsonValue,
      pageConfig: {},
      version: 1,
      tags: [],
      ownerId: session.user.id,
    },
  });

  redirect(`/studio/${template.id}`);
}

export async function deleteTemplate(id: string) {
  await prisma.template.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  revalidatePath('/templates');
}

export async function duplicateTemplate(id: string) {
  const original = await prisma.template.findUnique({
    where: { id },
  });

  if (!original) {
    throw new Error(`Template not found: ${id}`);
  }

  await prisma.template.create({
    data: {
      name: `Copy of ${original.name}`,
      description: original.description,
      templateData: original.templateData as Prisma.InputJsonValue,
      sampleData: original.sampleData
        ? (original.sampleData as Prisma.InputJsonValue)
        : undefined,
      pageConfig: original.pageConfig
        ? (original.pageConfig as Prisma.InputJsonValue)
        : undefined,
      tags: original.tags,
      version: 1,
    },
  });

  revalidatePath('/templates');
}

export async function getTemplates(
  params: GetTemplatesParams = {},
): Promise<GetTemplatesResult> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized: Must be logged in to view templates');
  }

  const {
    search,
    tags,
    page = 1,
    limit = 12,
    sortBy = 'updatedAt',
    sortOrder = 'desc',
  } = params;

  // Build the AND conditions array
  const andConditions: Prisma.TemplateWhereInput[] = [];

  // Add search filter if provided
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    });
  }

  // Add tags filter if provided
  if (tags) {
    const tagList = tags.split(',').map((tag) => tag.trim());
    if (tagList.length > 0) {
      andConditions.push({
        tags: { hasSome: tagList },
      });
    }
  }

  // Build final where clause with access control
  const where: Prisma.TemplateWhereInput = {
    deletedAt: null,
    OR: [
      { ownerId: session.user.id },
      { accesses: { some: { userId: session.user.id } } },
    ],
    ...(andConditions.length > 0 && { AND: andConditions }),
  };

  const orderBy = {
    [sortBy]: sortOrder,
  };

  const [templates, totalCount] = await Promise.all([
    prisma.template.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
        updatedAt: true,
        templateData: true,
        version: true,
      },
    }),
    prisma.template.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    templates,
    totalCount,
    totalPages,
  };
}
