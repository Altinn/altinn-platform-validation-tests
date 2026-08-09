import { fail, group } from "k6";

import { EnhetsregisteretClient, RegisterClient } from "../../../clients/register/index.js";
import { getItemFromList, getOptions, requireEnv } from "../../../helpers.js";
import { EnhetsregisteretBuildingBlocks } from "../../building-blocks/register/index.js";
import { CcrRoleDomainChecks } from "../../domain-checks/register/ccr-role.js";
import {
    drawCustomerToMove,
    getEnhetsregisteretClient,
    getFacilitators,
    getPartyLookupAdminClient,
    waitForRegister,
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
    const targetOrg = drawCustomerToMove(
        registerClient,
        ccrRole,
        facilitator,
        randomize,
        label,
    );

    removeRoleAndWait(
        registerClient,
        enhetsregisteretClient,
        ccrRole,
        facilitator,
        targetOrg,
    );

    addRoleBackAndWait(
        registerClient,
        enhetsregisteretClient,
        ccrRole,
        facilitator,
        targetOrg,
    );
}

/**
 * Removes the role in ER and waits for Register to drop the customer.
 *
 * @param {RegisterClient} registerClient Client for the Register API.
 * @param {EnhetsregisteretClient} enhetsregisteretClient Client for the ER update service.
 * @param {string} ccrRole The role under test, e.g. "revisor".
 * @param {{partyUuid: string, org: string}} facilitator The facilitator to use.
 * @param {string} targetOrg Organization number of the customer to remove.
 */
function removeRoleAndWait(
    registerClient,
    enhetsregisteretClient,
    ccrRole,
    facilitator,
    targetOrg,
) {
    // The role is in the group name, and it is one of the three rather than all of
    // them, so a summary cannot be read as covering roles this iteration never drew.
    group(`Remove the drawn role ${ccrRole} in ER and make sure Register drops it`, () => {
        const removed = EnhetsregisteretBuildingBlocks.RemoveCcrRoleFromEr(
            enhetsregisteretClient,
            __ENV.SOAP_ER_USERNAME,
            __ENV.SOAP_ER_PASSWORD,
            ccrRole,
            targetOrg,
            facilitator.org,
            label,
        );

        // Waiting for a propagation that was never started only spends the retries
        // to arrive at the failure ER already reported.
        if (!removed) {
            fail(`cannot continue: ER did not process removing ${ccrRole}`);
        }

        const propagated = waitForRegister(
            registerClient,
            ccrRole,
            facilitator,
            targetOrg,
            false,
            `remove ${ccrRole} role`,
            label,
        );

        CcrRoleDomainChecks.CheckRoleRemoved(propagated, ccrRole);
    });
}

/**
 * Puts the role back in ER and waits for Register to have the customer again, so
 * the environment is left as the test found it.
 *
 * @param {RegisterClient} registerClient Client for the Register API.
 * @param {EnhetsregisteretClient} enhetsregisteretClient Client for the ER update service.
 * @param {string} ccrRole The role under test, e.g. "revisor".
 * @param {{partyUuid: string, org: string}} facilitator The facilitator to use.
 * @param {string} targetOrg Organization number of the customer to add back.
 */
function addRoleBackAndWait(
    registerClient,
    enhetsregisteretClient,
    ccrRole,
    facilitator,
    targetOrg,
) {
    group(`Put the drawn role ${ccrRole} back in ER and make sure Register has it again`, () => {
        const addedBack = EnhetsregisteretBuildingBlocks.AddCcrRoleToEr(
            enhetsregisteretClient,
            __ENV.SOAP_ER_USERNAME,
            __ENV.SOAP_ER_PASSWORD,
            ccrRole,
            targetOrg,
            facilitator.org,
            label,
        );

        // The role is left removed at this point, so say so loudly: the next run
        // picks a target from a list this one changed.
        if (!addedBack) {
            fail(
                `ER did not process putting ${ccrRole} back, ${targetOrg} is left without ${facilitator.org} as its ${ccrRole}`,
            );
        }

        const propagated = waitForRegister(
            registerClient,
            ccrRole,
            facilitator,
            targetOrg,
            true,
            `add ${ccrRole} role back`,
            label,
        );

        CcrRoleDomainChecks.CheckRoleAddedBack(propagated, ccrRole);
    });
}

