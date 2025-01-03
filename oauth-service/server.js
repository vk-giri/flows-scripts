const express = require('express');
const config = require('./config.js');

const { getUsers, getApps } = require('./api.js');
const { generateToken } = require('./generateToken.js');

const app = express();

// app.get('/api/users', async (req, res) => {
//   const usersList = await getUsers();
//   // console.log(usersList);

//   res.json(usersList);
// });

// app.get('/api/apps', async (req, res) => {
//   const appList = await getApps();
//   // console.log(usersList);

//   res.json(appList);
// });

// app.listen(config.port, () => {
//   console.log(`Resource Server Ready on port ${config.port}`);
// });

const getScopesFromTerminal = process.argv.slice(2).join(' ');

if (getScopesFromTerminal.length) console.log('Make sure all the extra scopes are granted in the service app......');

generateToken(getScopesFromTerminal);
