const axios = require('axios');
const { JSDOM } = require('jsdom');

// This file generates tokens (and returns access token) from a Native Application

const {
  base_url,
  username,
  password,
  issuer,
  client_id,
  state,
  scopes,
  redirectUri,
  nonce,
  code_challenge,
  code_verifier,
} = require('./config');

const authnConfig = {
  method: 'post',
  url: base_url + '/api/v1/authn',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  data: {
    username: username,
    password: password,
  },
};

async function generateSessionToken() {
  try {
    let sessionToken = '';

    const response = await axios.request(authnConfig);

    console.log('Authn Call Successfull. Okta-Request-ID - ' + response.headers['x-okta-request-id']);
    // console.log(response.data);

    console.log('Trying to extract Session token....');

    if (response.data.status === 'SUCCESS') {
      sessionToken = response.data.sessionToken;

      console.log('Session Token Obtained -> ' + sessionToken);
    } else {
      console.log(response.data);
      console.log('Authm Resulted in ' + response.data.status + ' Status.');
      console.log('Check all the policies');
    }

    return sessionToken;
  } catch (error) {
    console.log('Error in Generating Session Token. Okta-Request-ID - ' + error.response?.headers['x-okta-request-id']);
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

const extractAuthCode = (htmlResponse) => {
  // Create a DOM object from the HTML
  const dom = new JSDOM(htmlResponse);
  const document = dom.window.document;

  // Extract the 'code' value
  const codeValue = document.querySelector("input[name='code']").value;

  return codeValue;
};

async function authorize() {
  try {
    let authCode;

    const sessionToken = await generateSessionToken();

    if (!sessionToken) {
      console.log('Aborting Flow.....');
      return authCode;
    }

    const response = await axios.get(
      `${issuer}/v1/authorize?client_id=${client_id}&response_type=code&response_mode=form_post&scope=${scopes}
      &redirect_uri=${redirectUri}&state=${state}&nonce=${nonce}&sessionToken=${sessionToken}&code_challenge_method=S256&code_challenge=${code_challenge}`
    );

    console.log('Authorize Request Successfull!! . Okta-Request-ID - ', response.headers['x-okta-request-id']);

    authCode = extractAuthCode(response.data);

    console.log('Authorization Code Extracted - ' + authCode);
    return authCode;
  } catch (error) {
    console.log('Error in Generating Authorization Code. Okta-Request-ID - ' + error.response?.headers['x-okta-request-id']);
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

const tokenConfig = {
  method: 'post',
  url: issuer + '/v1/token',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  data: {
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code: '',
    client_id: client_id,
    code_verifier: code_verifier,
  },
};

async function getToken() {
  try {
    let accessToken;

    const authCode = await authorize();

    if (!authCode) {
      console.log('Aborting Flow.....');
      return accessToken;
    }

    tokenConfig.data.code = authCode;

    const response = await axios.request(tokenConfig);

    console.log('Token Request Successfull for Native App!! . Okta-Request-ID - ', response.headers['x-okta-request-id']);

    console.log('============== Tokens ============ \n', response.data);
    return response.data.access_token;
  } catch (error) {
    console.log('Error in Generating Token. Okta-Request-ID - ' + error.response?.headers['x-okta-request-id']);
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

// getToken();

module.exports = { getToken };
