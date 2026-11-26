import { group } from "k6";

import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { CreateResourceRequest } from "../../../../building-blocks/access-management/enduser/request-v2/index.js";
import {
    ProblemCode,
    ResourceDelegationDomainChecks,
} from "../../../../domain-checks/access-management/resource-delegation.js";
import { getEnduserClients, getEnduserTokenOpts, setup } from "../common.js";
import { NOT_DELEGABLE_RESOURCE } from "../resources.js";

export { setup };

const requestLabel = { step: "1. Enduser requests the resource (v2)" };

export const options = getOptions([requestLabel]);

/**
 * Test: an enduser cannot request access to a resource marked as not delegable
 * through v2 of the request API (Altinn/altinn-auth#4791).
 *
 * v2 runs the same validation as v1 but is its own endpoint, so it gets its own
 * test: 400 with AM.VLD-00049. A request that is wrongly accepted is not left to
 * pile up: asking again while one is open returns that same request.
 *
 * Only scheduled where v2 is live: at23 and tt02 answered 404 on
 * POST v2/enduser/request/resource on 2026-11-25. Add an environment to
 * functional.yaml once it has v2.
 *
 * Run k6-not-delegable-resource through create-resources.js first.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const user = getItemFromList(data.users);
    const { requestV2, tokenGenerator } = getEnduserClients();

    tokenGenerator.setTokenGeneratorOptions(getEnduserTokenOpts(user));

    group("An enduser cannot request a resource that is not delegable (v2)", function () {
        ResourceDelegationDomainChecks.CheckProblemCode(
            CreateResourceRequest(requestV2, user.partyUuid, user.orgUuid, NOT_DELEGABLE_RESOURCE, null, 400, requestLabel),
            ProblemCode.ResourceIsNotDelegable,
            "CreateResourceRequest (v2)",
        );
    });
}
