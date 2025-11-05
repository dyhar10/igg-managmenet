const REQUIRED_ENV = {
  JWT_SECRET: 'change-me',
};

function getEnv(key, fallback) {
  if (process.env[key] && process.env[key].trim() !== '') {
    return process.env[key];
  }
  if (fallback !== undefined) {
    return fallback;
  }
  return undefined;
}

const config = {
  port: Number.parseInt(getEnv('PORT', '4000'), 10),
  jwtSecret: getEnv('JWT_SECRET', REQUIRED_ENV.JWT_SECRET),
  tokenExpirationSeconds: Number.parseInt(
    getEnv('TOKEN_EXPIRATION_SECONDS', '3600'),
    10
  ),
};

module.exports = Object.freeze(config);
