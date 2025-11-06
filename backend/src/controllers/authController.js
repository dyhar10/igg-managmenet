const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { email, password, fullName, roles } = req.body || {};
    const result = await authService.register({ email, password, fullName, roles });
    res.status(201).json({ message: 'Registrasi berhasil', data: result });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const result = await authService.login({ email, password });
    res.status(200).json({ message: 'Login berhasil', data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
};
