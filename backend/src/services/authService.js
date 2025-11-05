const { signToken } = require('../utils/token');
const userService = require('./userService');

function register(payload) {
  const user = userService.registerUser(payload);
  const token = signToken({ sub: user.id, email: user.email, roles: user.roles });
  return { user, token };
}

function login(payload) {
  const user = userService.authenticateUser(payload);
  const token = signToken({ sub: user.id, email: user.email, roles: user.roles });
  return { user, token };
}

module.exports = {
  register,
  login,
};
