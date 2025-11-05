const { parseJsonBody, sendJson } = require('../utils/http');
const authService = require('../services/authService');

async function register(req, res) {
  const body = await parseJsonBody(req);
  const { email, password, fullName, roles } = body;
  const result = await authService.register({ email, password, fullName, roles });
  sendJson(res, 201, { message: 'Registrasi berhasil', data: result });
}

async function login(req, res) {
  const body = await parseJsonBody(req);
  const { email, password } = body;
  const result = await authService.login({ email, password });
  sendJson(res, 200, { message: 'Login berhasil', data: result });
}

module.exports = {
  register,
  login,
};
