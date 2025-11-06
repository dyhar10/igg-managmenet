const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123456';
  const adminFullName = process.env.SEED_ADMIN_FULL_NAME || 'Administrator';

  const passwordHash = hashPassword(adminPassword);

  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {},
    create: {
      email: adminEmail.toLowerCase(),
      passwordHash,
      fullName: adminFullName,
      roles: ['admin'],
    },
  });

  const housesSeed = [
    {
      code: 'A-01',
      ownerName: 'Budi Santoso',
      address: 'Blok A No. 1',
    },
    {
      code: 'A-02',
      ownerName: 'Siti Rahma',
      address: 'Blok A No. 2',
    },
    {
      code: 'B-05',
      ownerName: 'Agus Pratama',
      address: 'Blok B No. 5',
    },
  ];

  const seededHouses = [];
  for (const houseData of housesSeed) {
    const house = await prisma.house.upsert({
      where: { code: houseData.code },
      update: {
        ownerName: houseData.ownerName,
        address: houseData.address,
      },
      create: houseData,
    });
    seededHouses.push(house);
  }

  if (seededHouses.length > 0) {
    await prisma.cashTransaction.deleteMany({
      where: {
        house: {
          code: {
            in: seededHouses.map((house) => house.code),
          },
        },
      },
    });
  }

  const transactionSeeds = [
    {
      houseCode: 'A-01',
      transactionType: 'INCOME',
      paymentMethod: 'CASH',
      category: 'Iuran Bulanan',
      amount: 250000,
      description: 'Iuran kas bulan berjalan',
      offsetDays: -2,
    },
    {
      houseCode: 'A-02',
      transactionType: 'INCOME',
      paymentMethod: 'TRANSFER',
      category: 'Iuran Bulanan',
      amount: 250000,
      description: 'Pembayaran melalui transfer bank',
      offsetDays: -8,
    },
    {
      houseCode: 'B-05',
      transactionType: 'INCOME',
      paymentMethod: 'OTHER',
      category: 'Iuran Sosial',
      amount: 150000,
      description: 'Iuran sosial tambahan',
      offsetDays: -15,
    },
    {
      houseCode: 'A-01',
      transactionType: 'EXPENSE',
      paymentMethod: 'CASH',
      category: 'Keamanan',
      amount: 100000,
      description: 'Pembayaran satpam mingguan',
      offsetDays: -1,
    },
    {
      houseCode: 'A-02',
      transactionType: 'EXPENSE',
      paymentMethod: 'TRANSFER',
      category: 'Kebersihan',
      amount: 75000,
      description: 'Pembayaran petugas kebersihan',
      offsetDays: -4,
    },
    {
      houseCode: 'B-05',
      transactionType: 'EXPENSE',
      paymentMethod: 'CASH',
      category: 'Perawatan Taman',
      amount: 50000,
      description: 'Perawatan taman bulanan',
      offsetDays: -32,
    },
    {
      houseCode: 'A-01',
      transactionType: 'INCOME',
      paymentMethod: 'TRANSFER',
      category: 'Iuran Bulanan',
      amount: 250000,
      description: 'Iuran bulan sebelumnya',
      offsetDays: -34,
    },
    {
      houseCode: 'A-02',
      transactionType: 'EXPENSE',
      paymentMethod: 'OTHER',
      category: 'Sampah',
      amount: 60000,
      description: 'Pembayaran pengangkutan sampah',
      offsetDays: -65,
    },
  ];

  for (const seed of transactionSeeds) {
    const house = seededHouses.find((item) => item.code === seed.houseCode);
    if (!house) {
      continue;
    }

    const transactionDate = new Date();
    transactionDate.setHours(12, 0, 0, 0);
    transactionDate.setDate(transactionDate.getDate() + seed.offsetDays);

    await prisma.cashTransaction.create({
      data: {
        houseId: house.id,
        transactionType: seed.transactionType,
        paymentMethod: seed.paymentMethod,
        category: seed.category,
        amount: seed.amount,
        description: seed.description,
        transactionDate,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Database seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
