# Register

- `look-up-on-username.js` looks a party up by username and checks that the lookup is case
  insensitive.
- `look-up-on-idporten-email.js` looks a party up by ID-porten email.
- `add-rm-ccr-role-for-client.js` removes a CCR role in Enhetsregisteret over SOAP, checks that
  Register drops the customer, then puts the role back and checks that Register has it again.
  It changes real data in ER, so it puts the role back even when the assertions fail.

Test data is `register/register-usernames-<env>.csv` and `register/organizations-<env>.csv`.
Needs `ENVIRONMENT`, `BASE_URL` and `REGISTER_SUBSCRIPTION_KEY`, and the ER test additionally
`SOAP_ER_USERNAME` and `SOAP_ER_PASSWORD`, which go in the SOAP envelope rather than through a
token generator.
