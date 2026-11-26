import { group } from "k6";

import {
    GetInstanceDelegationCheckQueryBuilder,
    GetResourceDelegationCheckQueryBuilder,
} from "../../../../../clients/access-management/enduser/connections/index.js";
import { uuidv4 } from "../../../../../common-imports.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import {
    GetInstanceDelegationCheck,
    GetResourceDelegationCheck,
} from "../../../../building-blocks/access-management/enduser/connections/index.js";
import {
    DelegationCheckReasonCode,
    ResourceDelegationDomainChecks,
} from "../../../../domain-checks/access-management/resource-delegation.js";
import { getEnduserClients, getEnduserTokenOpts, setup } from "../common.js";
import { NOT_DELEGABLE_RESOURCE } from "../resources.js";

export { setup };

const resourceCheckLabel = { step: "1. Delegation check on the resource" };
const instanceCheckLabel = { step: "2. Delegation check on an instance" };

export const options = getOptions([resourceCheckLabel, instanceCheckLabel]);

/**
 * Test: the delegation check refuses a resource marked as not delegable
 * (Altinn/altinn-auth#4789).
 *
 * The daglig leder holds DAGL, which the resource's policy grants, so the flag
 * is the only reason for the refusal. Both the resource check and the instance
 * check answer 200, with every right refused for ResourceNotDelegable.
 *
 * The instance does not have to exist: the check only looks for rights already
 * delegated on it, and the flag refuses every right whatever the instance is.
 *
 * Run k6-not-delegable-resource through create-resources.js first.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const user = getItemFromList(data.users);
    const { connections, tokenGenerator } = getEnduserClients();

    tokenGenerator.setTokenGeneratorOptions(getEnduserTokenOpts(user));

    group("The delegation check refuses a resource that is not delegable", function () {
        ResourceDelegationDomainChecks.CheckDelegationCheckRefused(
            GetResourceDelegationCheck(
                connections,
                new GetResourceDelegationCheckQueryBuilder()
                    .withParty(user.orgUuid)
                    .withResource(NOT_DELEGABLE_RESOURCE)
                    .build(),
                resourceCheckLabel,
            ),
            DelegationCheckReasonCode.ResourceNotDelegable,
            "GetResourceDelegationCheck",
        );

        ResourceDelegationDomainChecks.CheckDelegationCheckRefused(
            GetInstanceDelegationCheck(
                connections,
                new GetInstanceDelegationCheckQueryBuilder()
                    .withParty(user.orgUuid)
                    .withResource(NOT_DELEGABLE_RESOURCE)
                    .withInstance(`urn:altinn:dialog-id:${uuidv4()}`)
                    .build(),
                instanceCheckLabel,
            ),
            DelegationCheckReasonCode.ResourceNotDelegable,
            "GetInstanceDelegationCheck",
        );
    });
}
