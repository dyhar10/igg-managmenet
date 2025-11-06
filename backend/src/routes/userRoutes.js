const userController = require('../controllers/userController');

function registerUserRoutes(router) {
  router.register('GET', '/api/users', userController.listUsers);
  router.register('GET', '/api/roles', userController.listRoles);
  router.register('PATCH', '/api/users/roles', userController.updateUserRoles);
}

module.exports = registerUserRoutes;
