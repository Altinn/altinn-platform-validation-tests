import { check, fail, group } from "k6";
import http from "k6/http";

import { EnhetsregisteretClient, RegisterClient } from "../../../clients/register/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../common-imports.js";
import { getItemFromList, parseCsvData, requireEnv, retry } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";
import {
    EnhetsregisteretBuildingBlocks,
    RegisterBuildingBlocks,
} from "../../building-blocks/register/index.js";

/**
 * The body shared by the three tests that check that a role change in ER
 * (Enhetsregisteret / Brønnøysundregistrene) reaches Altinn Register. One file per
 * role rather than one test looping all three, since a single role already takes
 * a few minutes of waiting for the propagation and a failure should name the role
 * it happened for.
 *
 * @requires ENV.ENVIRONMENT - Target environment (e.g. tt02, yt01, at22, at23)
 * @requires ENV.BASE_URL - Base URL for the Register API
 * @requires ENV.REGISTER_SUBSCRIPTION_KEY - Subscription key for the Register API
 * @requires ENV.SOAP_ER_USERNAME - Username for the ER SOAP API
 * @requires ENV.SOAP_ER_PASSWORD - Password for the ER SOAP API
 */

/**
 * Fetches the facilitators for one role. The file holds ten per role, all
 * verified to have customers in the environment when it was generated.
 *
 * Read from main on GitHub rather than from disk, the way the other tests do, so
 * a branch-only edit to the file changes nothing until it is merged.
 *
 * @param {string} ccrRole The role to pick facilitators for.
 * @returns {Array<{partyUuid: string, org: string, role: string}>} The facilitators.
 */
