const houseRepository = require('../repositories/houseRepository');
const cashTransactionRepository = require('../repositories/cashTransactionRepository');

const VALID_TRANSACTION_TYPES = ['INCOME', 'EXPENSE'];
const VALID_PAYMENT_METHODS = ['CASH', 'TRANSFER', 'OTHER'];

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeString(value) {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseDateInput(value, fieldName, { required = false, endOfDay = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw createHttpError(`${fieldName} wajib diisi`, 400);
    }
    return undefined;
  }

  const dateValue = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    throw createHttpError(`${fieldName} tidak valid`, 400);
  }

  if (endOfDay) {
    dateValue.setHours(23, 59, 59, 999);
  } else {
    dateValue.setHours(0, 0, 0, 0);
  }

  return dateValue;
}

function startOfWeek(date) {
  const result = new Date(date.getTime());
  const day = result.getDay();
  const diff = (day + 6) % 7; // Start week on Monday
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfMonth(date) {
  const result = new Date(date.getTime());
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfYear(date) {
  const result = new Date(date.getTime());
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatHouse(house) {
  return {
    id: house.id,
    code: house.code,
    ownerName: house.ownerName || null,
    address: house.address || null,
    createdAt: house.createdAt.toISOString(),
    updatedAt: house.updatedAt.toISOString(),
  };
}

function formatTransaction(transaction) {
  return {
    id: transaction.id,
    houseId: transaction.houseId,
    house: transaction.house
      ? {
          id: transaction.house.id,
          code: transaction.house.code,
          ownerName: transaction.house.ownerName || null,
          address: transaction.house.address || null,
        }
      : undefined,
    transactionType: transaction.transactionType,
    paymentMethod: transaction.paymentMethod,
    category: transaction.category,
    amount: Number(transaction.amount),
    description: transaction.description || null,
    transactionDate: transaction.transactionDate.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
}

async function ensureHouseExists(houseId) {
  const house = await houseRepository.findById(houseId);
  if (!house) {
    throw createHttpError('Rumah tidak ditemukan', 404);
  }
  return house;
}

async function createHouse({ code, ownerName, address }) {
  const normalizedCode = normalizeString(code);
  if (!normalizedCode) {
    throw createHttpError('Kode rumah wajib diisi', 400);
  }

  const upperCode = normalizedCode.toUpperCase();
  const existing = await houseRepository.findByCode(upperCode);
  if (existing) {
    throw createHttpError('Kode rumah sudah terdaftar', 409);
  }

  const house = await houseRepository.createHouse({
    code: upperCode,
    ownerName: normalizeString(ownerName) || null,
    address: normalizeString(address) || null,
  });

  return formatHouse(house);
}

async function listHouses() {
  const houses = await houseRepository.listHouses();
  return houses.map(formatHouse);
}

async function createTransaction(payload) {
  const { houseId, transactionType, paymentMethod, category, amount, description, transactionDate } = payload;

  if (!houseId || typeof houseId !== 'string') {
    throw createHttpError('houseId wajib diisi', 400);
  }

  const normalizedType = normalizeString(transactionType);
  if (!normalizedType || !VALID_TRANSACTION_TYPES.includes(normalizedType.toUpperCase())) {
    throw createHttpError('transactionType tidak valid', 400);
  }

  const normalizedPaymentMethod = normalizeString(paymentMethod);
  if (!normalizedPaymentMethod || !VALID_PAYMENT_METHODS.includes(normalizedPaymentMethod.toUpperCase())) {
    throw createHttpError('paymentMethod tidak valid', 400);
  }

  const normalizedCategory = normalizeString(category);
  if (!normalizedCategory) {
    throw createHttpError('category wajib diisi', 400);
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw createHttpError('amount harus bernilai positif', 400);
  }

  const parsedTransactionDate = parseDateInput(transactionDate, 'transactionDate', { required: true });

  const house = await ensureHouseExists(houseId);

  const transaction = await cashTransactionRepository.createTransaction({
    houseId: house.id,
    transactionType: normalizedType.toUpperCase(),
    paymentMethod: normalizedPaymentMethod.toUpperCase(),
    category: normalizedCategory,
    amount: numericAmount,
    description: normalizeString(description) || null,
    transactionDate: parsedTransactionDate,
  });

  return formatTransaction(transaction);
}

async function listTransactions({ houseId, transactionType, startDate, endDate }) {
  let validatedHouseId;
  if (houseId) {
    if (typeof houseId !== 'string') {
      throw createHttpError('houseId tidak valid', 400);
    }
    await ensureHouseExists(houseId);
    validatedHouseId = houseId;
  }

  let normalizedType;
  if (transactionType) {
    const normalized = normalizeString(transactionType);
    if (!normalized || !VALID_TRANSACTION_TYPES.includes(normalized.toUpperCase())) {
      throw createHttpError('transactionType tidak valid', 400);
    }
    normalizedType = normalized.toUpperCase();
  }

  const parsedStartDate = startDate ? parseDateInput(startDate, 'startDate') : undefined;
  const parsedEndDate = endDate ? parseDateInput(endDate, 'endDate', { endOfDay: true }) : undefined;

  if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
    throw createHttpError('startDate tidak boleh lebih besar dari endDate', 400);
  }

  const transactions = await cashTransactionRepository.listTransactions({
    houseId: validatedHouseId,
    transactionType: normalizedType,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
  });

  return transactions.map(formatTransaction);
}

async function buildSummary({ houseId, startDate, endDate }) {
  const [income, expense] = await Promise.all([
    cashTransactionRepository.sumAmountByType({
      transactionType: 'INCOME',
      houseId,
      startDate,
      endDate,
    }),
    cashTransactionRepository.sumAmountByType({
      transactionType: 'EXPENSE',
      houseId,
      startDate,
      endDate,
    }),
  ]);

  const balance = Math.round((income - expense) * 100) / 100;

  return { income, expense, balance };
}

async function getDashboardSummary({ houseId }) {
  if (houseId) {
    await ensureHouseExists(houseId);
  }

  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);
  const endOfPeriod = new Date(now.getTime());
  endOfPeriod.setHours(23, 59, 59, 999);

  const [weekly, monthly, yearly, overall] = await Promise.all([
    buildSummary({ houseId, startDate: weekStart, endDate: endOfPeriod }),
    buildSummary({ houseId, startDate: monthStart, endDate: endOfPeriod }),
    buildSummary({ houseId, startDate: yearStart, endDate: endOfPeriod }),
    buildSummary({ houseId, startDate: undefined, endDate: undefined }),
  ]);

  return { weekly, monthly, yearly, overall };
}

module.exports = {
  createHouse,
  listHouses,
  createTransaction,
  listTransactions,
  getDashboardSummary,
};
