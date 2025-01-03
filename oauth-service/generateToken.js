const axios = require('axios');
const { jwtDecode } = require('jwt-decode');

const { createJWT } = require('./createJwt.js');
const { scopes, base_url } = require('./config.js');

const data = {
  grant_type: 'client_credentials',
  client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
  client_assertion: createJWT(),
  scope: scopes,
};

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
};

let accessToken = '';

const ifTokenAlive = (token) => {
  const decoded = jwtDecode(token);

  const expTime = decoded.exp;
  const now = Math.floor(new Date().getTime() / 1000);

  // TODO: advancing the time by 1min so that server is time synced
  return now < decoded.exp;
};

async function generateToken(additionalScopes) {
  try {
    if (accessToken !== '' && ifTokenAlive(accessToken)) {
      console.log('Using Previously Created Token');
      return accessToken;
    }

    if (accessToken !== '' && !ifTokenAlive(accessToken)) {
      console.log('Previous Created Token has expired');

      // when the tokens expired, create new client_assertion
      const newClientAssertion = createJWT();
      data.client_assertion = newClientAssertion;
    }

    // add extra scopes from terminal
    data.scope = scopes + ' ' + additionalScopes;

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

// generateToken();

module.exports = { generateToken };
