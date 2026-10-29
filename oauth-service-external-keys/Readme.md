# OAuth Service App with External Keys

Gets a scoped OAuth 2.0 access token for an Okta API service app that uses `private_key_jwt`, where the app's public keys are hosted at an external JWKS URL instead of being saved in Okta.

## Okta setup

1. Create an API Services app.
2. Under **Client Credentials**, pick **Public key / Private key** and set **Save keys in** to **Use a URL to fetch keys dynamically**. Enter your JWKS URL.
3. Put the matching private key in this folder as `private.key` (PEM). It is never published, only the public key goes in the JWKS.
4. Grant the Okta API scopes you need (e.g. `okta.users.read`) and assign an admin role to the app.

## How it works

1. `fetchKeys.js` fetches the public JWKS from `JWKS_URL` and finds the key that matches the local `private.key` (and `KID`, if set). Every request to the URL is logged, along with its Cache-Control max-age.
2. `createJwt.js` signs the client assertion with `private.key`, using that public key's `kid`. Okta fetches the same URL and verifies the signature with the public key.
3. `generateToken.js` calls `/oauth2/v1/token` with `grant_type=client_credentials`.

## Run

```
cp testenv-sample testenv   # fill in values
npm install
npm start                    # or: node server.js okta.groups.read  (extra scopes)
```

`testenv` and `private.key` are git-ignored.
