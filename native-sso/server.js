const { default: axios } = require('axios');

const { getToken } = require('./getTokens');
const { issuer, audience, client_id2, scopes2 } = require('./config');

const clientId2 = () => {
  // return the client id 2 present in testenv if not passed in terminal
  return (!process.argv[2] ? client_id2 : process.argv[2])
}

const tokenExchangeConfig = {
  method: 'post',
  url: issuer + '/v1/token',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  data: {
    client_id: clientId2(),
    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
    actor_token: '',
    actor_token_type: 'urn:x-oath:params:oauth:token-type:device-secret',
    subject_token: '',
    subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
    scope: scopes2,
    audience: audience,
  },
};

async function tokenExchange() {
  try {
    const tokenFromNativeApp1 = await getToken();

    if (!tokenFromNativeApp1) {
      console.log('There was an error in generating token from Native App 1. \n Aborting Flow.....');
      return tokenFromNativeApp1;
    }

    tokenExchangeConfig.data.actor_token = tokenFromNativeApp1.device_secret;
    tokenExchangeConfig.data.subject_token = tokenFromNativeApp1.id_token;

    const response = await axios.request(tokenExchangeConfig);

    console.log('Token Request Successfull for the Native App 2!! . Okta-Request-ID - ', response.headers['x-okta-request-id']);

    console.log('============== Token ============ \n', response.data);
    // return response.data;
  } catch (error) {
    console.log('Error in Generating Token for the Native App 2. Okta-Request-ID - ' + error.response?.headers['x-okta-request-id']);
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

tokenExchange();

