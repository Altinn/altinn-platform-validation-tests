import { group } from "k6";

import { getItemFromList, getOptions } from "../../../../helpers.js";
import { WithdrawSentRequest } from "../../../building-blocks/access-management/enduser/request-v2/index.js";
import { ExpectProblem } from "../../../building-blocks/common/expect-problem.js";
import {
    ProblemCode,
    ResourceDelegationDomainChecks,
} from "../../../domain-checks/access-management/resource-delegation.js";
import { getEnduserClients, getEnduserTokenOpts, setup } from "./common.js";
import { NOT_DELEGABLE_RESOURCE } from "./resources.js";

export { setup };

const requestLabel = { step: "1. Enduser requests the resource (v2)" };
const cleanupLabel = { step: "Cleanup - withdraw what should have been refused (v2)" };

export const options = getOptions([requestLabel, cleanupLabel]);

/**
 * Test: an enduser cannot request access to a resource marked as not delegable
 * through v2 of the request API (Altinn/altinn-auth#4791).
 *
 * v2 runs the same validation as v1 but is its own endpoint, so it gets its own
 * test: 400 with AM.VLD-00049. A request that is wrongly accepted is withdrawn
 * on the spot.
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
        const answer = ExpectProblem(
            () => requestV2.CreateResourceRequest(user.partyUuid, user.orgUuid, NOT_DELEGABLE_RESOURCE, null, requestLabel),
            "CreateResourceRequest (v2)",
            400,
        );

        ResourceDelegationDomainChecks.CheckProblemCode(answer, ProblemCode.ResourceIsNotDelegable, "CreateResourceRequest (v2)");

        if (answer?.id) {
            WithdrawSentRequest(requestV2, user.partyUuid, answer.id, cleanupLabel);
        }
    });
}
