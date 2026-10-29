const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

const { jwks_url, kid, private_key_path } = require('./config');

// Dedicated axios instance so every outbound request to the keys endpoint gets logged
const jwksClient = axios.create();

let requestCount = 0;
let lastFetch = null; // { time, maxAge } of the previous successful fetch

// Read max-age from Cache-Control, e.g. "public, max-age=300" -> 300
const parseMaxAge = (cacheControl) => {
  const match = /(?:^|,)\s*max-age\s*=\s*"?(\d+)"?/i.exec(cacheControl || '');
  return match ? Number(match[1]) : null;
};

jwksClient.interceptors.request.use((request) => {
  request.metadata = { id: ++requestCount, start: Date.now() };

  console.log(`[JWKS #${request.metadata.id}] --> ${request.method.toUpperCase()} ${request.url} at ${new Date().toISOString()}`);

  if (lastFetch) {
    const secondsSinceLast = Math.round((Date.now() - lastFetch.time) / 1000);
    const withinMaxAge = lastFetch.maxAge !== null ? secondsSinceLast < lastFetch.maxAge : 'unknown (no max-age)';
    console.log(`[JWKS #${request.metadata.id}]     ${secondsSinceLast}s since last fetch, previous max-age=${lastFetch.maxAge}, still within max-age: ${withinMaxAge}`);
  }

  return request;
});

const logResponse = (response) => {
  const { id, start } = response.config.metadata;
  const h = response.headers;
  const maxAge = parseMaxAge(h['cache-control']);

  console.log(`[JWKS #${id}] <-- ${response.status} ${response.statusText} in ${Date.now() - start}ms`);
  console.log(`[JWKS #${id}]     cache headers:`, {
    'cache-control': h['cache-control'],
    'max-age': maxAge,
    age: h['age'],
    expires: h['expires'],
    etag: h['etag'],
    'last-modified': h['last-modified'],
    date: h['date'],
  });

  if (maxAge !== null) {
    const age = Number(h['age']) || 0;
    const freshUntil = new Date(Date.now() + (maxAge - age) * 1000);
    console.log(`[JWKS #${id}]     response is fresh for ${maxAge - age}s, until ${freshUntil.toISOString()}`);
  } else {
    console.log(`[JWKS #${id}]     no max-age in Cache-Control`);
  }

  if (response.status === 200) lastFetch = { time: Date.now(), maxAge };
};

jwksClient.interceptors.response.use(
  (response) => {
    logResponse(response);
    return response;
  },
  (error) => {
    if (error.response) logResponse(error.response);
    else console.log(`[JWKS #${error.config?.metadata?.id}] <-- request failed: ${error.message}`);
    return Promise.reject(error);
  },
);

// Fetch the JWKS hosted at the external URL (the same URL configured on the Okta service app)
async function fetchJwks() {
  try {
    const response = await jwksClient.get(jwks_url, { headers: { Accept: 'application/json' } });

    if (!response.data || !Array.isArray(response.data.keys)) {
      throw new Error('Response from ' + jwks_url + ' is not a valid JWKS (missing "keys" array)');
    }

    console.log('Fetched ' + response.data.keys.length + ' key(s) from ' + jwks_url);
    return response.data.keys;
  } catch (error) {
    console.log('Error in fetching keys from ' + jwks_url);
    console.error('Error:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Pick the key matching KID, or the first signing key if KID is not set
function selectKey(keys) {
  const key = kid ? keys.find((k) => k.kid === kid) : keys.find((k) => !k.use || k.use === 'sig');

  if (!key) throw new Error('No matching key found in JWKS' + (kid ? ' for kid ' + kid : ''));
  if (!key.kid) throw new Error('Selected key has no kid, Okta needs the kid to find the key');

  return key;
}

// Returns { kid, alg, privateKey } used for signing the client assertion.
// If the external JWKS contains the private part ("d") it is used directly,
// otherwise the local private key is used and checked against the fetched public key.
async function getSigningKey() {
  const jwk = selectKey(await fetchJwks());
  const alg = jwk.alg || (jwk.kty === 'EC' ? 'ES256' : 'RS256');

  let privateKey;

  if (jwk.d) {
    console.log('Using private key from JWKS for kid ' + jwk.kid);
    privateKey = crypto.createPrivateKey({ key: jwk, format: 'jwk' });
  } else {
    console.log('Using local private key ' + private_key_path + ' for kid ' + jwk.kid);
    privateKey = crypto.createPrivateKey(fs.readFileSync(private_key_path, 'utf8'));

    const localPublic = crypto.createPublicKey(privateKey).export({ format: 'jwk' });
    if (localPublic.n !== jwk.n || localPublic.x !== jwk.x) {
      throw new Error('Local private key does not match the public key ' + jwk.kid + ' published at ' + jwks_url);
    }
  }

  return { kid: jwk.kid, alg, privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }) };
}

module.exports = { fetchJwks, getSigningKey, parseMaxAge };
