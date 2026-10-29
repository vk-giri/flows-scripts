# OAuth Service App with External Keys

Gets a scoped OAuth 2.0 access token for an Okta API service app that uses `private_key_jwt`, where the app's public keys are hosted at an external JWKS URL instead of being saved in Okta.

## Okta setup

1. Create an API Services app.
2. Under **Client Credentials**, pick **Public key / Private key** and set **Save keys in** to **Use a URL to fetch keys dynamically**. Enter your JWKS URL.
3. Grant the Okta API scopes you need (e.g. `okta.users.read`) and assign an admin role to the app.

## How it works

1. `fetchKeys.js` fetches the JWKS from `JWKS_URL` and picks the key matching `KID` (or the first signing key).
2. If that JWK includes its private part (`d`), it's used for signing. If not, the local `private.key` is used, after checking that it matches the public key at the URL.
3. `createJwt.js` signs the client assertion with that key's `kid`. Okta then fetches the same URL to verify it.
4. `generateToken.js` calls `/oauth2/v1/token` with `grant_type=client_credentials`.

## Run

```
cp testenv-sample testenv   # fill in values
npm install
npm start                    # or: node server.js okta.groups.read  (extra scopes)
```

`testenv` and `private.key` are git-ignored.
