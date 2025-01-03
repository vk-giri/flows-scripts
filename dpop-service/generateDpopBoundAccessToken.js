const axios = require('axios');

const { createJWT } = require('./createJwt.js');
const { createDpop, updateDpop } = require('./createDpopProof.js');
const { base_url, scopes } = require('./config.js');

const data = {
  grant_type: 'client_credentials',
  client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
  client_assertion: createJWT(),
  scope: scopes,
};

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
  DPoP: createDpop(),
};

async function generateDpopNonce() {
  try {
    const response = await axios.post(`${base_url}/oauth2/v1/token`, data, { headers });

    console.log(response.data);
  } catch (error) {
    console.log('Getting Nonce....... Okta-Request-ID - ' + error.response?.headers['x-okta-request-id']);

    if (error.response.data.error === 'use_dpop_nonce') {
      console.log('Extracting Nonce from headers - ' + error.response.headers['dpop-nonce']);

      // adding dpop-nonce in dpop-proof
      headers.DPoP = updateDpop(error.response.headers['dpop-nonce']);

      return;
    }

    // if dpop-nonce was not generated, log the errors
    console.log('Error in Generating DPoP Nonce. Okta-Request-ID - ' + error.response?.headers['x-okta-request-id']);
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

// TODO: a nonce once generated is valid for 24hr, add some logic to preserve nonce once for 24hr
async function generateDpopBoundAccessToken() {
  try {
    // generate dpop-nonce and attach it to the dpop-proof payload
    await generateDpopNonce();

    // generating new client assertion for getting tokens
    data.client_assertion = createJWT();

    const response = await axios.post(`${base_url}/oauth2/v1/token`, data, { headers });

    console.log('Token Request Successfull for the Service App!! . Okta-Request-ID - ', response.headers['x-okta-request-id']);

    console.log('============== Token ============ \n', response.data);
    console.log('================================= \n');
    return response.data.access_token;
  } catch (error) {
    console.log('Error in Generating Token. Okta-Request-ID - ' + error.response?.headers['x-okta-request-id']);
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

// generateDpopBoundAccessToken()

module.exports = { generateDpopBoundAccessToken };
