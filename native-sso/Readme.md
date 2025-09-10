node server.js -> this will take the details present in testenv

node server.js 00axxxjdjkf -> this will take the client id for Native application - 2



This whole flow is good but it will fail with error 
This is because Token exchange between two apps would fail if a client which had previously authenticated 
against the v1 API did not present an IDX cookie. This change requires the 
ENG_ENABLE_FACTOR_VERIFICATION_PERSISTENCE_FOR_V1_AND_IDX_INTEROP feature flag to be turned on.

