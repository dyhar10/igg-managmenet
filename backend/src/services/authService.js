const { signToken } = require('../utils/token');
const userService = require('./userService');

async function register(payload) {
  const user = await userService.registerUser(payload);
  const token = signToken({ sub: user.id, email: user.email, roles: user.roles });
  return { user, token };
}

async function login(payload) {
  const user = await userService.authenticateUser(payload);
  const token = signToken({ sub: user.id, email: user.email, roles: user.roles });
  return { user, token };
}

module.exports = {
  register,
  login,
};
