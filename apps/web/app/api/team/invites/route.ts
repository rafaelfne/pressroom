import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserTeam } from '@/lib/team';

/**
 * GET /api/team/invites — List pending invites for the team
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const team = await getUserTeam(session.user.id);
    if (!team) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 });
    }

    const invites = await prisma.invite.findMany({
      where: { teamId: team.id, status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: invites });
  } catch (error) {
    console.error('[API] GET /api/team/invites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
