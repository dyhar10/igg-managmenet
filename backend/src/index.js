const http = require('http');
const Router = require('./utils/router');
const { sendJson } = require('./utils/http');
const config = require('./config/environment');
const registerAuthRoutes = require('./routes/authRoutes');

const router = new Router();

registerAuthRoutes(router);
router.register('GET', '/api/health', async (_req, res) => {
  sendJson(res, 200, {
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

const server = http.createServer((req, res) => {
  console.info(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  router.handle(req, res);
});

server.listen(config.port, () => {
  console.log(`Backend server berjalan di port ${config.port}`);
});
