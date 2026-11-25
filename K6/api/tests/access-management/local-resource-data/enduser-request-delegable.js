import { group } from "k6";

import { getItemFromList, getOptions } from "../../../../helpers.js";
import {
    CreateResourceRequest,
    WithdrawSentRequest,
} from "../../../building-blocks/access-management/enduser/request/index.js";
import { ResourceDelegationDomainChecks } from "../../../domain-checks/access-management/resource-delegation.js";
import { getEnduserClients, getEnduserTokenOpts, setup } from "./common.js";
import { DELEGABLE_RESOURCE } from "./resources.js";

export { setup };

const requestLabel = { step: "1. Enduser requests the resource" };
const withdrawLabel = { step: "2. Withdraw the request" };

export const options = getOptions([requestLabel, withdrawLabel]);

/**
 * Test: an enduser can request access to a delegable resource
 * (Altinn/altinn-auth#4791, v1 of the request API).
 *
 * The counterpart of enduser-request-not-delegable.js: the request is created as
 * Pending, then withdrawn. Asking again while a request is open returns that
 * request rather than a new one, so a run that died before withdrawing does not
 * make the next one fail.
 *
 * Run k6-delegable-resource through create-resources.js first.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const user = getItemFromList(data.users);
    const { request, tokenGenerator } = getEnduserClients();

    tokenGenerator.setTokenGeneratorOptions(getEnduserTokenOpts(user));

    group("An enduser can request a delegable resource", function () {
        const created = CreateResourceRequest(request, user.partyUuid, user.orgUuid, DELEGABLE_RESOURCE, null, requestLabel);

        if (ResourceDelegationDomainChecks.CheckRequestCreated(created, "Pending", "CreateResourceRequest") && created) {
            WithdrawSentRequest(request, user.partyUuid, created.id, withdrawLabel);
        }
    });
}
