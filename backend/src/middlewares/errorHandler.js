const config = require('../config/environment');

function errorHandler(err, _req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const responseBody = {
    message: err.message || 'Terjadi kesalahan pada server',
  };

  if (statusCode >= 500 && config.nodeEnv !== 'production') {
    responseBody.details = err.stack;
  }

  res.status(statusCode).json(responseBody);
}

module.exports = errorHandler;
