import { group } from "k6";

import { AccessPackageDelegationCheckQueryBuilder, ConnectionsClient } from "../../../../../../clients/access-management/enduser/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { GetAccessPackageDelegationCheck } from "../../../../../building-blocks/access-management/enduser/connections/index.js";
import { DelegationCheckDomainChecks } from "../../../../../domain-checks/access-management/enduser/delegation-check.js";
import { getClients, getPersonTokenOpts, setupOrganizations } from "./common.js";

export const setup = setupOrganizations;

const HOVEDADMINISTRATOR = "urn:altinn:accesspackage:hovedadministrator";
const BARNEHAGELEDER = "urn:altinn:accesspackage:barnehageleder";
const EKSPLISITT = "urn:altinn:accesspackage:eksplisitt";

const groupLabel = "Daglig leder checks access packages filtered by urn";

const delegationCheckLabel = { step: `1. ${ConnectionsClient.TAGS.GetAccessPackageDelegationCheck.action}` };

export const options = getOptions([delegationCheckLabel]);

/**
 * Test: the daglig leder of an organization checks whether they can delegate
 * three access packages on behalf of it, filtered on package urns.
 *
 * The filter mixes the two forms the API accepts: the code alone for
 * hovedadministrator and barnehageleder, and the full urn for eksplisitt. Only
 * those three packages are returned. The daglig leder can delegate
 * hovedadministrator and barnehageleder, and eksplisitt can never be
 * delegated.
 *
 * @param {ReturnType<typeof setup>} data Environment-specific test data.
 * @returns {void}
 */
export default function (data) {
    const row = getItemFromList(data.organizations);
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getPersonTokenOpts(row));

    group(groupLabel, function () {
        const result = GetAccessPackageDelegationCheck(
            connections,
            new AccessPackageDelegationCheckQueryBuilder()
                .withParty(row.partyUuid)
                .withPackages(["hovedadministrator", "barnehageleder", EKSPLISITT])
                .build(),
            delegationCheckLabel,
        );

        if (result === null) {
            return;
        }

        const checks = result.data ?? [];

        DelegationCheckDomainChecks.CheckOnlyFilteredPackagesAreReturned(checks, [HOVEDADMINISTRATOR, BARNEHAGELEDER, EKSPLISITT]);
        DelegationCheckDomainChecks.CheckPackageCanBeDelegated(checks, HOVEDADMINISTRATOR);
        DelegationCheckDomainChecks.CheckPackageCanBeDelegated(checks, BARNEHAGELEDER);
        DelegationCheckDomainChecks.CheckPackageCannotBeDelegated(checks, EKSPLISITT);
    });
}
