// utils/verifyPassport.js
const crypto = require('crypto');

// In a real system, this secret would be a secure, managed key.
const HMAC_SECRET_KEY = 'LaGuardAI-Secret-Key-For-PoC';

/**
 * Generates a simulated signature for a passport.
 * @param {string} agentId The agent's unique ID.
 * @param {string} issuedAt The ISO timestamp of when the passport was issued.
 * @returns {string} A hex-encoded HMAC signature.
 */
function generateSignature(agentId, issuedAt) {
  const hmac = crypto.createHmac('sha256', HMAC_SECRET_KEY);
  hmac.update(agentId + issuedAt);
  return hmac.digest('hex');
}

/**
 * Verifies a submitted passport against its signature.
 * @param {object} passport The passport object to verify.
 * @returns {boolean} True if the signature is valid, false otherwise.
 */
function verifyPassport(passport) {
  if (!passport || !passport.agentId || !passport.issuedAt || !passport.signature) {
    return false;
  }
  const expectedSignature = generateSignature(passport.agentId, passport.issuedAt);
  // Use crypto.timingSafeEqual for security against timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(passport.signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
  } catch (error) {
    return false;
  }
}

module.exports = { generateSignature, verifyPassport };