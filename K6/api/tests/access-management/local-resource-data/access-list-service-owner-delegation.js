import { group } from "k6";

import {
    GetResourceRightsQueryBuilder,
    ServiceOwnerResourceDelegationBuilder,
} from "../../../../clients/access-management/service-owner/connections/index.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
import {
    ConnectionsGetResourceRights,
    ConnectionsRevokeResource,
} from "../../../building-blocks/access-management/service-owner/connections/index.js";
import { ExpectProblem } from "../../../building-blocks/common/expect-problem.js";
import {
    ProblemCode,
    ResourceDelegationDomainChecks,
} from "../../../domain-checks/access-management/resource-delegation.js";
import { ConnectionsDomainChecks } from "../../../domain-checks/access-management/service-owner/connections.js";
import { getServiceOwnerClients, setup } from "./common.js";
import { DELEGABLE_ACCESS_LIST_RESOURCE } from "./resources.js";

export { setup };

const rightsLabel = { step: "1. Service owner gets the rights on the resource" };
const delegateLabel = { step: "2. Service owner delegates from an organization on no list" };
const cleanupLabel = { step: "Cleanup - revoke what should have been refused" };

export const options = getOptions([rightsLabel, delegateLabel, cleanupLabel]);

/**
 * Test: a service owner cannot delegate a resource with access lists enforced
 * from an organization that is on none of its lists (Altinn/altinn-auth#4186).
 *
 * Such a delegation can never be used: the decision point refuses the recipient,
 * since the organization the right comes from is not on the list. The API is
 * meant to say so up front, with 400 AM-00053.
 *
 * On 2026-11-16 it still answered 200 in at22 and at23: the fix, PR #4831, was
 * approved but not merged. Until it is deployed this test fails by design, so it
 * is not in functional.yaml or run-all.js yet. Add it to both once the fix is
 * out, and it guards the fix from then on. The check sits in the same code
 * Altinn/altinn-auth#4790 and #4896 change, which is where it could break again.
 *
 * The organization is the first row of the test data, which is never put on a
 * list. A delegation that is wrongly accepted is revoked on the spot.
 *
 * Run k6-access-list-resource through create-resources.js first.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const from = getItemFromList(data.users);
    const to = data.users[data.users.length - 1];
    const { connections } = getServiceOwnerClients();

    group("Service owner delegation from an organization on no access list is refused", function () {
        const rights = ConnectionsGetResourceRights(
            connections,
            new GetResourceRightsQueryBuilder().WithResource(DELEGABLE_ACCESS_LIST_RESOURCE).Build(),
            rightsLabel,
        );

        // Without rights to put on the delegation, a refusal would say nothing
        // about the access list.
        if (!ConnectionsDomainChecks.CheckDelegableRightsFound(rights, DELEGABLE_ACCESS_LIST_RESOURCE)) {
            return;
        }

        const builder = () => new ServiceOwnerResourceDelegationBuilder()
            .WithFromOrganization(from.orgNo)
            .WithToPerson(to.pid)
            .WithResource(DELEGABLE_ACCESS_LIST_RESOURCE);

        const answer = ExpectProblem(
            () => connections.ConnectionsCreateResource(
                builder()
                    .WithRightKeys({ directRightKeys: rights.map((right) => right.key).filter((key) => key !== null) })
                    .Build(),
                delegateLabel,
            ),
            "ConnectionsCreateResource (organization on no access list)",
            400,
        );

        ResourceDelegationDomainChecks.CheckProblemCode(
            answer,
            ProblemCode.FromPartyNotOnAccessList,
            "ConnectionsCreateResource (organization on no access list)",
        );

        if (answer?.id) {
            ConnectionsRevokeResource(connections, builder().Build(), cleanupLabel);
        }
    });
}
