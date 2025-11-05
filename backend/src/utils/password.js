const crypto = require('crypto');

const ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string' || !storedHash.includes(':')) {
    return false;
  }
  const [salt, originalHash] = storedHash.split(':');
  const compareHash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString('hex');
  if (originalHash.length !== compareHash.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(originalHash, 'hex'),
    Buffer.from(compareHash, 'hex')
  );
}

module.exports = {
  hashPassword,
  verifyPassword,
};
