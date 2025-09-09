const njwt = require('njwt');
const crypto = require('crypto');
const fs = require('fs');

const { base_url } = require('./config');

const alg = 'RS256'; // one of RSA or ECDSA algorithms: RS256, RS384, RS512, ES256, ES384, ES512
const privateKey = fs.readFileSync('private.key', 'utf8'); // Load an RSA private key from configuration
const publicKey = JSON.parse(fs.readFileSync('public.key', 'utf8')); // public key in JWK string format

const claims = {
  htm: 'POST',
  htu: base_url + '/oauth2/v1/token', // token endpoint
  iat: Math.floor(new Date().getTime() / 1000),
};

function createDpop() {
  const jwt = njwt.create(claims, privateKey, alg).setHeader('typ', 'dpop+jwt').setHeader('jwk', publicKey);
  jwt.compact();
  return jwt;
}

function updateDpop(nonce) {
  const randomString = (Math.random() + 1).toString(36).substring(7);

  // add nonce value to the dpop proof payload
  // jit: a random value, which should be unique for every request
  const newClaims = { ...claims, nonce, jti: randomString };

  const jwt = njwt.create(newClaims, privateKey, alg).setHeader('typ', 'dpop+jwt').setHeader('jwk', publicKey).compact();

  return jwt;
}

// updates dpop-proof so that it can be used with Okta Resources
function updateDpop_OktaResource(dpopBoundAccessToken, method, endpoint) {
  // Create a SHA-256 hash of the access token, and then base64 encode it
  const hash = crypto
    .createHash('sha256')
    .update(dpopBoundAccessToken) // The DPoP-bound access token
    .digest('base64') // base64 encode it from binary
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
    .replace(/\=/g, '');

  const newClaims = {
    ...claims,
    ath: hash,
    htm: method,
    htu: `${base_url}${endpoint}`,
    iat: Math.floor(new Date().getTime() / 1000),
    jti: (Math.random() + 1).toString(36).substring(7),
  };

  const jwt = njwt.create(newClaims, privateKey, alg).setHeader('typ', 'dpop+jwt').setHeader('jwk', publicKey).compact();

  return jwt;
}

module.exports = { createDpop, updateDpop, updateDpop_OktaResource };
