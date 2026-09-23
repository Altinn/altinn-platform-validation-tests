import { fail, group } from "k6";

import { GetResourceRightsQueryBuilder, ServiceOwnerResourceDelegationBuilder } from "../../../../../clients/access-management/service-owner/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { ConnectionsCreateResource, ConnectionsGetResourceRights, ConnectionsRevokeResource } from "../../../../building-blocks/access-management/service-owner/connections/index.js";
import { getClients, getServiceOwnerTokenOpts, setup } from "./common.js";

export { setup };

const getRightsLabel = { step: "1. Get resource rights" };
const createDelegationLabel = { step: "2. Create resource delegation" };
const revokeDelegationLabel = { step: "3. Revoke resource delegation" };

export const options = getOptions([
    getRightsLabel,
    createDelegationLabel,
    revokeDelegationLabel,
]);

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
 * Every recipient in the fixture is exercised in the same iteration rather than
 * one per iteration, so a run covers both the organization and the person leg
 * even at the one iteration a functional test defaults to.
 *
 * @param {ReturnType<typeof setup>} data Environment-specific test data.
 */
export default function (data) {
    const serviceOwner = getItemFromList(data.serviceOwners, true);
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getServiceOwnerTokenOpts(serviceOwner));

    const rights = group("1. Get resource rights", function () {
        return ConnectionsGetResourceRights(
            connections,
            new GetResourceRightsQueryBuilder()
                .WithResource(serviceOwner.resource)
                .Build(),
            getRightsLabel,
        );
    });

    const rightKeys = rights
        .map((right) => right.key)
        .filter((key) => key !== null);

    if (rightKeys.length === 0) {
        fail(`No rights found for resource ${serviceOwner.resource}`);
    }

    data.recipients.forEach((recipient) => {
        group(`Resource delegation to a ${recipient.recipientType}`, function () {
            const assignment = ConnectionsCreateResource(
                connections,
                delegationRequest(serviceOwner, recipient, rightKeys),
                createDelegationLabel,
            );

            if (assignment === null) {
                fail(
                    `Resource delegation to ${recipient.recipientType} ${recipient.recipientIdentifier} was not created`,
                );
            }
        });
    });
}

/**
 * Removes every delegation a run may have left behind.
 *
 * k6 runs teardown once after all iterations, including when an iteration fails
 * partway through, which is the case the ordinary path cannot clean up after.
 * Revoke removes the complete resource delegation, so right keys are left off.
 *
 * The fixture is small enough that sweeping all of it is the same set an
 * iteration could have reached, so this sweeps every service owner and recipient
 * pair rather than tracking which ones were used.
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
