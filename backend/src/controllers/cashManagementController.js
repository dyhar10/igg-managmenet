const { parseJsonBody, sendJson } = require('../utils/http');
const cashManagementService = require('../services/cashManagementService');

async function createHouse(req, res) {
  const body = await parseJsonBody(req);
  const result = await cashManagementService.createHouse(body);
  sendJson(res, 201, { message: 'Rumah berhasil ditambahkan', data: result });
}

async function listHouses(_req, res) {
  const result = await cashManagementService.listHouses();
  sendJson(res, 200, { message: 'Daftar rumah berhasil diambil', data: result });
}

async function createTransaction(req, res) {
  const body = await parseJsonBody(req);
  const result = await cashManagementService.createTransaction(body);
  sendJson(res, 201, { message: 'Transaksi kas berhasil dicatat', data: result });
}

async function listTransactions(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const query = Object.fromEntries(url.searchParams.entries());
  const result = await cashManagementService.listTransactions({
    houseId: query.houseId || undefined,
    transactionType: query.transactionType || undefined,
    startDate: query.startDate || undefined,
    endDate: query.endDate || undefined,
  });
  sendJson(res, 200, { message: 'Daftar transaksi kas berhasil diambil', data: result });
}

async function getDashboardSummary(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const query = Object.fromEntries(url.searchParams.entries());
  const result = await cashManagementService.getDashboardSummary({
    houseId: query.houseId || undefined,
  });
  sendJson(res, 200, { message: 'Ringkasan kas berhasil diambil', data: result });
}

module.exports = {
  createHouse,
  listHouses,
  createTransaction,
  listTransactions,
  getDashboardSummary,
};
