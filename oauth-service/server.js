const { generateToken } = require('./generateToken.js');

const getScopesFromTerminal = process.argv.slice(2).join(' ');

if (getScopesFromTerminal.length) console.log('Make sure all the extra scopes are granted in the service app......');

generateToken(getScopesFromTerminal);