export function fetchFacilitators(ccrRole) {
    requireEnv([
        "BASE_URL",
        "ENVIRONMENT",
        "REGISTER_SUBSCRIPTION_KEY",
        "SOAP_ER_PASSWORD",
        "SOAP_ER_USERNAME",
    ]);

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/register/ccr-facilitators-${__ENV.ENVIRONMENT}.csv`,
        { tags: { action: "fetch-test-data" } },
    );

    const facilitators = parseCsvData(res.body).filter(
        (facilitator) => facilitator.role === ccrRole,
    );

    if (facilitators.length === 0) {
        fail(`cannot continue: no ${ccrRole} facilitators in the test data`);
    }

    return facilitators;
}

/**
 * Removes one of a facilitator's customers in ER, waits for Register to drop it,
 * then puts it back and waits for Register to have it again.
 *
 * The role is removed from a customer the facilitator already has, so the test
 * leaves the environment as it found it. That also means a failure between the
 * two halves leaves a customer short of a facilitator, which the failure says.
 *
 * @param {string} ccrRole The role under test.
 * @param {Array<{partyUuid: string, org: string}>} facilitators From fetchFacilitators.
 * @param {{[key: string]: string}} label Request label for this test.
 */
export function runAddRemoveCcrRoleForClient(ccrRole, facilitators, label) {
    const facilitator = getItemFromList(facilitators);

    group(`Remove ${ccrRole} in ER and make sure Register reflects it`, () => {
        const scopes = CreateScopeString([AltinnScopes.REGISTER.PARTYLOOKUP.ADMIN]);

        const options = new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(scopes)
            .withPid(22877497392)
            .build();

        const registerClient = new RegisterClient(
            __ENV.BASE_URL,
            new PersonalTokenGenerator(options),
            __ENV.REGISTER_SUBSCRIPTION_KEY,
        );

        const enhetsregisteretClient = new EnhetsregisteretClient(__ENV.BASE_URL);

        const facilitatorPartyUuid = facilitator.partyUuid;
        const facilitatorOrg = facilitator.org;

        // The customers are organizations, so the organization number is what ER
        // takes and what the assertions below compare on.
        const currentOrgs = customerOrganizationNumbers(
            registerClient,
            facilitatorPartyUuid,
            ccrRole,
            label,
        );

        if (currentOrgs === null) {
            fail(`cannot continue: reading the ${ccrRole} customers failed`);
        }

        console.log(
            `Initial number of ${ccrRole} customers for ${facilitatorOrg}: ${currentOrgs.length}`,
        );

        if (currentOrgs.length === 0) {
            fail(
                `cannot continue: ${facilitatorOrg} has no ${ccrRole} customers to test with`,
            );
        }

        const targetOrg = currentOrgs[0];
        console.log(`Picked target client organizationIdentifier: ${targetOrg}`);

        const removed = EnhetsregisteretBuildingBlocks.RemoveCcrRoleFromEr(
            enhetsregisteretClient,
            __ENV.SOAP_ER_USERNAME,
            __ENV.SOAP_ER_PASSWORD,
            ccrRole,
            targetOrg,
            facilitatorOrg,
            label,
        );

        // Waiting for a propagation that was never started only spends ten retries
        // to arrive at the failure ER already reported.
        if (!removed) {
            fail(`cannot continue: ER did not process removing ${ccrRole}`);
        }

        let success = retry(
            () => {
                const orgs = customerOrganizationNumbers(
                    registerClient,
                    facilitatorPartyUuid,
                    ccrRole,
                    label,
                );

                // A failed read says nothing about the role, so keep waiting rather
                // than read the empty result as the removal having gone through.
                if (orgs === null) {
                    return false;
                }

                const stillPresent = orgs.includes(targetOrg);
                console.log(
                    `[remove ${ccrRole}] Org ${targetOrg} is ${stillPresent ? "still" : "no longer"
                    } in the list (${orgs.length})`,
                );
                return !stillPresent;
            },
            {
                retries: 10,
                intervalSeconds: 20,
                testscenario: `remove ${ccrRole} role`,
            },
        );

        check(success, {
            [`${ccrRole} role was successfully removed`]: (s) => s === true,
        });

        const addedBack = EnhetsregisteretBuildingBlocks.AddCcrRoleToEr(
            enhetsregisteretClient,
            __ENV.SOAP_ER_USERNAME,
            __ENV.SOAP_ER_PASSWORD,
            ccrRole,
            targetOrg,
            facilitatorOrg,
            label,
        );

        // The role is left removed at this point, so say so loudly: the next run
        // picks a target from a list this one changed.
        if (!addedBack) {
            fail(
                `ER did not process putting ${ccrRole} back, ${targetOrg} is left without ${facilitatorOrg} as its ${ccrRole}`,
            );
        }

        success = retry(
            () => {
                const orgs = customerOrganizationNumbers(
                    registerClient,
                    facilitatorPartyUuid,
                    ccrRole,
                    label,
                );

                if (orgs === null) {
                    return false;
                }

                const nowPresent = orgs.includes(targetOrg);
                console.log(
                    `[add ${ccrRole}] Org ${targetOrg} is ${nowPresent ? "now" : "still not"
                    } in the list (${orgs.length})`,
                );
                return nowPresent;
            },
            {
                retries: 10,
                intervalSeconds: 30,
                testscenario: `add ${ccrRole} role back`,
            },
        );

        check(success, {
            [`${ccrRole} role was successfully added back`]: (s) => s === true,
        });
    });
}

/**
 * Organization numbers of the parties that have this facilitator in the given
 * role.
 *
 * @param {RegisterClient} registerClient Client for the Register API.
 * @param {string} facilitatorPartyUuid The facilitator party UUID.
 * @param {string} ccrRole The role the customers have assigned.
 * @param {{[key: string]: string}} label Request label for this test.
 * @returns {Array<string>|null} Organization numbers, or null when the call failed.
 */
function customerOrganizationNumbers(
    registerClient,
    facilitatorPartyUuid,
    ccrRole,
    label,
) {
    const customers = RegisterBuildingBlocks.GetCustomers(
        registerClient,
        facilitatorPartyUuid,
        ccrRole,
        // Only the organization number is compared on, and a facilitator can have
        // thousands of customers, so ask for as little as possible.
        ["org-id"],
        label,
    );

    if (customers === null) {
        return null;
    }

    return customers.map((customer) => customer.organizationIdentifier);
}
