const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

const { jwks_url, kid } = require('./config');

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

// The JWKS URL only has public keys, the private key stays local in private.key.
// Find the published key that matches the local private key and use its kid.
async function getSigningKey() {
  const privateKey = fs.readFileSync(__dirname + '/private.key', 'utf8');
  const localPublic = crypto.createPublicKey(privateKey).export({ format: 'jwk' });

  const keys = await fetchJwks();
  const jwk = keys.find((k) => k.n === localPublic.n && (!kid || k.kid === kid));

  if (!jwk) throw new Error('private.key does not match any public key' + (kid ? ' with kid ' + kid : '') + ' at ' + jwks_url);

  console.log('Signing with private.key, matches public key kid ' + jwk.kid);

  return { kid: jwk.kid, alg: jwk.alg || 'RS256', privateKey };
}

module.exports = { fetchJwks, getSigningKey };
