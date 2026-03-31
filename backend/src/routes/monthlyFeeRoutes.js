const monthlyFeeController = require('../controllers/monthlyFeeController');

function registerMonthlyFeeRoutes(router) {
  // Map must be before /:id-style routes
  router.register('GET', '/api/fees/map', monthlyFeeController.getMapData);
  router.register('POST', '/api/fees/generate', monthlyFeeController.generateFees);
  router.register('GET', '/api/fees', monthlyFeeController.listFees);
  router.register('PATCH', '/api/fees/:id', monthlyFeeController.updateFeeStatus);
}

module.exports = registerMonthlyFeeRoutes;
