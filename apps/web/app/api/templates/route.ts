import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { templateCreateSchema, templateListQuerySchema } from '@/lib/validation/template-schemas';
import type { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = templateCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const template = await prisma.template.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        templateData: (parsed.data.pages
          ? { pages: parsed.data.pages }
          : parsed.data.templateData ?? {}) as Prisma.InputJsonValue,
        sampleData: parsed.data.sampleData ? (parsed.data.sampleData as Prisma.InputJsonValue) : undefined,
        pageConfig: parsed.data.pageConfig ? (parsed.data.pageConfig as Prisma.InputJsonValue) : undefined,
        tags: parsed.data.tags ?? [],
        organizationId: parsed.data.organizationId ?? null,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/templates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    const parsed = templateListQuerySchema.safeParse(queryObj);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { page, limit, search, tags, sortBy, sortOrder } = parsed.data;

    // Build the AND conditions array
    const andConditions: Prisma.TemplateWhereInput[] = [];

    // Add search filter if provided
    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Add tags filter if provided
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        andConditions.push({ tags: { hasSome: tagList } });
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

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          organization: {
            select: { id: true, name: true },
          },
          owner: {
            select: { id: true, name: true, username: true },
          },
        },
      }),
      prisma.template.count({ where }),
    ]);

    return NextResponse.json({
      data: templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[API] GET /api/templates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
