/*
https://op3-okta.oktapreview.com/su/sqlconsole#

SELECT id, clientId
FROM SSFStreams
WHERE orgId = '00oa25qmhiOJ9QOUk1d7'
LIMIT 10;
*/

// the token generator must be a super admin

// ngrok http --url=honest-ray-accepted.ngrok-free.app 8000

const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

const config = {
  port: 8000,
};

const setContentTypeMiddleware = (type = 'application/json') => {
  return express.raw({ type });
};

const eventTypes = {
  SESSION_REVOKED: 'https://schemas.openid.net/secevent/caep/event-type/session-revoked',
  CREDENTIAL_CHANGE: 'https://schemas.openid.net/secevent/caep/event-type/credential-change',
};

const parseEvent = (events) => {
  let eventDescription = '';
  let eventData = null;

  if (events.hasOwnProperty(eventTypes.SESSION_REVOKED)) {
    eventDescription = 'Session Revoked Event Received';
    eventData = events[eventTypes.SESSION_REVOKED];
  } else if (events.hasOwnProperty(eventTypes.CREDENTIAL_CHANGE)) {
    eventDescription = 'Credential Change Event Received';
    eventData = events[eventTypes.CREDENTIAL_CHANGE];
  }

  if (eventDescription && eventData) {
    console.log('\nEvent Description -> ', eventDescription);
    console.log(eventData);
  } else {
    console.log('No valid event type found.');
  }
};

app.post('/ssf/reciever', setContentTypeMiddleware('application/secevent+jwt'), (req, res) => {
  console.log('Recieved SSF Request from the Transmitter....\n');
  // console.log('Token Recieved --> \n', req.body.toString());

  const token = req.body.toString();
  const decodedToken = jwt.decode(token, { complete: true });

  console.log(`Decoded Token--> \n  ${JSON.stringify({ ...decodedToken.header, ...decodedToken.payload }, null, 4)}`);

  // TODO: parse events to send it to frontend
  // parseEvent(decodedToken.payload.events);

  console.log(`${'='.repeat(200)}\n`);

  res.status(202).send('Request has been accepted and is being processed.');
});

app.listen(config.port, () => {
  console.log(`Resource Server Ready on port ${config.port}`);
});
