import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create test users first (needed for team creation)
  const hashedPassword = await hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'admin@pressroom.dev' },
    update: {
      hashedPassword,
      name: 'Admin User',
      username: 'admin',
    },
    create: {
      email: 'admin@pressroom.dev',
      name: 'Admin User',
      username: 'admin',
      hashedPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'joao@example.com' },
    update: {
      hashedPassword,
      name: 'João Silva',
      username: 'joao.silva',
    },
    create: {
      email: 'joao@example.com',
      name: 'João Silva',
      username: 'joao.silva',
      hashedPassword,
    },
  });

  console.log('✅ Created users:', user1.email, user2.email);

  // Create team
  const team = await prisma.team.upsert({
    where: { slug: 'admin-team' },
    update: {},
    create: {
      name: "Admin's Team",
      slug: 'admin-team',
    },
  });

  console.log('✅ Created team:', team.name);

  // Add users as team members
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: user1.id } },
    update: {},
    create: {
      teamId: team.id,
      userId: user1.id,
      role: 'owner',
    },
  });

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: user2.id } },
    update: {},
    create: {
      teamId: team.id,
      userId: user2.id,
      role: 'member',
      invitedBy: user1.id,
    },
  });

  console.log('✅ Added team members');

  // Create test organizations (now belonging to the team)
  const org1 = await prisma.organization.upsert({
    where: { slug: 'b2-advisory' },
    update: { teamId: team.id },
    create: {
      name: 'B2 Advisory',
      slug: 'b2-advisory',
      teamId: team.id,
    },
  });

  const org2 = await prisma.organization.upsert({
    where: { slug: 'serenitta' },
    update: { teamId: team.id },
    create: {
      name: 'Serenittà',
      slug: 'serenitta',
      teamId: team.id,
    },
  });

  console.log('✅ Created organizations:', org1.name, org2.name);

  // Create templates (now belonging to the team)
  const template1 = await prisma.template.upsert({
    where: { id: 'template-relatorio-mensal' },
    update: { teamId: team.id },
    create: {
      id: 'template-relatorio-mensal',
      name: 'Relatório Mensal',
      description: 'Monthly report template',
      organizationId: org1.id,
      ownerId: user1.id,
      teamId: team.id,
      templateData: {
        root: {},
        content: [],
        zones: {},
      },
    },
  });

  const template2 = await prisma.template.upsert({
    where: { id: 'template-portfolio-review' },
    update: { teamId: team.id },
    create: {
      id: 'template-portfolio-review',
      name: 'Portfolio Review',
      description: 'Quarterly portfolio review template',
      organizationId: org1.id,
      ownerId: user1.id,
      teamId: team.id,
      templateData: {
        root: {},
        content: [],
        zones: {},
      },
    },
  });

  const template3 = await prisma.template.upsert({
    where: { id: 'template-serenitta-report' },
    update: { teamId: team.id },
    create: {
      id: 'template-serenitta-report',
      name: 'Relatório Mensal',
      description: 'Serenittà monthly report',
      organizationId: org2.id,
      ownerId: user1.id,
      teamId: team.id,
      templateData: {
        root: {},
        content: [],
        zones: {},
      },
    },
  });

  console.log('✅ Created templates:', template1.name, template2.name, template3.name);

  // Share template1 with user2
  await prisma.templateAccess.upsert({
    where: {
      templateId_userId: {
        templateId: template1.id,
        userId: user2.id,
      },
    },
    update: {},
    create: {
      templateId: template1.id,
      userId: user2.id,
      grantedBy: user1.id,
    },
  });

  console.log('✅ Shared template with', user2.username);
  console.log('');
  console.log('🎉 Seed completed!');
  console.log('');
  console.log('Test credentials:');
  console.log('  User 1: admin@pressroom.dev / password123 (username: admin)');
  console.log('  User 2: joao@example.com / password123 (username: joao.silva)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
