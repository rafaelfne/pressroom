import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    const existing = await prisma.template.findFirst({
      where: {
        id,
        deletedAt: null,
        organizationId: user?.organizationId ?? null,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const duplicate = await prisma.template.create({
      data: {
        name: `${existing.name} (Copy)`,
        description: existing.description,
        templateData: existing.templateData as Prisma.InputJsonValue,
        sampleData: existing.sampleData ? (existing.sampleData as Prisma.InputJsonValue) : undefined,
        pageConfig: existing.pageConfig ? (existing.pageConfig as Prisma.InputJsonValue) : undefined,
        tags: existing.tags,
        organizationId: existing.organizationId,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/templates/[id]/duplicate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
