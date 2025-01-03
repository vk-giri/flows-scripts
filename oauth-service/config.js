const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/testenv' });

module.exports = {
  base_url: process.env.URL,
  port: process.env.PORT,
  client_id: process.env.CLIENT_ID,
  kid: process.env.KID,
  scopes: process.env.SCOPES,
};
