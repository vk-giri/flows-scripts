const express = require('express');
const basicAuth = require('express-basic-auth');
const dotenv = require('dotenv');


dotenv.config({ path: __dirname + '/testenv' });
const app = express();
app.use(basicAuth({ authorizer: myAuthorizer }));

function myAuthorizer(username, password) {
  const userMatches = basicAuth.safeCompare(username, process.env.USER);
  const passwordMatches = basicAuth.safeCompare(password, process.env.PASSWORD);

  return userMatches & passwordMatches;
}

app.post('/tokenHook', (req, res) => {
  console.log("Executing hook.....");

  var returnValue = {
    commands: [
      {
        type: 'com.okta.access.patch',
        value: [
          {
            op: 'add',
            path: '/claims/myHook',
            value: "a test val",
          },
        ],
      },
    ],
  };

  res.send(JSON.stringify(returnValue));
});

const listener = app.listen(8000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

// ngrok http --url=honest-ray-accepted.ngrok-free.app 8000
