import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { styleGuideUpdateSchema } from '@/lib/validation/style-guide-schemas';
import { getStyleGuide, updateStyleGuide, deleteStyleGuide } from '@/lib/style-guides';

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
    const styleGuide = await getStyleGuide(id);

    if (!styleGuide) {
      return NextResponse.json({ error: 'Style guide not found' }, { status: 404 });
    }

    return NextResponse.json(styleGuide);
  } catch (error) {
    console.error('[API] GET /api/style-guides/[id] error:', error);
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
    const parsed = styleGuideUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const styleGuide = await updateStyleGuide(id, parsed.data);

    if (!styleGuide) {
      return NextResponse.json({ error: 'Style guide not found' }, { status: 404 });
    }

    return NextResponse.json(styleGuide);
  } catch (error) {
    console.error('[API] PUT /api/style-guides/[id] error:', error);
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
    const affectedTemplates = await deleteStyleGuide(id);

    return NextResponse.json({
      message: 'Style guide deleted',
      affectedTemplates,
    });
  } catch (error) {
    console.error('[API] DELETE /api/style-guides/[id] error:', error);
    // Handle case where style guide doesn't exist
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Style guide not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
