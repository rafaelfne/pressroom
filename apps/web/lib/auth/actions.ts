'use server';

import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema, type RegisterInput } from '@/lib/validation/auth-schemas';
import { createTeamForUser } from '@/lib/team';

export async function registerUser(
  input: RegisterInput,
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = registerSchema.safeParse(input);

    if (!parsed.success) {
      return { error: 'Invalid input data' };
    }

    const { name, email, username, password } = parsed.data;

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return { error: 'User with this email already exists' };
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return { error: 'Username is already taken' };
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        hashedPassword,
      },
    });

    // Check for pending team invites
    const pendingInvite = await prisma.invite.findFirst({
      where: { email, status: 'pending' },
    });

    if (pendingInvite) {
      // User was invited — join existing team
      await prisma.teamMember.create({
        data: {
          teamId: pendingInvite.teamId,
          userId: user.id,
          role: 'member',
          invitedBy: pendingInvite.invitedBy,
        },
      });
      await prisma.invite.update({
        where: { id: pendingInvite.id },
        data: { status: 'accepted' },
      });
    } else {
      // No invite — create a new team
      await createTeamForUser(user.id, name);
    }

    return { success: true };
  } catch (error) {
    console.error('[registerUser] Error:', error);
    return { error: 'An error occurred during registration' };
  }
}
