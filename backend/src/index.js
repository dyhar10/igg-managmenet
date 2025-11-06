const http = require('http');
const Router = require('./utils/router');
const { sendJson } = require('./utils/http');
const config = require('./config/environment');
const prisma = require('./config/database');
const registerAuthRoutes = require('./routes/authRoutes');
const registerCashRoutes = require('./routes/cashRoutes');
const registerUserRoutes = require('./routes/userRoutes');

const router = new Router();

registerAuthRoutes(router);
registerCashRoutes(router);
registerUserRoutes(router);
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

let isShuttingDown = false;

function gracefulShutdown(signal) {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  console.log(`\nReceived ${signal}. Closing HTTP server and database connections...`);
  server.close(async (closeError) => {
    if (closeError) {
      console.error('Error while closing HTTP server:', closeError);
    }
    await prisma.$disconnect();
    process.exit(closeError ? 1 : 0);
  });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
