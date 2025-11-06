const { parseJsonBody, sendJson } = require('../utils/http');
const userService = require('../services/userService');

async function listUsers(_req, res) {
  const users = await userService.listUsers();
  sendJson(res, 200, { data: users });
}

async function listRoles(_req, res) {
  const roles = await userService.listRoles();
  sendJson(res, 200, { data: roles });
}

async function updateUserRoles(req, res) {
  const body = await parseJsonBody(req);
  const { userId, roles } = body;
  const user = await userService.updateUserRoles({ userId, roles });
  sendJson(res, 200, { message: 'Roles pengguna diperbarui', data: user });
}

module.exports = {
  listUsers,
  listRoles,
  updateUserRoles,
};
