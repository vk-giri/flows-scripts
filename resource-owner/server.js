const axios = require('axios');

const { client_id, client_secret, base_url, username, password } = require('./config');

const base64Encode = () => {
  const originalString = `${client_id}:${client_secret}`;

  const bufferObj = Buffer.from(originalString, 'utf8');

  const base64String = bufferObj.toString('base64');

  return base64String;
};

const config = {
  method: 'post',
  url: `https://${base_url}/oauth2/v1/token`,
  headers: {
    Accept: 'application/json',
    Authorization: 'Basic ' + base64Encode(),
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  data: {
    grant_type: 'password',
    username: username,
    password: password,
    scope: 'openid',
  },
};

axios(config)
  .then((response) => {
    console.log('Access Token:', response.data);
  })
  .catch((error) => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });