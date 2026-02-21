import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserTeam } from '@/lib/team';
import crypto from 'crypto';

const inviteSchema = z.object({
  emailOrUsername: z.string().min(1),
});

const INVITE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * POST /api/team/invite — Invite a member to the team
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const team = await getUserTeam(session.user.id);
    if (!team) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 });
    }

    // Only owner/admin can invite
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: team.id, userId: session.user.id } },
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body: unknown = await request.json();
    const parsed = inviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { emailOrUsername } = parsed.data;

    // Try to find existing user by email or username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername },
        ],
      },
    });

    if (existingUser) {
      // Check if already a member
      const existingMembership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: team.id, userId: existingUser.id } },
      });

      if (existingMembership) {
        return NextResponse.json({ error: 'User is already a team member' }, { status: 409 });
      }

      // Instant add
      const newMember = await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: existingUser.id,
          role: 'member',
          invitedBy: session.user.id,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, username: true, avatarUrl: true },
          },
        },
      });

      return NextResponse.json({ member: newMember, type: 'added' }, { status: 201 });
    }

    // User doesn't exist — create a pending invite
    // Validate that emailOrUsername looks like an email
    const isEmail = emailOrUsername.includes('@');
    if (!isEmail) {
      return NextResponse.json({ error: 'User not found. To invite a new user, provide an email address.' }, { status: 404 });
    }

    // Check if invite already pending
    const existingInvite = await prisma.invite.findFirst({
      where: { teamId: team.id, email: emailOrUsername, status: 'pending' },
    });

    if (existingInvite) {
      return NextResponse.json({ error: 'An invitation is already pending for this email' }, { status: 409 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const invite = await prisma.invite.create({
      data: {
        teamId: team.id,
        email: emailOrUsername,
        invitedBy: session.user.id,
        token,
        expiresAt: new Date(Date.now() + INVITE_EXPIRATION_MS),
      },
    });

    return NextResponse.json({ invite, type: 'invited' }, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/team/invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
