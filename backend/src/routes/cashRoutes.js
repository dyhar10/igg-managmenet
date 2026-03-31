const cashManagementController = require('../controllers/cashManagementController');

function registerCashRoutes(router) {
  router.register('GET', '/api/houses', cashManagementController.listHouses);
  router.register('POST', '/api/houses', cashManagementController.createHouse);
  router.register('PUT', '/api/houses/:id', cashManagementController.updateHouse);
  router.register('DELETE', '/api/houses/:id', cashManagementController.deleteHouse);
  router.register('GET', '/api/cash-transactions', cashManagementController.listTransactions);
  router.register('POST', '/api/cash-transactions', cashManagementController.createTransaction);
  router.register('GET', '/api/cash-dashboard', cashManagementController.getDashboardSummary);
}

module.exports = registerCashRoutes;
