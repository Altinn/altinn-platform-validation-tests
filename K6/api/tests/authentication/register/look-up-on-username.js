import { check, group } from "k6";
import { PlatformTokenGenerator } from "../../../../common-imports.js";
import { RegisterLookupClient } from "../../../../clients/authentication/index.js";

export default function () {
    const options = new Map();
    options.set("env", __ENV.ENVIRONMENT);
    options.set("ttl", 3600);

    const tokenGenerator = new PlatformTokenGenerator(options);
    const registerLookupClient = new RegisterLookupClient(
        __ENV.BASE_URL,
        tokenGenerator
    );

    /**
   * This test requires a hardcoded username that exists in the Register system.
   * The username must correspond to a "self identified user" (i.e., a user with email login).
   *
   * If a valid username is not available, create a new self identified user at:
   *   https://tt02.altinn.no/ui/Authentication/SelfIdentified
   * Repeat this process for all relevant test environments: TT02, AT22, AT23 and AT24.
   * Note: YT01 does not currently have a frontend for user creation.
   */
    const username = "Vegard";

    const fields = "person,party,user";
    const label = "test-lookup-on-username";

    const response = registerLookupClient.LookupParties(fields, username, label);

    group("Look up username in Register", () => {
        check(response, {
            "Register status code is 200": (r) => r.status === 200,
            "Username was found in the response": (r) => r.body.includes(username),
            "User is of type self-identified-user": (r) =>
                JSON.parse(r.body).data.some(
                    (party) => party.partyType === "self-identified-user"
                ),
        });
    });
}

// k6 calls handleSummary() only if it's exported from the entry script.
export { handleSummary } from "../../../../common-imports.js";
