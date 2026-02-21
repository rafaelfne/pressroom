import { prisma } from '@/lib/prisma';

/**
 * Get the user's team. In MVP, a user belongs to exactly one team.
 */
export async function getUserTeam(userId: string) {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    include: { team: true },
  });
  return membership?.team ?? null;
}

/**
 * Create a team for a new user during registration.
 */
export async function createTeamForUser(userId: string, userName: string) {
  const slug = generateTeamSlug(userName);
  
  const team = await prisma.team.create({
    data: {
      name: `${userName}'s Team`,
      slug,
      members: {
        create: {
          userId,
          role: 'owner',
        },
      },
    },
  });

  return team;
}

function generateTeamSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  // Add a random suffix to ensure uniqueness
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}
