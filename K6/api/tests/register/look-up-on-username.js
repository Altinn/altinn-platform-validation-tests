import { check, group } from "k6";
import { PlatformTokenGenerator } from "../../../common-imports.js";
import { RegisterLookupClient } from "../../../clients/authentication/index.js";
import { LookupPartiesInRegister } from "../../building-blocks/register/index.js";
import { getItemFromList, getOptions, parseCsvData } from "../../../helpers.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const label = "test-lookup-on-username";

export const options = getOptions([label]);

// NOTE: k6 `open()` is only available in the init context (global scope).
const csvPath = `../../../testdata/register/register-usernames-${__ENV.ENVIRONMENT}.csv`;
const usernames = parseCsvData(open(csvPath));

export default function () {
  const tokenOpts = new Map();
  tokenOpts.set("env", __ENV.ENVIRONMENT);
  tokenOpts.set("ttl", 3600);

  const token = new PlatformTokenGenerator(tokenOpts);
  const registerLookupClient = new RegisterLookupClient(__ENV.BASE_URL, token);

  /**
   * This test requires a username that exists in Register:
   * https://github.com/Altinn/altinn-register
   * The username must correspond to a "self identified user" (i.e., a user with email login).
   *
   * If a valid username is not available, create a new self identified user at:
   *   https://tt02.altinn.no/ui/Authentication/SelfIdentified
   * Repeat this process for all relevant test environments: TT02, AT22, AT23 and AT24.
   * Note: YT01 does not currently have a frontend for user creation.
   * Username should be case insensitive.
   */
  const user = getItemFromList(usernames, randomize);
  const username = user.username;

  const fields = "person,party,user";

  group("Look up username in Register", () => {
    const requestBody = {
      data: [`urn:altinn:party:username:${username}`],
    };

    const response = LookupPartiesInRegister(
      registerLookupClient,
      fields,
      username,
      requestBody,
      label
    );

    check(response, {
      "Username was found in the response": (r) => r.body.includes(username),
      "User is of type self-identified-user": (r) =>
        JSON.parse(r.body).data.some(
          (party) => party.partyType === "self-identified-user"
        ),
    });
  });

  group("Look up username in Register - case insensitivity", () => {
    // Uppercase the username if not already, to test case insensitivity
    const altUsername = username === username.toUpperCase();

    const requestBody = {
      data: [`urn:altinn:party:username:${altUsername}`],
    };

    const response = LookupPartiesInRegister(
      registerLookupClient,
      fields,
      altUsername,
      requestBody,
      label
    );

    check(response, {
      "Username (case variant) was found in the response": (r) =>
        r.body.includes(username) || r.body.includes(altUsername),
      "User is of type self-identified-user (case variant)": (r) =>
        JSON.parse(r.body).data.some(
          (party) => party.partyType === "self-identified-user"
        ),
    });
  });
}

export { handleSummary } from "../../../common-imports.js";
