/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!directUrl) {
  throw new Error('DIRECT_URL atau DATABASE_URL wajib disediakan untuk menjalankan seeder.');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl,
    },
  },
});

async function upsertRole(name, description) {
  await prisma.role.upsert({
    where: { name },
    update: { description },
    create: { name, description },
  });
}

async function main() {
  const defaultRoles = [
    { name: 'super-admin', description: 'Akses penuh ke seluruh modul aplikasi' },
    { name: 'member', description: 'Warga perumahan dengan akses dasar' },
    { name: 'mosque-treasurer', description: 'Pengelola keuangan kas masjid' },
  ];

  for (const role of defaultRoles) {
    // eslint-disable-next-line no-await-in-loop
    await upsertRole(role.name, role.description);
  }

  const superAdminEmail = (process.env.SEED_SUPER_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const superAdminName = process.env.SEED_SUPER_ADMIN_NAME || 'Administrator Perumahan';
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD || 'Secret123!';

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
    include: {
      userRoles: { include: { role: true } },
    },
  });

  if (!existingSuperAdmin) {
    const passwordHash = hashPassword(superAdminPassword);
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        fullName: superAdminName,
        passwordHash,
        userRoles: {
          create: [
            'super-admin',
            'member',
          ].map((roleName) => ({
            role: {
              connect: { name: roleName },
            },
          })),
        },
      },
    });
    console.info('Super admin default berhasil dibuat.');
  } else {
    console.info('Super admin sudah ada, lewati pembuatan akun.');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Gagal menjalankan seed database:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
