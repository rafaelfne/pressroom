import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create test organizations
  const org1 = await prisma.organization.upsert({
    where: { slug: 'b2-advisory' },
    update: {},
    create: {
      name: 'B2 Advisory',
      slug: 'b2-advisory',
    },
  });

  const org2 = await prisma.organization.upsert({
    where: { slug: 'serenitta' },
    update: {},
    create: {
      name: 'Serenittà',
      slug: 'serenitta',
    },
  });

  console.log('✅ Created organizations:', org1.name, org2.name);

  // Create test users
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

  // Create templates
  const template1 = await prisma.template.upsert({
    where: { id: 'template-relatorio-mensal' },
    update: {},
    create: {
      id: 'template-relatorio-mensal',
      name: 'Relatório Mensal',
      description: 'Monthly report template',
      organizationId: org1.id,
      ownerId: user1.id,
      templateData: {
        root: {},
        content: [],
        zones: {},
      },
    },
  });

  const template2 = await prisma.template.upsert({
    where: { id: 'template-portfolio-review' },
    update: {},
    create: {
      id: 'template-portfolio-review',
      name: 'Portfolio Review',
      description: 'Quarterly portfolio review template',
      organizationId: org1.id,
      ownerId: user1.id,
      templateData: {
        root: {},
        content: [],
        zones: {},
      },
    },
  });

  const template3 = await prisma.template.upsert({
    where: { id: 'template-serenitta-report' },
    update: {},
    create: {
      id: 'template-serenitta-report',
      name: 'Relatório Mensal',
      description: 'Serenittà monthly report',
      organizationId: org2.id,
      ownerId: user1.id,
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
