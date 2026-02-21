import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserTeam } from '@/lib/team';

const roleUpdateSchema = z.object({
  role: z.enum(['admin', 'member']),
});

/**
 * DELETE /api/team/members/[userId] — Remove a member from the team
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const team = await getUserTeam(session.user.id);
    if (!team) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 });
    }

    // Only owner/admin can remove
    const myMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: team.id, userId: session.user.id } },
    });

    if (!myMembership || !['owner', 'admin'].includes(myMembership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cannot remove the owner
    const targetMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: team.id, userId } },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (targetMembership.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove the team owner' }, { status: 403 });
    }

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId: team.id, userId } },
    });

    return NextResponse.json({ message: 'Member removed' });
  } catch (error) {
    console.error('[API] DELETE /api/team/members/[userId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/team/members/[userId] — Change member role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const team = await getUserTeam(session.user.id);
    if (!team) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 });
    }

    // Only owner can change roles
    const myMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: team.id, userId: session.user.id } },
    });

    if (!myMembership || myMembership.role !== 'owner') {
      return NextResponse.json({ error: 'Only the team owner can change roles' }, { status: 403 });
    }

    const targetMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: team.id, userId } },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (targetMembership.role === 'owner') {
      return NextResponse.json({ error: 'Cannot change the owner role' }, { status: 403 });
    }

    const body: unknown = await request.json();
    const parsed = roleUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await prisma.teamMember.update({
      where: { teamId_userId: { teamId: team.id, userId } },
      data: { role: parsed.data.role },
      include: {
        user: {
          select: { id: true, name: true, email: true, username: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[API] PATCH /api/team/members/[userId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
