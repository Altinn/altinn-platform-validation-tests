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
import { DELEGABLE_ACCESS_LIST_RESOURCE } from "../resources.js";

export { setup };

const delegationCheckLabel = { step: "1. Delegation check for an organization on no list" };
const instanceDelegationCheckLabel = { step: "2. Instance delegation check for an organization on no list" };

export const options = getOptions([delegationCheckLabel, instanceDelegationCheckLabel]);

/**
 * Test: the delegation check enforces the access list mode of a resource
 * (Altinn/altinn-auth#4786, #4789).
 *
 * k6-access-list-resource is delegable and has access lists enforced, and the
 * daglig leder holds every right its policy grants. So the access list is the
 * only reason anything here can be refused:
 *
 * 1. On behalf of their organization, which is on none of the resource's lists,
 * every right is refused for AccessListValidationFail.
 * 2. The instance delegation check does the same.
 *
 * That a person is not affected by the list is in access-list-person.js.
 *
 * The access list mode is the second field #4789 stops reading from the
 * registry. Without this test, a local copy that lost the mode would let every
 * organization past the access list, and nothing here would notice.
 *
 * The organization is the first row of the test data, which is never put on a
 * list. access-list-membership.js puts the last row on one, so the two do not
 * disturb each other. The decision point caches memberships for ten minutes, so
 * a run of that test would otherwise show up here for that long.
 *
 * The other direction, an organization on the list being let through, is in
 * access-list-membership.js. It has to wait for that cache after every change,
 * so it is run by hand.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const user = getItemFromList(data.users);
    const { connections, tokenGenerator } = getEnduserClients();

    tokenGenerator.setTokenGeneratorOptions(getEnduserTokenOpts(user));

    group("Delegation checks refuse an organization that is not on the access list", function () {
        ResourceDelegationDomainChecks.CheckDelegationCheckRefused(
            GetResourceDelegationCheck(
                connections,
                new GetResourceDelegationCheckQueryBuilder()
                    .withParty(user.orgUuid)
                    .withResource(DELEGABLE_ACCESS_LIST_RESOURCE)
                    .build(),
                delegationCheckLabel,
            ),
            DelegationCheckReasonCode.AccessListValidationFail,
            "GetResourceDelegationCheck",
        );

        ResourceDelegationDomainChecks.CheckDelegationCheckRefused(
            GetInstanceDelegationCheck(
                connections,
                new GetInstanceDelegationCheckQueryBuilder()
                    .withParty(user.orgUuid)
                    .withResource(DELEGABLE_ACCESS_LIST_RESOURCE)
                    .withInstance(`urn:altinn:dialog-id:${uuidv4()}`)
                    .build(),
                instanceDelegationCheckLabel,
            ),
            DelegationCheckReasonCode.AccessListValidationFail,
            "GetInstanceDelegationCheck",
        );
    });

}
