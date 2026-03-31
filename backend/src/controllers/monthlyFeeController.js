const { parseJsonBody, sendJson } = require('../utils/http');
const monthlyFeeService = require('../services/monthlyFeeService');

async function generateFees(req, res) {
  const body = await parseJsonBody(req);
  const result = await monthlyFeeService.generateFees(body);
  sendJson(res, 201, { message: 'Iuran berhasil digenerate', data: result });
}

async function listFees(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const query = Object.fromEntries(url.searchParams.entries());
  const result = await monthlyFeeService.listFees({
    year: query.year || undefined,
    month: query.month || undefined,
    houseId: query.houseId || undefined,
    status: query.status || undefined,
  });
  sendJson(res, 200, { message: 'Daftar iuran berhasil diambil', data: result });
}

async function updateFeeStatus(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const parts = url.pathname.split('/');
  const id = parts[parts.length - 1];
  const body = await parseJsonBody(req);
  const result = await monthlyFeeService.updateFeeStatus({ id, status: body.status, notes: body.notes });
  sendJson(res, 200, { message: 'Status iuran berhasil diperbarui', data: result });
}

async function getMapData(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const query = Object.fromEntries(url.searchParams.entries());
  const result = await monthlyFeeService.getMapData({
    year: query.year,
    month: query.month,
  });
  sendJson(res, 200, { message: 'Data peta rumah berhasil diambil', data: result });
}

module.exports = { generateFees, listFees, updateFeeStatus, getMapData };
