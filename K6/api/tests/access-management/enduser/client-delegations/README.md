# Client delegations

`get-my-clients.js` reads the client list as an end user. The users are hardcoded in the test
and were picked from yt01: a few system users with a lot of clients and a few regular users
with fewer, so the timings show how the endpoint scales with client count.

Needs `ENVIRONMENT` and `BASE_URL`.
