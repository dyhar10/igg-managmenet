const fs = require('fs');
const path = require('path');
const http = require('http');
const Router = require('./utils/router');
const { sendJson, sendHtml, sendText } = require('./utils/http');
const config = require('./config/environment');
const prisma = require('./config/database');
const registerAuthRoutes = require('./routes/authRoutes');
const registerCashRoutes = require('./routes/cashRoutes');
const registerUserRoutes = require('./routes/userRoutes');
const registerMonthlyFeeRoutes = require('./routes/monthlyFeeRoutes');

const router = new Router();

registerAuthRoutes(router);
registerCashRoutes(router);
registerUserRoutes(router);
registerMonthlyFeeRoutes(router);

router.register('GET', '/api/health', async (_req, res) => {
  sendJson(res, 200, {
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.register('GET', '/openapi.yaml', async (_req, res) => {
  const yamlPath = path.join(__dirname, '..', 'docs', 'openapi.yaml');
  const content = fs.readFileSync(yamlPath, 'utf8');
  sendText(res, 200, content, 'text/yaml');
});

router.register('GET', '/api-docs', async (_req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="IGG Management API Documentation" />
    <title>IGG Management API - Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" charset="UTF-8"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/openapi.yaml',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          plugins: [SwaggerUIBundle.plugins.DownloadUrl],
          layout: 'StandaloneLayout',
        });
      };
    </script>
  </body>
</html>
  `;
  sendHtml(res, 200, html);
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
