const express = require("express");
const basicAuth = require('express-basic-auth');

const app = express();

// app.use(basicAuth( { authorizer: myAuthorizer } )) 

// function myAuthorizer(username, password) {
//     const userMatches = basicAuth.safeCompare(username, process.env.USER)
//     const passwordMatches = basicAuth.safeCompare(password, process.env.PASSWORD)

//     return userMatches & passwordMatches
// }

/*
*  
* Token Inline Hook code
*
*/

// Example Patients Data Store
// Edit this patient store to include a user in your Okta org.

const patients = [
  {
    username: 'michelle.test@example.com',
    ExternalServicePatientID: '1235',
  },
  {
    username: 'raj.gupta@example.com',
     ExternalServicePatientID: '6789',
  },
    {username: 'mark.christie2777@gmail.com',
     ExternalServicePatientID: '4235',
  },

  ]

//Token Inline Hook POST from Okta (endpoint: tokenHook)

app.post("/", (request, response) => {
  //console.log(request.body);
  console.log(" ");
  console.log(request.body.data.identity.claims["preferred_username"]);

  var patientName = request.body.data.identity.claims["preferred_username"];

  if (patients.some((user) => user.username == patientName)) {
    const arrayPosition = patients.findIndex(
      (user) => user.username == patientName
    );
    const patientID = patients[arrayPosition].ExternalServicePatientID;

    var returnValue = {
      commands: [
        {
          type: "com.okta.identity.patch",
          value: [
            {
              op: "add",
              path: "/claims/extPatientId",
              value: patientID,
            },
          ],
        },
      ],
    };
    console.log(
      "Added claim to ID Token, with a value of: " +
        returnValue.commands[0].value[0]["value"]
    );
    response.send(JSON.stringify(returnValue));
  } else {
    console.log("Not part of patient data store");
    response.status(204).send();
  }
});
         





// listen for requests :)
const listener = app.listen(8000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});