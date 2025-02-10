const express = require('express');
const basicAuth = require('express-basic-auth');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/testenv' });
const app = express();
app.use(basicAuth({ authorizer: myAuthorizer }));

function myAuthorizer(username, password) {
  const userMatches = basicAuth.safeCompare(username, process.env.MY_USER);
  const passwordMatches = basicAuth.safeCompare(password, process.env.PASSWORD);

  return userMatches & passwordMatches;
}

const start = Date.now();
app.post('/tokenHook', (req, res) => {
  console.log('Inside Hook Execution.....');

  var returnValue = {
    commands: [
      {
        // for access token
        type: 'com.okta.access.patch',
        value: [
          {
            op: 'add',
            path: '/claims/myClaimAccess',
            value: 'a test val',
          },
        ],
      },
      {
        // for id token
        type: 'com.okta.identity.patch',
        value: [
          {
            op: 'add',
            path: '/claims/myClaimId',
            value: 'another test val',
          },
        ],
      },
    ],
  };

  res.send(JSON.stringify(returnValue));
  console.log("Time taken to execute (in ms): ", Date.now() - start);
});

const listener = app.listen(8000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

// ngrok http --url=honest-ray-accepted.ngrok-free.app 8000
