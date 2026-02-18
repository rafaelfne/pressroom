import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const shareSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

/**
 * POST /api/templates/[id]/share — Grant access to a user by username
 */
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
    // Only the owner can share
    const template = await prisma.template.findFirst({
      where: { id, deletedAt: null, ownerId: session.user.id },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found or you are not the owner' }, { status: 404 });
    }

    const body: unknown = await request.json();
    const parsed = shareSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { username } = parsed.data;

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true, name: true, username: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Cannot share with yourself
    if (targetUser.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot share with yourself' }, { status: 400 });
    }

    // Check if access already exists
    const existingAccess = await prisma.templateAccess.findUnique({
      where: { templateId_userId: { templateId: id, userId: targetUser.id } },
    });

    if (existingAccess) {
      return NextResponse.json({ error: 'User already has access' }, { status: 409 });
    }

    // Grant access
    const access = await prisma.templateAccess.create({
      data: {
        templateId: id,
        userId: targetUser.id,
        grantedBy: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, username: true } },
      },
    });

    return NextResponse.json(access, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/templates/[id]/share error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/templates/[id]/share — List users with access to a template
 */
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
    // Check the user has access to this template
    const template = await prisma.template.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { ownerId: session.user.id },
          { accesses: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, username: true } },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const accesses = await prisma.templateAccess.findMany({
      where: { templateId: id },
      include: {
        user: { select: { id: true, name: true, username: true } },
      },
      orderBy: { grantedAt: 'asc' },
    });

    return NextResponse.json({
      owner: template.owner,
      accesses: accesses.map((a) => ({
        id: a.id,
        user: a.user,
        grantedAt: a.grantedAt,
      })),
    });
  } catch (error) {
    console.error('[API] GET /api/templates/[id]/share error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
