// utils/verifyPassport.js
const crypto = require('crypto');

const HMAC_SECRET_KEY = 'LaGuardAI-Secret-Key-For-PoC';

function generateSignature(agentId, issuedAt) {
  const hmac = crypto.createHmac('sha256', HMAC_SECRET_KEY);
  hmac.update(agentId + issuedAt);
  return hmac.digest('hex');
}

function verifyPassport(passport) {
  if (!passport || !passport.agentId || !passport.issuedAt || !passport.signature) {
    return false;
  }
  const expectedSignature = generateSignature(passport.agentId, passport.issuedAt);
  return crypto.timingSafeEqual(Buffer.from(passport.signature), Buffer.from(expectedSignature));
}

module.exports = { generateSignature, verifyPassport };

