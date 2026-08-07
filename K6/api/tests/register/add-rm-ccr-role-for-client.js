import { check, fail, group } from "k6";

import { EnhetsregisteretClient, RegisterClient } from "../../../clients/register/index.js";
import { getItemFromList, getOptions, requireEnv, retry } from "../../../helpers.js";
import {
    EnhetsregisteretBuildingBlocks,
    RegisterBuildingBlocks,
} from "../../building-blocks/register/index.js";
import {
    getEnhetsregisteretClient,
    getFacilitators,
    getPartyLookupAdminClient,
} from "./commons.js";

/**
 * @file add-rm-ccr-role-for-client.js
 * @requires ENV.ENVIRONMENT - Target environment (e.g. tt02, yt01, at22, at23)
 * @requires ENV.BASE_URL - Base URL for the Register API
 * @requires ENV.REGISTER_SUBSCRIPTION_KEY - Subscription key for the Register API
 * @requires ENV.SOAP_ER_USERNAME - Username for the ER SOAP API
 * @requires ENV.SOAP_ER_PASSWORD - Password for the ER SOAP API
 * @description Verifies that role changes in ER (Enhetsregisteret / Brønnøysundregisteret)
 * are correctly propagated to Altinn's internal Register component.
 *
 * The test simulates a real-world ER event by removing a facilitator role from a
 * client organization via the ER SOAP API, then verifying that Altinn Register
 * reflects the removal. The role is subsequently re-added to leave the system in
 * its original state, verifying that it's present again in the Register.
 *
 * A `ccrRole` is one of those ER roles, named after the endpoints that serve them
 * and after ER's English name, the Central Coordinating Register: "revisor",
 * "regnskapsforer" or "forretningsforer".
 *
 * All three facilitator roles are covered by this one file. Every row of the test
 * data carries its role, so an iteration takes the role of the facilitator it drew
 * and the roles spread across iterations and VUs by themselves. The requests carry
 * the role in a `ccrRole` tag, so they stay apart in the metrics.
 */

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const label = { step: "test-add-rm-ccr-role" };

export const options = getOptions([label]);

export function setup() {
    requireEnv([
        "BASE_URL",
        "ENVIRONMENT",
        "REGISTER_SUBSCRIPTION_KEY",
        "SOAP_ER_PASSWORD",
        "SOAP_ER_USERNAME",
    ]);

    return getFacilitators(__ENV.ENVIRONMENT);
}

export default function (facilitators) {
    const facilitator = getItemFromList(facilitators, randomize);

    addRemoveRoleForClient(
        getPartyLookupAdminClient(),
        getEnhetsregisteretClient(),
        facilitator.role,
        facilitator,
    );
}

/**
 * Removes one of a facilitator's customers in ER, waits for Register to drop it,
 * then puts it back and waits for Register to have it again.
 *
 * The role is removed from a customer the facilitator already has, so the test
 * leaves the environment as it found it. That also means a failure between the two
 * halves leaves a customer short of a facilitator, which the failure says.
 *
 * @param {RegisterClient} registerClient Client for the Register API.
 * @param {EnhetsregisteretClient} enhetsregisteretClient Client for the ER update service.
 * @param {string} ccrRole The role under test, e.g. "revisor". One of
 * CcrCustomerRoles: revisor, regnskapsforer or forretningsforer.
 * @param {{partyUuid: string, org: string}} facilitator The facilitator to use.
 */
function addRemoveRoleForClient(
    registerClient,
    enhetsregisteretClient,
    ccrRole,
    facilitator,
) {
    // The role is in the group name, and it is one of the three rather than all of
    // them, so a summary cannot be read as covering roles this iteration never drew.
    group(`Remove the drawn role ${ccrRole} in ER and make sure Register reflects it`, () => {
        const facilitatorPartyUuid = facilitator.partyUuid;
        const facilitatorOrg = facilitator.org;

        // The customers are organizations, so the organization number is what ER
        // takes and what the assertions below compare on.
        const currentOrgs = customerOrganizationNumbers(
            registerClient,
            facilitatorPartyUuid,
            ccrRole,
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

        // Drawn the same way as the facilitator, rather than always the first one.
        // Two VUs that draw the same facilitator would otherwise target the same
        // customer, and each would see the other's removal and add-back as its own.
        const targetOrg = getItemFromList(currentOrgs, randomize);
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

        // Waiting for a propagation that was never started only spends the retries
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
            retryUntilPropagated(`remove ${ccrRole} role`),
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
            retryUntilPropagated(`add ${ccrRole} role back`),
        );

        check(success, {
            [`${ccrRole} role was successfully added back`]: (s) => s === true,
        });
    });
}

/**
 * Retry settings for waiting on a propagation. `retry` checks before it sleeps, so
 * a change that has already landed costs nothing, and short intervals only shorten
 * the overshoot. Two minutes of headroom for a propagation that normally takes
 * seconds.
 *
 * @param {string} testscenario Prefix used in log and check output.
 * @returns {{retries: number, intervalSeconds: number, testscenario: string}} Settings.
 */
function retryUntilPropagated(testscenario) {
    return {
        retries: 24,
        intervalSeconds: 5,
        testscenario: testscenario,
    };
}

/**
 * Organization numbers of the parties that have this facilitator in the given role.
 *
 * @param {RegisterClient} registerClient Client for the Register API.
 * @param {string} facilitatorPartyUuid The facilitator party UUID.
 * @param {string} ccrRole The role the customers have assigned, e.g. "revisor".
 * @returns {Array<string>|null} Organization numbers, or null when the call failed.
 */
function customerOrganizationNumbers(
    registerClient,
    facilitatorPartyUuid,
    ccrRole,
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
