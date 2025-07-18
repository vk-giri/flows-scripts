const { default: axios } = require('axios');

const { getToken } = require('./getTokens');
const { issuer, cc_scopes, cc_aud, cc_client_id, cc_client_secret, trustedServer } = require('./config');

const base64Encode = () => {
  // The original utf8 string
  const originalString = `${cc_client_id}:${cc_client_secret}`;

  // Create buffer object, specifying utf8 as encoding
  const bufferObj = Buffer.from(originalString, 'utf8');

  // Encode the Buffer as a base64 string
  const base64String = bufferObj.toString('base64');

  return base64String;
};

const checkIfTrustedServer = () => {
  return process.argv.includes('-trusted-server');
};

const tokenConfig = {
  method: 'post',
  url: (checkIfTrustedServer() ? trustedServer : issuer) + '/v1/token',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: 'Basic ' + base64Encode(),
  },
  data: {
    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
    subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
    subject_token: '',
    scope: cc_scopes,
    audience: cc_aud,
  },
};

async function oboTokenExchange() {
  try {
    const tokenFromNativeApp = await getToken();

    if (!tokenFromNativeApp) {
      console.log('There was an error in generating token from native app. \n Aborting Flow.....');
      return tokenFromNativeApp;
    }

    tokenConfig.data.subject_token = tokenFromNativeApp;

    const response = await axios.request(tokenConfig);

    console.log('Token Request Successfull for the Service App!! . Okta-Request-ID - ', response.headers['x-okta-request-id']);

    console.log('============== Token ============ \n', response.data);
    // return response.data;
  } catch (error) {
    console.log('Error in Generating Token for the Service App. Okta-Request-ID - ' + error.response?.headers['x-okta-request-id']);
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

oboTokenExchange();
