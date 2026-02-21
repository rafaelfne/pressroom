import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

const cloneSchema = z.object({
  organizationId: z.string().nullable().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body: unknown = await request.json().catch(() => ({}));
    const parsed = cloneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const original = await prisma.template.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { ownerId: session.user.id },
          { accesses: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!original) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const targetOrgId = parsed.data.organizationId !== undefined
      ? parsed.data.organizationId
      : original.organizationId;

    const clone = await prisma.template.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        templateData: original.templateData as Prisma.InputJsonValue,
        sampleData: original.sampleData
          ? (original.sampleData as Prisma.InputJsonValue)
          : undefined,
        pageConfig: original.pageConfig
          ? (original.pageConfig as Prisma.InputJsonValue)
          : undefined,
        tags: original.tags,
        organizationId: targetOrgId,
        ownerId: session.user.id,
        teamId: original.teamId,
        version: 1,
      },
      include: {
        organization: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(clone, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/templates/[id]/clone error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
