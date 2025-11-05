const REQUIRED_ENV = {
  JWT_SECRET: 'change-me',
};

function getEnv(key, fallback, options = {}) {
  if (process.env[key] && process.env[key].trim() !== '') {
    return process.env[key];
  }
  if (fallback !== undefined) {
    return fallback;
  }
  if (options.required) {
    throw new Error(`Environment variable ${key} is required but was not provided`);
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
  databaseUrl: getEnv('DATABASE_URL', undefined, { required: true }),
  directDatabaseUrl: getEnv('DIRECT_URL', undefined, { required: true }),
};

module.exports = Object.freeze(config);
