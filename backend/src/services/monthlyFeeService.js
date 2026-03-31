const monthlyFeeRepository = require('../repositories/monthlyFeeRepository');
const houseRepository = require('../repositories/houseRepository');

const VALID_STATUSES = ['UNPAID', 'PAID', 'WAIVED'];

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function formatFee(fee) {
  return {
    id: fee.id,
    houseId: fee.houseId,
    house: fee.house
      ? { id: fee.house.id, code: fee.house.code, ownerName: fee.house.ownerName || null }
      : undefined,
    year: fee.year,
    month: fee.month,
    amount: Number(fee.amount),
    status: fee.status,
    paidAt: fee.paidAt ? fee.paidAt.toISOString() : null,
    notes: fee.notes || null,
    createdAt: fee.createdAt.toISOString(),
    updatedAt: fee.updatedAt.toISOString(),
  };
}

function formatHouseMapEntry(house) {
  const fee = house.monthlyFees && house.monthlyFees[0] ? house.monthlyFees[0] : null;
  return {
    id: house.id,
    code: house.code,
    ownerName: house.ownerName || null,
    address: house.address || null,
    fee: fee
      ? {
          id: fee.id,
          amount: Number(fee.amount),
          status: fee.status,
          paidAt: fee.paidAt ? fee.paidAt.toISOString() : null,
        }
      : null,
  };
}

async function generateFees({ year, month, amount, houseIds }) {
  const parsedYear = parseInt(year, 10);
  const parsedMonth = parseInt(month, 10);
  const numericAmount = Number(amount);

  if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
    throw createHttpError('year tidak valid', 400);
  }
  if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    throw createHttpError('month harus antara 1 dan 12', 400);
  }
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw createHttpError('amount harus bernilai positif', 400);
  }

  const fees = await monthlyFeeRepository.generateFees({
    year: parsedYear,
    month: parsedMonth,
    amount: numericAmount,
    houseIds,
  });

  return fees.map(formatFee);
}

async function listFees({ year, month, houseId, status }) {
  const parsedYear = year ? parseInt(year, 10) : undefined;
  const parsedMonth = month ? parseInt(month, 10) : undefined;

  if (parsedYear !== undefined && (Number.isNaN(parsedYear) || parsedYear < 2000)) {
    throw createHttpError('year tidak valid', 400);
  }
  if (parsedMonth !== undefined && (Number.isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12)) {
    throw createHttpError('month harus antara 1 dan 12', 400);
  }
  if (status && !VALID_STATUSES.includes(status.toUpperCase())) {
    throw createHttpError('status tidak valid', 400);
  }
  if (houseId) {
    const house = await houseRepository.findById(houseId);
    if (!house) throw createHttpError('Rumah tidak ditemukan', 404);
  }

  const fees = await monthlyFeeRepository.listFees({
    year: parsedYear,
    month: parsedMonth,
    houseId,
    status: status ? status.toUpperCase() : undefined,
  });

  // Build summary
  const totalAmount = fees.filter((f) => f.status === 'PAID').reduce((sum, f) => sum + Number(f.amount), 0);
  const counts = { PAID: 0, UNPAID: 0, WAIVED: 0 };
  fees.forEach((f) => { counts[f.status] = (counts[f.status] || 0) + 1; });

  return {
    fees: fees.map(formatFee),
    summary: { total: fees.length, ...counts, totalCollected: totalAmount },
  };
}

async function updateFeeStatus({ id, status, notes }) {
  if (!id) throw createHttpError('id wajib diisi', 400);
  const normalizedStatus = status ? status.toUpperCase() : undefined;
  if (!normalizedStatus || !VALID_STATUSES.includes(normalizedStatus)) {
    throw createHttpError('status tidak valid. Gunakan PAID, UNPAID, atau WAIVED', 400);
  }

  const existing = await monthlyFeeRepository.findById(id);
  if (!existing) throw createHttpError('Iuran tidak ditemukan', 404);

  const paidAt = normalizedStatus === 'PAID' ? new Date() : null;

  const updated = await monthlyFeeRepository.updateFeeStatus({
    id,
    status: normalizedStatus,
    paidAt,
    notes,
  });

  return formatFee(updated);
}

async function getMapData({ year, month }) {
  const parsedYear = parseInt(year, 10);
  const parsedMonth = parseInt(month, 10);

  if (Number.isNaN(parsedYear) || parsedYear < 2000) throw createHttpError('year tidak valid', 400);
  if (Number.isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) throw createHttpError('month harus antara 1 dan 12', 400);

  const houses = await monthlyFeeRepository.getMapData({ year: parsedYear, month: parsedMonth });
  return houses.map(formatHouseMapEntry);
}

module.exports = { generateFees, listFees, updateFeeStatus, getMapData };
