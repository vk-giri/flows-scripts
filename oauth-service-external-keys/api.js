const axios = require('axios');
const { generateToken } = require('./generateToken.js');
const { base_url } = require('./config.js');


async function getUsers() {
  try {
    // Wait for the token to be generated
    const token = await generateToken();

    const response = await axios.get(base_url + '/api/v1/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Get users successful. Okta-Request-ID ' + response.headers['x-okta-request-id']);
    return response.data;
  } catch (error) {
    console.log('Error in fetching users');
    console.log({
      status: error.response.status,
      statusText: error.response.statusText,
      OktaRequestId: error.response.headers['x-okta-request-id'],
      data: error.response.data,
    });
  }
}

async function getApps() {
  try {
    // Wait for the token to be generated
    const token = await generateToken();

    const response = await axios.get(base_url + '/api/v1/apps', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Get apps successful. Okta-Request-ID ' + response.headers['x-okta-request-id']);
    return response.data;
  } catch (error) {
    console.log('Error in fetching apps');
    console.log({
      status: error.response.status,
      statusText: error.response.statusText,
      OktaRequestId: error.response.headers['x-okta-request-id'],
      data: error.response.data,
    });
  }
}

module.exports = { getUsers, getApps }