const authController = require('../controllers/authController');

function registerAuthRoutes(router) {
  router.register('POST', '/api/auth/register', authController.register);
  router.register('POST', '/api/auth/login', authController.login);
  router.register('POST', '/api/auth/reset-password', authController.resetPassword);
}

module.exports = registerAuthRoutes;
