import { group } from "k6";

import { getItemFromList, getOptions } from "../../../../helpers.js";
import {
    CreateResourceRequest,
    WithdrawSentRequest,
} from "../../../building-blocks/access-management/enduser/request-v2/index.js";
import { ResourceDelegationDomainChecks } from "../../../domain-checks/access-management/resource-delegation.js";
import { getEnduserClients, getEnduserTokenOpts, setup } from "./common.js";
import { DELEGABLE_RESOURCE } from "./resources.js";

export { setup };

const requestLabel = { step: "1. Enduser requests the resource (v2)" };
const withdrawLabel = { step: "2. Withdraw the request (v2)" };

export const options = getOptions([requestLabel, withdrawLabel]);

/**
 * Test: an enduser can request access to a delegable resource through v2 of
 * the request API (Altinn/altinn-auth#4791).
 *
 * The request is created as Pending, then withdrawn. Only scheduled where v2 is
 * live: at23 and tt02 answered 404 on POST v2/enduser/request/resource on
 * 2026-11-25.
 * Add an environment to functional.yaml once it has v2.
 *
 * Run k6-delegable-resource through create-resources.js first.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const user = getItemFromList(data.users);
    const { requestV2, tokenGenerator } = getEnduserClients();

    tokenGenerator.setTokenGeneratorOptions(getEnduserTokenOpts(user));

    group("An enduser can request a delegable resource (v2)", function () {
        const created = CreateResourceRequest(requestV2, user.partyUuid, user.orgUuid, DELEGABLE_RESOURCE, null, requestLabel);

        if (ResourceDelegationDomainChecks.CheckRequestCreated(created, "Pending", "CreateResourceRequest (v2)") && created) {
            WithdrawSentRequest(requestV2, user.partyUuid, created.id, withdrawLabel);
        }
    });
}
