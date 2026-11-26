import { group } from "k6";

import {
    GetResourceRightsQueryBuilder,
    ServiceOwnerResourceDelegationBuilder,
} from "../../../../../clients/access-management/service-owner/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import {
    ConnectionsCreateResource,
    ConnectionsGetResourceRights,
    ConnectionsRevokeResource,
} from "../../../../building-blocks/access-management/service-owner/connections/index.js";
import {
    ProblemCode,
    ResourceDelegationDomainChecks,
} from "../../../../domain-checks/access-management/resource-delegation.js";
import { getServiceOwnerClients, setup } from "../common.js";
import { NOT_DELEGABLE_RESOURCE } from "../resources.js";

export { setup };

const rightsLabel = { step: "1. Service owner gets the rights on the resource" };
const delegateLabel = { step: "2. Service owner delegates the resource" };
const cleanupLabel = { step: "Cleanup - revoke in case it was wrongly accepted" };

export const options = getOptions([rightsLabel, delegateLabel, cleanupLabel]);

/**
 * Test: the service owner cannot list rights on, or delegate, a resource marked
 * as not delegable (Altinn/altinn-auth#4790, #4896).
 *
 * Both answer 400 AM-00042. The service owner is the resource's owner, so the
 * flag is the only reason for the refusal. The delegation is revoked afterwards
 * either way, so one that was wrongly accepted is not left behind; revoking one
 * that was never created is harmless.
 *
 * Run k6-not-delegable-resource through create-resources.js first.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const user = getItemFromList(data.users);
    const { connections } = getServiceOwnerClients();

    group("The service owner cannot delegate a resource that is not delegable", function () {
        ResourceDelegationDomainChecks.CheckProblemCode(
            ConnectionsGetResourceRights(
                connections,
                new GetResourceRightsQueryBuilder().WithResource(NOT_DELEGABLE_RESOURCE).Build(),
                400,
                rightsLabel,
            ),
            ProblemCode.ResourceNotDelegable,
            "ConnectionsGetResourceRights",
        );

        const delegation = new ServiceOwnerResourceDelegationBuilder()
            .WithFromOrganization(user.orgNo)
            .WithToPerson(user.pid)
            .WithResource(NOT_DELEGABLE_RESOURCE)
            .Build();

        ResourceDelegationDomainChecks.CheckProblemCode(
            ConnectionsCreateResource(connections, delegation, 400, delegateLabel),
            ProblemCode.ResourceNotDelegable,
            "ConnectionsCreateResource",
        );

        ConnectionsRevokeResource(connections, delegation, cleanupLabel);
    });
}
