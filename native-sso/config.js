const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/testenv' });

module.exports = {
  base_url: process.env.BASE_URL,
  issuer: process.env.ISSUER,
  client_id: process.env.CLIENT_ID,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  scopes: process.env.SCOPES,
  redirectUri: process.env.REDIRECT_URI,
  state: process.env.STATE,
  nonce: process.env.NONCE,
  code_challenge: process.env.CODE_CHALLENGE,
  code_verifier: process.env.CODE_VERIFIER,
  audience: process.env.AUD,
  client_id2: process.env.CLIENT_ID_2,
  scopes2: process.env.SCOPES_2
};
