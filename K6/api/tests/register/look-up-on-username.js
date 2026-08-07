import { check, fail, group } from "k6";

import { PartyUrnQueryBuilder } from "../../../clients/register/index.js";
import { getItemFromList, getOptions, requireEnv } from "../../../helpers.js";
import { RegisterBuildingBlocks } from "../../building-blocks/register/index.js";
import { getLookupClient, getUsernames } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const label = { step: "test-lookup-on-username" };

export const options = getOptions([label]);

function assertLookupResult(parties, expectedUsername) {
    const okShape = check(parties, {
        "Register lookup found exactly one party": (p) =>
            Array.isArray(p) && p.length === 1,
    });
    if (!okShape) {
        fail("Register lookup did not return a single party");
    }

    const party = parties[0];

    const okHard = check(party, {
        "partyType is self-identified-user": (p) =>
            p.partyType === "self-identified-user",
        "displayName matches testdata username": (p) =>
            p.displayName === expectedUsername,
    });

    const okUserHard = check(party.user, {
        "user.username matches testdata username": (u) =>
            u?.username === expectedUsername,
    });

    if (!(okHard && okUserHard)) {
        console.log(JSON.stringify(party));
    }
}

export function setup() {
    requireEnv(["BASE_URL", "ENVIRONMENT", "REGISTER_SUBSCRIPTION_KEY"]);

    return getUsernames(__ENV.ENVIRONMENT);
}

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
