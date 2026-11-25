import { group } from "k6";

import {
    GetInstanceDelegationCheckQueryBuilder,
    GetResourceDelegationCheckQueryBuilder,
} from "../../../../clients/access-management/enduser/connections/index.js";
import { uuidv4 } from "../../../../common-imports.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
import {
    GetInstanceDelegationCheck,
    GetResourceDelegationCheck,
} from "../../../building-blocks/access-management/enduser/connections/index.js";
import { ResourceDelegationDomainChecks } from "../../../domain-checks/access-management/resource-delegation.js";
import { getEnduserClients, getEnduserTokenOpts, setup } from "./common.js";
import { DELEGABLE_RESOURCE } from "./resources.js";

export { setup };

const resourceCheckLabel = { step: "1. Delegation check on the resource" };
const instanceCheckLabel = { step: "2. Delegation check on an instance" };

export const options = getOptions([resourceCheckLabel, instanceCheckLabel]);

/**
 * Test: the delegation check lets every right through on a delegable resource
 * (Altinn/altinn-auth#4789).
 *
 * The counterpart of delegation-check-not-delegable.js. That test alone would
 * keep passing if Access Management's copy marked every resource as not
 * delegable; here the answer has to be yes, on both the resource check and the
 * instance check.
 *
 * Run k6-delegable-resource through create-resources.js first.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const user = getItemFromList(data.users);
    const { connections, tokenGenerator } = getEnduserClients();

    tokenGenerator.setTokenGeneratorOptions(getEnduserTokenOpts(user));

    group("The delegation check lets a delegable resource through", function () {
        ResourceDelegationDomainChecks.CheckDelegationCheckGranted(
            GetResourceDelegationCheck(
                connections,
                new GetResourceDelegationCheckQueryBuilder()
                    .withParty(user.orgUuid)
                    .withResource(DELEGABLE_RESOURCE)
                    .build(),
                resourceCheckLabel,
            ),
            "GetResourceDelegationCheck",
        );

        ResourceDelegationDomainChecks.CheckDelegationCheckGranted(
            GetInstanceDelegationCheck(
                connections,
                new GetInstanceDelegationCheckQueryBuilder()
                    .withParty(user.orgUuid)
                    .withResource(DELEGABLE_RESOURCE)
                    .withInstance(`urn:altinn:dialog-id:${uuidv4()}`)
                    .build(),
                instanceCheckLabel,
            ),
            "GetInstanceDelegationCheck",
        );
    });
}
