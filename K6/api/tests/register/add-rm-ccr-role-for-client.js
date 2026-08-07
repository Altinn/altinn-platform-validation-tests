import { check, fail, group } from "k6";

import {
    CcrCustomerRoles,
    EnhetsregisteretClient,
    RegisterClient,
} from "../../../clients/register/index.js";
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
 * All three facilitator roles run in one file: propagation lands in seconds, and
 * the requests carry the role in a `ccrRole` tag, so the roles can be told apart
 * in the metrics without being told apart in the test files.
 */

const label = { step: "test-add-rm-ccr-role" };

export const options = getOptions([label]);

const ROLES = [
    CcrCustomerRoles.REVISOR,
    CcrCustomerRoles.REGNSKAPSFORER,
    CcrCustomerRoles.FORRETNINGSFORER,
];

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
    const registerClient = getPartyLookupAdminClient();
    const enhetsregisteretClient = getEnhetsregisteretClient();

    // Each role is given its own turn even when an earlier one gave up, so one
    // broken role does not hide the state of the other two. The iteration still
    // fails, once, after all three have been tried.
    const failures = [];

    for (const ccrRole of ROLES) {
        const candidates = facilitators.filter((f) => f.role === ccrRole);

        if (candidates.length === 0) {
            failures.push(`no ${ccrRole} facilitators in the test data`);
            continue;
        }

        const problem = addRemoveRoleForClient(
            registerClient,
            enhetsregisteretClient,
            ccrRole,
            getItemFromList(candidates),
        );

        if (problem !== null) {
            failures.push(problem);
        }
    }

    if (failures.length > 0) {
        fail(failures.join("; "));
    }
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
 * @param {string} ccrRole The role under test.
 * @param {{partyUuid: string, org: string}} facilitator The facilitator to use.
 * @returns {string|null} What stopped it, or null when it ran to the end. Returned
 * rather than failed on, so the caller can still give the other roles their turn.
 */
function addRemoveRoleForClient(
    registerClient,
    enhetsregisteretClient,
    ccrRole,
    facilitator,
) {
    /** @type {string|null} */
    let problem = null;

    // CCR = enhetsregister-rolle
    group(`Remove ${ccrRole} in ER and make sure Register reflects it`, () => {
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
            problem = `reading the ${ccrRole} customers failed`;
            return;
        }

        console.log(
            `Initial number of ${ccrRole} customers for ${facilitatorOrg}: ${currentOrgs.length}`,
        );

        if (currentOrgs.length === 0) {
            problem = `${facilitatorOrg} has no ${ccrRole} customers to test with`;
            return;
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

        // Waiting for a propagation that was never started only spends the retries
        // to arrive at the failure ER already reported.
        if (!removed) {
            problem = `ER did not process removing ${ccrRole}`;
            return;
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
            problem = `ER did not process putting ${ccrRole} back, ${targetOrg} is left without ${facilitatorOrg} as its ${ccrRole}`;
            return;
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

    return problem;
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
 * @param {string} ccrRole The role the customers have assigned.
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
