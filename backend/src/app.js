const express = require('express');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(
    morgan('tiny', {
      skip: () => process.env.NODE_ENV === 'test',
    })
  );

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
