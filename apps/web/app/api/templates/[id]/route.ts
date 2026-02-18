import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { templateUpdateSchema } from '@/lib/validation/template-schemas';
import type { Prisma } from '@prisma/client';

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

    console.log('[API] GET template, headerFooterConfig exists:', !!template.headerFooterConfig);
    if (template.headerFooterConfig) {
      console.log('[API] headerFooterConfig value:', JSON.stringify(template.headerFooterConfig));
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
    console.log('[API] PUT /api/templates/[id] body keys:', Object.keys(body as Record<string, unknown>));
    if ((body as Record<string, unknown>).headerFooterConfig) {
      console.log('[API] headerFooterConfig received:', JSON.stringify((body as Record<string, unknown>).headerFooterConfig));
    }
    const parsed = templateUpdateSchema.safeParse(body);

    if (!parsed.success) {
      console.log('[API] Validation failed:', JSON.stringify(parsed.error.flatten()));
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    console.log('[API] Parsed data keys:', Object.keys(parsed.data));
    if (parsed.data.headerFooterConfig) {
      console.log('[API] headerFooterConfig after validation:', JSON.stringify(parsed.data.headerFooterConfig));
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

    if (parsed.data.headerFooterConfig !== undefined) {
      updateData.headerFooterConfig = parsed.data.headerFooterConfig as Prisma.InputJsonValue;
      console.log('[API] Adding headerFooterConfig to updateData');
    }

    if (parsed.data.tags !== undefined) {
      updateData.tags = parsed.data.tags;
    }

    console.log('[API] updateData keys:', Object.keys(updateData));

    const template = await prisma.template.update({
      where: { id },
      data: updateData,
    });

    console.log('[API] Template updated, headerFooterConfig saved:', !!template.headerFooterConfig);

    return NextResponse.json(template);
  } catch (error) {
    console.error('[API] PUT /api/templates/[id] error:', error);
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
