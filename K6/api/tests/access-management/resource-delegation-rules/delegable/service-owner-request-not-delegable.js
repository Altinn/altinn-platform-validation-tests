import { group } from "k6";

import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { RequestCreateResourceRequest } from "../../../../building-blocks/access-management/service-owner/request/index.js";
import {
    ProblemCode,
    ResourceDelegationDomainChecks,
} from "../../../../domain-checks/access-management/resource-delegation.js";
import { getServiceOwnerClients, setup } from "../common.js";
import { NOT_DELEGABLE_RESOURCE } from "../resources.js";

export { setup };

const requestLabel = { step: "1. Service owner requests the resource" };

export const options = getOptions([requestLabel]);

/**
 * Test: a service owner cannot create an access request for a resource marked
 * as not delegable (Altinn/altinn-auth#4792).
 *
 * The service owner is the resource's owner and asks on behalf of the daglig
 * leder, at their own organization, so the flag is the only reason for the
 * refusal: 400 with AM.VLD-00049. A request that is wrongly accepted is not
 * left to pile up: asking again while one is open returns that same request.
 *
 * Run k6-not-delegable-resource through create-resources.js first.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const user = getItemFromList(data.users);
    const { request } = getServiceOwnerClients();

    group("A service owner cannot request a resource that is not delegable", function () {
        ResourceDelegationDomainChecks.CheckProblemCode(
            RequestCreateResourceRequest(
                request,
                {
                    from: `urn:altinn:person:identifier-no:${user.pid}`,
                    to: `urn:altinn:organization:identifier-no:${user.orgNo}`,
                    resource: NOT_DELEGABLE_RESOURCE,
                    rightKeys: null,
                },
                400,
                requestLabel,
            ),
            ProblemCode.ResourceIsNotDelegable,
            "RequestCreateResourceRequest",
        );
    });
}
