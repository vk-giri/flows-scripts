const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/testenv' });

module.exports = {
  base_url: process.env.BASE_URL,
  client_id: process.env.CLIENT_ID,
  scopes: process.env.SCOPES,
  kid: process.env.KID,
  public_jwk: process.env.JWK,
  scopes: process.env.SCOPES,
};
