const okta = require('@okta/okta-sdk-nodejs');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/testenv' });

const client = new okta.Client({
  orgUrl: 'https://vivek-giri.oktapreview.com/',
  token: process.env.TOKEN,
});

async function createUser() {
  try {
    const user = await client.userApi.createUser({
      body: {
        profile: {
          firstName: 'Node',
          lastName: 'User',
          email: 'vivek.giri+nodeUser@okta.com',
          login: 'vivek.giri+nodeUser@okta.com',
        },
        credentials: {
          password: {
            value: 'PasswordAbc@123',
          },
        },
      },
    });
    console.log('Created user', user);
  } catch (error) {
    console.log(error);
  }
}

async function getUser({ identifier }) {
  try {
    const user = await client.userApi.getUser({ userId: identifier });
    return user;
  } catch (error) {
    console.log(error);
  }
}

async function updateUser({ existingUser }) {
  try {
    existingUser.profile.nickName = 'rob';

    await client.userApi.updateUser({
      userId: existingUser.id,
      user: existingUser,
    });
  } catch (error) {
    console.log(error);
  }
}

// createUser();
const user = getUser({ identifier: '00uk6v07yhXgTTLCz1d7' }); // id/login

if (existingUser) updateUser({ existingUser });
