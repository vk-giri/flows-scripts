const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/testenv' });

module.exports = {
  base_url: process.env.BASE_URL,
  port: process.env.PORT,
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  username: process.env.USERNAME,
  password: process.env.PASSWORD
};
