import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create test organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
    },
  });

  console.log('✅ Created organization:', organization.name);

  // Create test user
  const hashedPassword = await hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@pressroom.dev' },
    update: {
      hashedPassword,
      name: 'Admin User',
      organizationId: organization.id,
    },
    create: {
      email: 'admin@pressroom.dev',
      name: 'Admin User',
      hashedPassword,
      organizationId: organization.id,
    },
  });

  console.log('✅ Created user:', user.email);

  // Create blank template
  const template = await prisma.template.upsert({
    where: { id: 'blank-template-1' },
    update: {},
    create: {
      id: 'blank-template-1',
      name: 'Blank Template',
      description: 'Empty template ready to edit',
      organizationId: organization.id,
      createdById: user.id,
      templateData: {
        root: {},
        content: [],
        zones: {}
      },
    },
  });

  console.log('✅ Created template:', template.name);
  console.log('');
  console.log('🎉 Seed completed!');
  console.log('');
  console.log('Test credentials:');
  console.log('  Email: admin@pressroom.dev');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
