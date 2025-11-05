const { sendJson, sendNoContent } = require('./http');

class Router {
  constructor() {
    this.routes = [];
  }

  register(method, path, handler) {
    this.routes.push({ method: method.toUpperCase(), path, handler });
  }

  async handle(req, res) {
    if (req.method === 'OPTIONS') {
      sendNoContent(res);
      return;
    }

    const matchingRoute = this.routes.find(
      (route) => route.method === req.method && route.path === req.url.split('?')[0]
    );

    if (!matchingRoute) {
      sendJson(res, 404, { message: 'Route not found' });
      return;
    }

    try {
      await matchingRoute.handler(req, res);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message =
        statusCode >= 500 ? 'Internal server error' : error.message || 'Unhandled error';
      sendJson(res, statusCode, { message });
    }
  }
}

module.exports = Router;
