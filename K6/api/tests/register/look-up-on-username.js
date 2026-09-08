import { fail, group } from "k6";

import { PartyUrnQueryBuilder } from "../../../clients/register/index.js";
import { getItemFromList, getOptions, requireEnv } from "../../../helpers.js";
import { RegisterBuildingBlocks } from "../../building-blocks/register/index.js";
import { PartyLookupDomainChecks } from "../../domain-checks/register/party-lookup.js";
import { getLookupClient, getUsernames } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const label = { step: "test-lookup-on-username" };

export const options = getOptions([label]);

/**
 * @param {Array<import("../../../clients/register/types.js").Party>|null} parties What the lookup returned.
 * @param {string} expectedUsername The username the lookup was keyed on.
 * @returns {void} Nothing. Fails the iteration when the lookup found no single party.
 */
function assertLookupResult(parties, expectedUsername) {
    if (!PartyLookupDomainChecks.CheckSinglePartyFound(parties, `username '${expectedUsername}'`)) {
        fail("Register lookup did not return a single party");
    }

    PartyLookupDomainChecks.CheckPartyMatchesUsername(parties[0], expectedUsername);
}

export function setup() {
    requireEnv(["BASE_URL", "ENVIRONMENT", "REGISTER_SUBSCRIPTION_KEY"]);

    return getUsernames(__ENV.ENVIRONMENT);
}

/**
 * @param {ReturnType<typeof setup>} usernames The usernames from setup.
 * @returns {void} Nothing. The checks record what the lookups returned.
 */
export default function (usernames) {
    const registerClient = getLookupClient();

    /**
     * This test requires a username that exists in Register:
     * https://github.com/Altinn/altinn-register
     * The username must correspond to a "self identified user" (i.e., a user with email login).
     *
     * If a valid username is not available, create a new self identified user at:
     * https://tt02.altinn.no/ui/Authentication/SelfIdentified
     * Repeat this process for all relevant test environments: TT02, AT22 and AT23.
     * Note: YT01 does not currently have a frontend for user creation.
     * Username should be case insensitive.
     */

    const user = getItemFromList(usernames, randomize);

    const username = user.username;
    const fields = ["person", "party", "user"];

    group("Look up username in Register", () => {
        const parties = RegisterBuildingBlocks.AccessManagementPartiesQuery(
            registerClient,
            new PartyUrnQueryBuilder().withUsername(username).build(),
            fields,
            label,
        );

        assertLookupResult(parties, username);

        group("Look up username in Register - case insensitivity", () => {
            // Uppercase the username if not already, to test case insensitivity
            const usernameWithUpperCase = username.toUpperCase();

            const uppercaseParties
                = RegisterBuildingBlocks.AccessManagementPartiesQuery(
                    registerClient,
                    new PartyUrnQueryBuilder()
                        .withUsername(usernameWithUpperCase)
                        .build(),
                    fields,
                    label,
                );

            assertLookupResult(uppercaseParties, username);
        });
    });
}
