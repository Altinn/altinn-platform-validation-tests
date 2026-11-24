import { group } from "k6";

import { AccessPackageDelegationCheckQueryBuilder, ConnectionsClient } from "../../../../../../clients/access-management/enduser/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { GetAccessPackageDelegationCheck } from "../../../../../building-blocks/access-management/enduser/connections/index.js";
import { DelegationCheckDomainChecks } from "../../../../../domain-checks/access-management/enduser/delegation-check.js";
import { getClients, getPersonTokenOpts, setupOrganizations } from "./common.js";

export const setup = setupOrganizations;

// Filtered on by id.
const KLIENTADMINISTRATOR = {
    id: "0195efb8-7c80-7e82-9b4f-7d63e773bbca",
    urn: "urn:altinn:accesspackage:klientadministrator",
};

const VEITRANSPORT = {
    id: "36c245db-3207-449e-92b1-94cb0a0f3031",
    urn: "urn:altinn:accesspackage:veitransport",
};

const REGNSKAPSFORER_LONN = {
    id: "43becc6a-8c6c-4e9e-bb2f-08fe588ada21",
    urn: "urn:altinn:accesspackage:regnskapsforer-lonn",
};

// Filtered on by urn.
const HOVEDADMINISTRATOR = "urn:altinn:accesspackage:hovedadministrator";
const BARNEHAGELEDER = "urn:altinn:accesspackage:barnehageleder";
const EKSPLISITT = "urn:altinn:accesspackage:eksplisitt";

const groupLabel = "Daglig leder checks access packages filtered by id and urn";

const delegationCheckLabel = { step: `1. ${ConnectionsClient.TAGS.GetAccessPackageDelegationCheck.action}` };

export const options = getOptions([delegationCheckLabel]);

/**
 * Test: the daglig leder of an organization checks whether they can delegate
 * six access packages on behalf of it, three filtered on id and three on urn.
 *
 * The two filters add up, so all six packages are returned and nothing else.
 * The daglig leder can delegate the four the role gives. eksplisitt can never
 * be delegated, and regnskapsforer-lonn only comes with the regnskapsfører
 * role.
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
                .withPackageIds([KLIENTADMINISTRATOR.id, VEITRANSPORT.id, REGNSKAPSFORER_LONN.id])
                .withPackages([HOVEDADMINISTRATOR, BARNEHAGELEDER, EKSPLISITT])
                .build(),
            delegationCheckLabel,
        );

        if (result === null) {
            return;
        }

        const checks = result.data ?? [];

        DelegationCheckDomainChecks.CheckOnlyFilteredPackagesAreReturned(checks, [
            KLIENTADMINISTRATOR.urn,
            VEITRANSPORT.urn,
            REGNSKAPSFORER_LONN.urn,
            HOVEDADMINISTRATOR,
            BARNEHAGELEDER,
            EKSPLISITT,
        ]);
        DelegationCheckDomainChecks.CheckPackageCanBeDelegated(checks, KLIENTADMINISTRATOR.urn);
        DelegationCheckDomainChecks.CheckPackageCanBeDelegated(checks, VEITRANSPORT.urn);
        DelegationCheckDomainChecks.CheckPackageCanBeDelegated(checks, HOVEDADMINISTRATOR);
        DelegationCheckDomainChecks.CheckPackageCanBeDelegated(checks, BARNEHAGELEDER);
        DelegationCheckDomainChecks.CheckPackageCannotBeDelegated(checks, REGNSKAPSFORER_LONN.urn);
        DelegationCheckDomainChecks.CheckPackageCannotBeDelegated(checks, EKSPLISITT);
    });
}
