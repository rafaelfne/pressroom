import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserTeam } from '@/lib/team';
import { TeamSection } from '@/components/settings/team-section';
import { OrganizationsSection } from '@/components/settings/organizations-section';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const team = await getUserTeam(session.user.id);

  let teamData = null;
  let organizations: Array<{ id: string; name: string; slug: string; _count: { templates: number } }> = [];
  let currentUserRole = 'member';

  if (team) {
    teamData = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, username: true, avatarUrl: true },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    organizations = await prisma.organization.findMany({
      where: { teamId: team.id },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { templates: { where: { deletedAt: null } } } },
      },
    });

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: team.id, userId: session.user.id } },
    });
    currentUserRole = membership?.role ?? 'member';
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your team and organizations.</p>
      </div>

      <TeamSection
        team={teamData}
        currentUserId={session.user.id}
        currentUserRole={currentUserRole}
      />

      <OrganizationsSection
        organizations={organizations}
        canManage={['owner', 'admin'].includes(currentUserRole)}
      />
    </div>
  );
}
