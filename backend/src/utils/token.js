const crypto = require('crypto');
const { jwtSecret, tokenExpirationSeconds } = require('../config/environment');

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input) {
  const pad = input.length % 4;
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + (pad ? '='.repeat(4 - pad) : '');
  return Buffer.from(padded, 'base64').toString();
}

function signToken(payload, expiresInSeconds = tokenExpirationSeconds) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const fullPayload = { ...payload, iat, exp };

  const headerSegment = base64UrlEncode(JSON.stringify(header));
  const payloadSegment = base64UrlEncode(JSON.stringify(fullPayload));
  const signingInput = `${headerSegment}.${payloadSegment}`;
  const signature = crypto
    .createHmac('sha256', jwtSecret)
    .update(signingInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signingInput}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }
  const [headerSegment, payloadSegment, signatureSegment] = parts;
  const signingInput = `${headerSegment}.${payloadSegment}`;
  const expectedSignature = crypto
    .createHmac('sha256', jwtSecret)
    .update(signingInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signatureSegment.length !== expectedSignature.length) {
    return null;
  }

  const signatureIsValid = crypto.timingSafeEqual(
    Buffer.from(signatureSegment),
    Buffer.from(expectedSignature)
  );

  if (!signatureIsValid) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(payloadSegment));
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    return null;
  }
  return payload;
}

module.exports = {
  signToken,
  verifyToken,
};
