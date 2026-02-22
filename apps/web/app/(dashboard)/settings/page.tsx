import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserTeam } from '@/lib/team';
import { TeamSection } from '@/components/settings/team-section';
import { OrganizationsSection } from '@/components/settings/organizations-section';
import { StyleGuidesSection } from '@/components/settings/style-guides-section';
import { listStyleGuides } from '@/lib/style-guides';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const team = await getUserTeam(session.user.id);

  let teamData = null;
  let organizations: Array<{ id: string; name: string; slug: string; _count: { templates: number } }> = [];
  let currentUserRole = 'member';
  const styleGuidesByOrg: Record<string, Awaited<ReturnType<typeof listStyleGuides>>> = {};

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

    // Fetch style guides for all organizations
    const styleGuideResults = await Promise.all(
      organizations.map((org) => listStyleGuides(org.id)),
    );
    for (let i = 0; i < organizations.length; i++) {
      styleGuidesByOrg[organizations[i].id] = styleGuideResults[i];
    }
  }

  const canManage = ['owner', 'admin'].includes(currentUserRole);

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
        canManage={canManage}
      />

      {organizations.map((org) => (
        <StyleGuidesSection
          key={org.id}
          organizationId={org.id}
          styleGuides={(styleGuidesByOrg[org.id] ?? []).map((sg) => ({
            id: sg.id,
            name: sg.name,
            isDefault: sg.isDefault,
            tokens: sg.tokens.map((t) => ({
              id: t.id,
              name: t.name,
              label: t.label,
              category: t.category as 'color' | 'typography' | 'spacing' | 'background' | 'border',
              cssProperty: t.cssProperty,
              value: t.value,
              sortOrder: t.sortOrder,
            })),
          }))}
          canManage={canManage}
          organizationName={org.name}
        />
      ))}
    </div>
  );
}
