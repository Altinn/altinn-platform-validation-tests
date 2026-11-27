import { group } from "k6";

import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { CreateResourceRequest } from "../../../../building-blocks/access-management/enduser/request/index.js";
import {
    ProblemCode,
    ResourceDelegationDomainChecks,
} from "../../../../domain-checks/access-management/resource-delegation.js";
import { getEnduserClients, getEnduserTokenOpts, setup } from "../common.js";
import { NOT_DELEGABLE_RESOURCE } from "../resources.js";

export { setup };

const requestLabel = { step: "1. Enduser requests the resource" };

export const options = getOptions([requestLabel]);

/**
 * Test: an enduser cannot request access to a resource marked as not delegable
 * (Altinn/altinn-auth#4791, v1 of the request API).
 *
 * The daglig leder asks for the resource for themselves at their own
 * organization. They are already connected to it through DAGL, so the flag is
 * the only validation error the request should get: 400 with AM.VLD-00049. A
 * request that is wrongly accepted is not left to pile up: asking again while
 * one is open returns that same request.
 *
 * v2 has its own test, enduser-request-v2-not-delegable.js.
 *
 * Run k6-not-delegable-resource through create-resources.js first.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const user = getItemFromList(data.users);
    const { request, tokenGenerator } = getEnduserClients();

    tokenGenerator.setTokenGeneratorOptions(getEnduserTokenOpts(user));

    group("An enduser cannot request a resource that is not delegable", function () {
        ResourceDelegationDomainChecks.CheckProblemCode(
            CreateResourceRequest(request, user.partyUuid, user.orgUuid, NOT_DELEGABLE_RESOURCE, null, 400, requestLabel),
            ProblemCode.ResourceIsNotDelegable,
            "CreateResourceRequest",
        );
    });
}
