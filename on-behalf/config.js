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
  cc_client_id: process.env.CC_CLIENT_ID,
  cc_client_secret: process.env.CC_CLIENT_SECRET,
  cc_aud: process.env.CC_AUD,
  cc_scopes: process.env.CC_SCOPES,
  trustedServer: process.env.TRUSTED_AUTH_SERVER,
};
