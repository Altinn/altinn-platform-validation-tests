import { group } from "k6";

import { getItemFromList, getOptions } from "../../../../helpers.js";
import {
    RequestCreateResourceRequest,
    RequestWithdrawRequest,
} from "../../../building-blocks/access-management/service-owner/request/index.js";
import { ResourceDelegationDomainChecks } from "../../../domain-checks/access-management/resource-delegation.js";
import { getServiceOwnerClients, setup } from "./common.js";
import { DELEGABLE_RESOURCE } from "./resources.js";

export { setup };

const requestLabel = { step: "1. Service owner requests the resource" };
const withdrawLabel = { step: "2. Withdraw the request" };

export const options = getOptions([requestLabel, withdrawLabel]);

/**
 * Test: a service owner can create an access request for a delegable resource
 * (Altinn/altinn-auth#4792).
 *
 * The counterpart of service-owner-request-not-delegable.js: the request is
 * created as Draft, then withdrawn.
 *
 * Run k6-delegable-resource through create-resources.js first.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const user = getItemFromList(data.users);
    const { request } = getServiceOwnerClients();

    group("A service owner can request a delegable resource", function () {
        const created = RequestCreateResourceRequest(
            request,
            {
                from: `urn:altinn:person:identifier-no:${user.pid}`,
                to: `urn:altinn:organization:identifier-no:${user.orgNo}`,
                resource: DELEGABLE_RESOURCE,
                rightKeys: null,
            },
            requestLabel,
        );

        if (ResourceDelegationDomainChecks.CheckRequestCreated(created, "Draft", "RequestCreateResourceRequest") && created) {
            RequestWithdrawRequest(request, created.id, withdrawLabel);
        }
    });
}
