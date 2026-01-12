import { check } from "k6";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { RegisterLookupClient } from "../../../../clients/authentication/index.js";

export default function () {
  const options = new Map();
  options.set("env", __ENV.ENVIRONMENT);
  options.set("ttl", 3600);
  options.set("scopes", "altinn:register/partylookup.admin");
  options.set("orgNo", "314239458");

  const tokenGenerator = new EnterpriseTokenGenerator(options);
  const registerLookupClient = new RegisterLookupClient(
    __ENV.BASE_URL,
    tokenGenerator
  );

  const username = "vegard";
  const fields = "person,party,user";
  const label = "test-lookup-on-username";

  const response = registerLookupClient.LookupParties(fields, username, label);

  check(response, {
    "LookupParties - Response is successful": (r) => r.status === 200,
  });
}
