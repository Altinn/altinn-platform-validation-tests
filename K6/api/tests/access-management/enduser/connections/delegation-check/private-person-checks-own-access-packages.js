import { group } from "k6";

import { AccessPackageDelegationCheckQueryBuilder, ConnectionsClient } from "../../../../../../clients/access-management/enduser/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { GetAccessPackageDelegationCheck } from "../../../../../building-blocks/access-management/enduser/connections/index.js";
import { DelegationCheckDomainChecks } from "../../../../../domain-checks/access-management/enduser/delegation-check.js";
import { getClients, getPrivatePersonTokenOpts, setupPersons } from "./common.js";

export const setup = setupPersons;

const groupLabel = "Private person checks which access packages can be delegated";

const delegationCheckLabel = { step: `1. ${ConnectionsClient.TAGS.GetAccessPackageDelegationCheck.action}` };

export const options = getOptions([delegationCheckLabel]);

/**
 * Test: a private person checks which access packages they can delegate on
 * their own behalf, without a filter.
 *
 * Only the packages a person can hold are returned. The person can delegate
 * every innbygger package, and none of the vergemål packages, which the
 * guardianship authority manages.
 *
 * @param {ReturnType<typeof setup>} data Environment-specific test data.
 * @returns {void}
 */
export default function (data) {
    const row = getItemFromList(data.persons);
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getPrivatePersonTokenOpts(row));

    group(groupLabel, function () {
        const result = GetAccessPackageDelegationCheck(
            connections,
            new AccessPackageDelegationCheckQueryBuilder()
                .withParty(row.partyUuid)
                .build(),
            delegationCheckLabel,
        );

        if (result === null) {
            return;
        }

        const checks = result.data ?? [];

        DelegationCheckDomainChecks.CheckPackagesAreReturned(checks);
        DelegationCheckDomainChecks.CheckOnlyPersonPackagesAreReturned(checks);
        DelegationCheckDomainChecks.CheckInnbyggerPackagesCanBeDelegated(checks);
        DelegationCheckDomainChecks.CheckVergemalPackagesCannotBeDelegated(checks);
    });
}
