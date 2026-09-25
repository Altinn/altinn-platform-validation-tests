import { group } from "k6";

import { GetResourceRightsQueryBuilder } from "../../../../../clients/access-management/service-owner/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { ConnectionsCreateResource, ConnectionsGetResourceRights } from "../../../../building-blocks/access-management/service-owner/connections/index.js";
import { ConnectionsDomainChecks } from "../../../../domain-checks/access-management/service-owner/connections.js";
import { delegationRequest, getClients, getServiceOwnerTokenOpts, recipientsForVu, revokeDelegations, setup } from "./common.js";

export { setup };

/**
 * The recipient type this test covers, and so the rows its teardown sweeps.
 *
 * functional.yaml lists this test and its organization sibling as their own test
 * definitions, so they run as two k6 processes at the same time. Each one keeps
 * to its own recipient type, so neither revokes what the other just created.
 */
const RECIPIENT_TYPE = "person";

const getRightsLabel = { step: "1. Get resource rights" };
const createDelegationLabel = { step: "2. Create resource delegation" };
const revokeDelegationLabel = { step: "3. Revoke resource delegation" };

export const options = getOptions([
    getRightsLabel,
    createDelegationLabel,
    revokeDelegationLabel,
]);

/**
 * Test: the service owner delegates the resource to a person.
 *
 * One service owner and one recipient per iteration, both drawn by __ITER, so
 * the test scales the way a smoke or breakpoint run expects. How many iterations
 * a run gets is set by functional.yaml and smoke.yaml, not here.
 *
 * @param {ReturnType<typeof setup>} data Environment-specific test data.
 * @returns {void}
 */
export default function (data) {
    const serviceOwner = getItemFromList(data.serviceOwners);
    // This VU's own slice, so two VUs never draw the same recipient on the same
    // iteration and write the one delegation twice.
    const recipient = getItemFromList(recipientsForVu(data, RECIPIENT_TYPE));
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getServiceOwnerTokenOpts(serviceOwner));

    group(`Resource delegation to ${RECIPIENT_TYPE}`, function () {
        const rights = ConnectionsGetResourceRights(
            connections,
            new GetResourceRightsQueryBuilder()
                .WithResource(serviceOwner.resource)
                .Build(),
            getRightsLabel,
        );

        // Without a delegable right there is nothing to put on the delegation, so
        // the create below would only report a second failure for the same cause.
        if (!ConnectionsDomainChecks.CheckDelegableRightsFound(rights, serviceOwner.resource)) {
            return;
        }

        ConnectionsDomainChecks.CheckResourceDelegationCreated(
            ConnectionsCreateResource(
                connections,
                delegationRequest(serviceOwner, recipient, rights),
                createDelegationLabel,
            ),
        );
    });
}

/**
 * Removes any delegation to a person the run left behind.
 *
 * @param {ReturnType<typeof setup>} data Environment-specific test data.
 * @returns {void}
 */
export function teardown(data) {
    revokeDelegations(data, RECIPIENT_TYPE, revokeDelegationLabel);
}
