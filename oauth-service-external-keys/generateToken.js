const axios = require('axios');
const { jwtDecode } = require('jwt-decode');

const { createJWT } = require('./createJwt.js');
const { scopes, base_url } = require('./config.js');

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
};

let accessToken = '';

const ifTokenAlive = (token) => {
  const decoded = jwtDecode(token);
  const now = Math.floor(new Date().getTime() / 1000);

  return now < decoded.exp;
};

async function generateToken(additionalScopes = '') {
  try {
    if (accessToken !== '' && ifTokenAlive(accessToken)) {
      console.log('Using Previously Created Token');
      return accessToken;
    }

    if (accessToken !== '') console.log('Previous Created Token has expired');

    // create a new client_assertion every time a token is requested, keys are re-fetched from the JWKS URL
    const data = {
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: await createJWT(),
      // add extra scopes from terminal
      scope: (scopes + ' ' + additionalScopes).trim(),
    };

    const response = await axios.post(`${base_url}/oauth2/v1/token`, data, { headers });

    console.log('New Token Generated Successfully.  Okta-Request-ID ' + response.headers['x-okta-request-id']);

    console.log(response.data);

    accessToken = response.data.access_token;

    return accessToken;
  } catch (error) {
    console.log('Error in Generating Token. Okta-Request-ID ' + error.response?.headers['x-okta-request-id']);
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

module.exports = { generateToken };
