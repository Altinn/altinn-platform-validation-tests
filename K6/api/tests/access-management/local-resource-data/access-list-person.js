import { group } from "k6";

import { GetResourceDelegationCheckQueryBuilder } from "../../../../clients/access-management/enduser/connections/index.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetResourceDelegationCheck } from "../../../building-blocks/access-management/enduser/connections/index.js";
import {
    DelegationCheckReasonCode,
    ResourceDelegationDomainChecks,
} from "../../../domain-checks/access-management/resource-delegation.js";
import { getEnduserClients, getEnduserTokenOpts, setup } from "./common.js";
import { DELEGABLE_ACCESS_LIST_RESOURCE } from "./resources.js";

export { setup };

const personDelegationCheckLabel = { step: "1. Delegation check for a person" };

export const options = getOptions([personDelegationCheckLabel]);

/**
 * Test: the delegation check does not apply an access list to a person
 * (Altinn/altinn-auth#4786, #4789).
 *
 * Access lists are for organizations only. Asked on behalf of the daglig leder
 * themselves, on k6-access-list-resource, no right may be refused for
 * AccessListValidationFail. The rights may still be refused for other reasons:
 * the person holds no role on their own behalf.
 *
 * Run k6-access-list-resource through create-resources.js first.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const user = getItemFromList(data.users);
    const { connections, tokenGenerator } = getEnduserClients();

    tokenGenerator.setTokenGeneratorOptions(getEnduserTokenOpts(user));

    group("The delegation check does not apply the access list to a person", function () {
        ResourceDelegationDomainChecks.CheckNoRightRefusedFor(
            GetResourceDelegationCheck(
                connections,
                new GetResourceDelegationCheckQueryBuilder()
                    .withParty(user.partyUuid)
                    .withResource(DELEGABLE_ACCESS_LIST_RESOURCE)
                    .build(),
                personDelegationCheckLabel,
            ),
            DelegationCheckReasonCode.AccessListValidationFail,
            "GetResourceDelegationCheck (person)",
        );
    });
}
