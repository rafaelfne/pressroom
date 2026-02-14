import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { templateUpdateSchema } from '@/lib/validation/template-schemas';
import type { Prisma } from '@prisma/client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const template = await prisma.template.findUnique({
      where: { id },
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
  const { id } = await params;

  try {
    const body: unknown = await request.json();
    const parsed = templateUpdateSchema.safeParse(body);

    if (!parsed.success) {
      console.error('[API] PUT /api/templates/[id] validation error:', parsed.error.flatten());
      return NextResponse.json(
        { error: 'Validation failed' },
        { status: 400 },
      );
    }

    const existing = await prisma.template.findUnique({
      where: { id },
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
    
    if (parsed.data.content !== undefined) {
      updateData.content = parsed.data.content as Prisma.InputJsonValue;
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
