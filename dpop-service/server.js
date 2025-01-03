const { default: axios } = require('axios');

const { updateDpop_OktaResource } = require('./createDpopProof');
const { generateDpopBoundAccessToken } = require('./generateDpopBoundAccessToken');
const { base_url } = require('./config');

async function getData() {
  try {
    // TODO: add capability to get these data from terminal
    const endpoint = '/api/v1/users';
    const method = 'GET';
    const data = {};

    // this dpop bound access token will be attached in Authorization Headers
    const dpopBoundAccessToken = await generateDpopBoundAccessToken();
    // the above access token will be need some additional data to call Okta resources
    const updatedDpopProof = updateDpop_OktaResource(dpopBoundAccessToken, method, endpoint);

    const requestConfig = {
      method,
      url: base_url + endpoint,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `DPoP ${dpopBoundAccessToken}`,
        DPoP: updatedDpopProof,
      },
      data,
    };

    const response = await axios.request(requestConfig);

    console.log('Getting data successful. Okta-Request-ID ' + response.headers['x-okta-request-id']);
    
    response.data.forEach(element => {
      console.log(element.id);
    });
    
    return response.status;
  } catch (error) {
    console.log('Error in fetching data' + error.response?.headers['x-okta-request-id']);
    // console.log('Error in fetching data', error.response.headers);
    console.log({
      status: error.response?.status,
      statusText: error.response?.statusText,
      OktaRequestId: error.response?.headers['x-okta-request-id'],
      data: error.response?.data,
    });
  }
}

getData();
