const prisma = require('../config/database');

async function generateFees({ year, month, amount, houseIds }) {
  // Fetch target houses
  const houses = houseIds && houseIds.length > 0
    ? await prisma.house.findMany({ where: { id: { in: houseIds } } })
    : await prisma.house.findMany();

  const ops = houses.map((house) =>
    prisma.monthlyFee.upsert({
      where: { houseId_year_month: { houseId: house.id, year, month } },
      update: { amount },
      create: { houseId: house.id, year, month, amount, status: 'UNPAID' },
    }),
  );

  return prisma.$transaction(ops);
}

async function listFees({ year, month, houseId, status }) {
  const where = {};
  if (year !== undefined) where.year = year;
  if (month !== undefined) where.month = month;
  if (houseId) where.houseId = houseId;
  if (status) where.status = status;

  return prisma.monthlyFee.findMany({
    where,
    include: { house: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { house: { code: 'asc' } }],
  });
}

async function findById(id) {
  return prisma.monthlyFee.findUnique({ where: { id }, include: { house: true } });
}

async function updateFeeStatus({ id, status, paidAt, notes }) {
  return prisma.monthlyFee.update({
    where: { id },
    data: { status, paidAt: paidAt ?? null, notes: notes ?? null },
    include: { house: true },
  });
}

async function getMapData({ year, month }) {
  // Get all houses with their fee for the given month (if any)
  const houses = await prisma.house.findMany({
    include: {
      monthlyFees: {
        where: { year, month },
        take: 1,
      },
    },
    orderBy: { code: 'asc' },
  });
  return houses;
}

module.exports = {
  generateFees,
  listFees,
  findById,
  updateFeeStatus,
  getMapData,
};
