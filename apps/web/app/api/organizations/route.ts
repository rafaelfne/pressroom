import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserTeam } from '@/lib/team';

const organizationCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  logo: z.string().url().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontFamily: z.string().optional(),
});

/**
 * POST /api/organizations — Create a new organization
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const team = await getUserTeam(session.user.id);
  if (!team) {
    return NextResponse.json({ error: 'No team found' }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = organizationCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Check slug uniqueness
    const existing = await prisma.organization.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'Organization slug already exists' }, { status: 409 });
    }

    const organization = await prisma.organization.create({
      data: {
        ...parsed.data,
        teamId: team.id,
      },
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/organizations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/organizations — List organizations the user has access to
 * (orgs where user owns templates or has been granted access to templates)
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const team = await getUserTeam(session.user.id);
  if (!team) {
    return NextResponse.json({ data: [] });
  }

  try {
    const organizations = await prisma.organization.findMany({
      where: { teamId: team.id },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { templates: { where: { deletedAt: null } } } },
      },
    });

    return NextResponse.json({ data: organizations });
  } catch (error) {
    console.error('[API] GET /api/organizations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
