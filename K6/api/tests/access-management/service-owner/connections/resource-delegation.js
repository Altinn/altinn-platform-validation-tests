import { fail, group } from "k6";

import { GetResourceRightsQueryBuilder, ServiceOwnerResourceDelegationBuilder } from "../../../../../clients/access-management/service-owner/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { ConnectionsCreateResource, ConnectionsGetResourceRights, ConnectionsRevokeResource } from "../../../../building-blocks/access-management/service-owner/connections/index.js";
import { ConnectionsDomainChecks } from "../../../../domain-checks/access-management/service-owner/connections.js";
import { getClients, getServiceOwnerTokenOpts, setup } from "./common.js";

export { setup };

const getRightsLabel = { step: "1. Get resource rights" };
const createDelegationLabel = { step: "2. Create resource delegation" };
const revokeDelegationLabel = { step: "3. Revoke resource delegation" };

// One iteration per row in recipients/<env>.csv, so a functional run covers the
// organization leg and the person leg. getItemFromList walks the fixture by
// __ITER, so fewer iterations than rows silently leaves the later rows untested.
// Smoke and breakpoint runs set their own count through ITERATIONS.
const ITERATIONS = __ENV.ITERATIONS ? parseInt(__ENV.ITERATIONS) : 2;

export const options = {
    ...getOptions([
        getRightsLabel,
        createDelegationLabel,
        revokeDelegationLabel,
    ]),
    scenarios: {
        default: {
            executor: "shared-iterations",
            vus: 1,
            iterations: ITERATIONS,
        },
    },
};

/**
 * Builds the delegation request for one service owner and one recipient.
 *
 * The recipient decides which of the builder's typed party methods is used, so
 * the urn prefix is never spelled out at the call site. Shared with teardown,
 * which has to rebuild a request it never saw created.
 *
 * @param {import("./common.js").ServiceOwnerRow} serviceOwner The service owner.
 * @param {import("./common.js").RecipientRow} recipient The receiving party.
 * @param {Array<string>|null} [rightKeys] Right keys to delegate, or null to
 * address the whole delegation, which is what revoking takes.
 * @returns {*} The delegation payload.
 */
function delegationRequest(serviceOwner, recipient, rightKeys = null) {
    const builder = new ServiceOwnerResourceDelegationBuilder()
        .WithFromOrganization(serviceOwner.fromOrganizationNumber)
        .WithResource(serviceOwner.resource);

    if (recipient.recipientType === "person") {
        builder.WithToPerson(recipient.recipientIdentifier);
    } else {
        builder.WithToOrganization(recipient.recipientIdentifier);
    }

    if (rightKeys !== null) {
        builder.WithRightKeys({ directRightKeys: rightKeys });
    }

    return builder.Build();
}

/**
 * Tests the service owner resource delegation lifecycle.
 *
 * One service owner and one recipient per iteration, both drawn by __ITER, so
 * the test scales the way a smoke or breakpoint run expects and a functional run
 * covers every recipient across its iterations.
 *
 * @param {ReturnType<typeof setup>} data Environment-specific test data.
 */
export default function (data) {
    const serviceOwner = getItemFromList(data.serviceOwners);
    const recipient = getItemFromList(data.recipients);
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getServiceOwnerTokenOpts(serviceOwner));

    group(`Resource delegation to a ${recipient.recipientType}`, function () {
        const rights = ConnectionsGetResourceRights(
            connections,
            new GetResourceRightsQueryBuilder()
                .WithResource(serviceOwner.resource)
                .Build(),
            getRightsLabel,
        );

        const rightKeys = rights
            .map((right) => right.key)
            .filter((key) => key !== null);

        // Without right keys there is nothing to delegate, so the create below
        // would only report a second failure for the same cause.
        if (rightKeys.length === 0) {
            fail(`No rights found for resource ${serviceOwner.resource}`);
        }

        const assignment = ConnectionsCreateResource(
            connections,
            delegationRequest(serviceOwner, recipient, rightKeys),
            createDelegationLabel,
        );

        ConnectionsDomainChecks.CheckResourceDelegationCreated(
            assignment,
            "ConnectionsCreateResource",
        );
    });
}

/**
 * Removes every delegation a run may have left behind.
 *
 * k6 runs teardown once after all iterations, including when an iteration fails
 * partway through, which is the case the ordinary path cannot clean up after.
 * Revoke removes the complete resource delegation, so right keys are left off.
 *
 * This is the one place the whole fixture is walked rather than one row per
 * iteration: teardown does not know which rows the run reached, and a row that
 * has nothing to remove costs one 204.
 *
 * @param {ReturnType<typeof setup>} data Environment-specific test data.
 */
export function teardown(data) {
    const { connections, tokenGenerator } = getClients();

    data.serviceOwners.forEach((serviceOwner) => {
        tokenGenerator.setTokenGeneratorOptions(getServiceOwnerTokenOpts(serviceOwner));

        data.recipients.forEach((recipient) => {
            ConnectionsRevokeResource(
                connections,
                delegationRequest(serviceOwner, recipient),
                revokeDelegationLabel,
            );
        });
    });
}
