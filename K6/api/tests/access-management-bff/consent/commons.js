
import { ConsentClient } from "../../../../clients/access-management-bff/consent/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../common-imports.js";
import { fetchTestData, getNumberOfVUs, requireEnv, segmentData } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";

/*
* The users in this list have been selected based on the number of consent requests they have.
* The user with the most consent requests has 879, and the one with the least has 100.
* Only from yt01, and will be used in the worst case scenarios tests
*/
export const worst_case_users = [
    {
        userId: "4503247",
        partyUuid: "7274d8d6-231a-42a6-b311-0d3a425268ef",
        label: "a_4503247_879",
    },
    {
        userId: "4547151",
        partyUuid: "1d536653-c312-4b6d-8b78-a260120beab3",
        label: "b_4547151_787",
    },
    {
        userId: "4540067",
        partyUuid: "3f392def-da31-4284-af0d-1bcca530c81c",
        label: "c_4540067_622",
    },
    {
        userId: "4549387",
        partyUuid: "20451a46-0aa8-4d55-b620-f7aef42657c5",
        label: "d_4549387_502",
    },
    {
        userId: "4552870",
        partyUuid: "11212f3e-db43-40cb-9622-ad3ca3e97fe6",
        label: "e_4552870_385",
    },
    {
        userId: "4566849",
        partyUuid: "1f9e7773-3da7-45f4-8754-2ea5e00719e0",
        label: "f_4566849_250",
    },
    {
        userId: "4549665",
        partyUuid: "d757c6ab-9079-4762-b8e5-054094b30354",
        label: "g_4549665_100",
    }
];

/**
 * @type {ConsentClient | undefined}
 */
let consentClient = undefined;

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * Creates and caches the client these tests read with.
 *
 * Built once per VU and reused across its iterations. The client is stateless, so
 * only the token generator carries anything that changes: the user an iteration
 * reads as, swapped with setTokenGeneratorOptions and getTokenOpts. The cache is
 * keyed on the options, so each user still gets its own cached token.
 *
 * @returns {[ConsentClient, PersonalTokenGenerator]} The client, and the generator whose user is swapped per iteration.
 */
export function getClients() {
    if (consentClient === undefined) {
        tokenGenerator = new PersonalTokenGenerator(
            new PersonalTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
                .build(),
        );

        consentClient = new ConsentClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }

    return [consentClient, tokenGenerator];
}

/**
 * Token options for reading as one of the users.
 *
 * @param {string} userId - The user the iteration reads as.
 * @param {string} partyUuid - The party that user reads for.
 * @returns {object} Options to hand to setTokenGeneratorOptions.
 */
export function getTokenOpts(userId, partyUuid) {
    return new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
        .withUserId(userId)
        .withPartyUuid(partyUuid)
        .build();
}

/**
 * Fetches the users these tests read as, one slice per VU.
 *
 * Segmented rather than flat, so two VUs do not spend the run reading for the same
 * user and measuring a warm cache.
 *
 * @returns {object[][]} The users, one slice per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "AM_UI_BASE_URL"]);

    const numberOfVUs = getNumberOfVUs();

    const data = fetchTestData(`authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid-v2.csv`);

    return segmentData(data, numberOfVUs);
}
