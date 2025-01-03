const njwt = require('njwt');
const fs = require('fs');

const { base_url, kid, client_id } = require('./config');

function createJWT() {
  const privateKey = fs.readFileSync('private.key', 'utf8'); // Load an RSA private key from configuration
  const clientId = client_id; // Or load from configuration
  const now = Math.floor(new Date().getTime() / 1000); // seconds since epoch;
  const expirationTime = new Date((now + 60 * 60) * 1000); // Current time in seconds + 60 minutes
  const alg = 'RS256'; // one of RSA or ECDSA algorithms: RS256, RS384, RS512, ES256, ES384, ES512

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

  jwt.compact();

  return jwt;
}

createJWT();

module.exports = { createJWT };
