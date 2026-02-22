import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { templateUpdateSchema } from '@/lib/validation/template-schemas';
import type { Prisma } from '@prisma/client';

const templatePatchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  organizationId: z.string().nullable().optional(),
  styleGuideId: z.string().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const template = await prisma.template.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { ownerId: session.user.id },
          { accesses: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('[API] GET /api/templates/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body: unknown = await request.json();
    const parsed = templateUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await prisma.template.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { ownerId: session.user.id },
          { accesses: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const updateData: Prisma.TemplateUpdateInput = {};

    if (parsed.data.name !== undefined) {
      updateData.name = parsed.data.name;
    }

    if (parsed.data.description !== undefined) {
      updateData.description = parsed.data.description;
    }

    if (parsed.data.pages !== undefined) {
      // Multi-page templates store pages inside templateData
      updateData.templateData = { pages: parsed.data.pages } as unknown as Prisma.InputJsonValue;
      updateData.version = existing.version + 1;
    } else if (parsed.data.templateData !== undefined) {
      updateData.templateData = parsed.data.templateData as Prisma.InputJsonValue;
      updateData.version = existing.version + 1;
    }

    if (parsed.data.sampleData !== undefined) {
      updateData.sampleData = parsed.data.sampleData as Prisma.InputJsonValue;
    }

    if (parsed.data.pageConfig !== undefined) {
      updateData.pageConfig = parsed.data.pageConfig as Prisma.InputJsonValue;
    }

    if (parsed.data.tags !== undefined) {
      updateData.tags = parsed.data.tags;
    }

    const template = await prisma.template.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('[API] PUT /api/templates/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body: unknown = await request.json();
    const parsed = templatePatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await prisma.template.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { ownerId: session.user.id },
          { accesses: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const updateData: Prisma.TemplateUpdateInput = {};

    if (parsed.data.name !== undefined) {
      updateData.name = parsed.data.name;
    }

    if (parsed.data.description !== undefined) {
      updateData.description = parsed.data.description;
    }

    if (parsed.data.organizationId !== undefined) {
      if (parsed.data.organizationId === null) {
        updateData.organization = { disconnect: true };
      } else {
        updateData.organization = { connect: { id: parsed.data.organizationId } };
      }
    }

    if (parsed.data.styleGuideId !== undefined) {
      if (parsed.data.styleGuideId === null) {
        updateData.styleGuide = { disconnect: true };
      } else {
        updateData.styleGuide = { connect: { id: parsed.data.styleGuideId } };
      }
    }

    const template = await prisma.template.update({
      where: { id },
      data: updateData,
      include: {
        organization: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('[API] PATCH /api/templates/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.template.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { ownerId: session.user.id },
          { accesses: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Only the owner can delete
    if (existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the template owner can delete' }, { status: 403 });
    }

    await prisma.template.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Template deleted' });
  } catch (error) {
    console.error('[API] DELETE /api/templates/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
