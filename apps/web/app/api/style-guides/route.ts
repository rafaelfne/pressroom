import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { styleGuideCreateSchema } from '@/lib/validation/style-guide-schemas';
import { createStyleGuide, listStyleGuides } from '@/lib/style-guides';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = styleGuideCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const styleGuide = await createStyleGuide(parsed.data);

    return NextResponse.json(styleGuide, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/style-guides error:', error);
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
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Validation failed', details: { organizationId: ['Organization ID is required'] } },
        { status: 400 },
      );
    }

    const styleGuides = await listStyleGuides(organizationId);

    return NextResponse.json({ data: styleGuides });
  } catch (error) {
    console.error('[API] GET /api/style-guides error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
