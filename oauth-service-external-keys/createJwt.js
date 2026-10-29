const njwt = require('njwt');

const { base_url, client_id } = require('./config');
const { getSigningKey } = require('./fetchKeys.js');

async function createJWT() {
  const { kid, alg, privateKey } = await getSigningKey(); // Fetch keys from the external JWKS URL
  const clientId = client_id; // Or load from configuration
  const now = Math.floor(new Date().getTime() / 1000); // seconds since epoch;
  const expirationTime = new Date((now + 60 * 60) * 1000); // Current time in seconds + 60 minutes

  const claims = {
    aud: base_url + '/oauth2/v1/token', // audience
  };

  const jwt = njwt
    .create(claims, privateKey, alg)
    .setHeader('kid', kid)
    .setIssuedAt(now)
    .setExpiration(expirationTime)
    .setIssuer(clientId)
    .setSubject(clientId);

  return jwt.compact();
}

module.exports = { createJWT };
