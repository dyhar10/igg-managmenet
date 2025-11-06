const prisma = require('../config/database');

function buildDateFilter(startDate, endDate) {
  if (!startDate && !endDate) {
    return undefined;
  }
  const filter = {};
  if (startDate) {
    filter.gte = startDate;
  }
  if (endDate) {
    filter.lte = endDate;
  }
  return filter;
}

async function createTransaction(data) {
  return prisma.cashTransaction.create({
    data,
    include: { house: true },
  });
}

async function listTransactions({ houseId, transactionType, startDate, endDate }) {
  const where = {};
  if (houseId) {
    where.houseId = houseId;
  }
  if (transactionType) {
    where.transactionType = transactionType;
  }
  const dateFilter = buildDateFilter(startDate, endDate);
  if (dateFilter) {
    where.transactionDate = dateFilter;
  }

  return prisma.cashTransaction.findMany({
    where,
    include: { house: true },
    orderBy: { transactionDate: 'desc' },
  });
}

async function sumAmountByType({ transactionType, houseId, startDate, endDate }) {
  const where = { transactionType };
  if (houseId) {
    where.houseId = houseId;
  }
  const dateFilter = buildDateFilter(startDate, endDate);
  if (dateFilter) {
    where.transactionDate = dateFilter;
  }

  const result = await prisma.cashTransaction.aggregate({
    where,
    _sum: { amount: true },
  });

  const rawAmount = result._sum.amount;
  return rawAmount ? Number(rawAmount) : 0;
}

module.exports = {
  createTransaction,
  listTransactions,
  sumAmountByType,
};
