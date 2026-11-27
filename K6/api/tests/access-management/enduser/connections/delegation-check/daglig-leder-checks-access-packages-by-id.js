import { group } from "k6";

import { AccessPackageDelegationCheckQueryBuilder, ConnectionsClient } from "../../../../../../clients/access-management/enduser/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { GetAccessPackageDelegationCheck } from "../../../../../building-blocks/access-management/enduser/connections/index.js";
import { DelegationCheckDomainChecks } from "../../../../../domain-checks/access-management/enduser/delegation-check.js";
import { getClients, getPersonTokenOpts, setupOrganizations } from "./common.js";

export const setup = setupOrganizations;

const KLIENTADMINISTRATOR = {
    id: "0195efb8-7c80-7e82-9b4f-7d63e773bbca",
    urn: "urn:altinn:accesspackage:klientadministrator",
};

const POST_MED_TAUSHETSBELAGT_INNHOLD = {
    id: "bb0569a6-2268-49b5-9d38-8158b26124c3",
    urn: "urn:altinn:accesspackage:post-til-virksomheten-med-taushetsbelagt-innhold",
};

const REGNSKAPSFORER_LONN = {
    id: "43becc6a-8c6c-4e9e-bb2f-08fe588ada21",
    urn: "urn:altinn:accesspackage:regnskapsforer-lonn",
};

const groupLabel = "Daglig leder checks access packages filtered by id";

const delegationCheckLabel = { step: `1. ${ConnectionsClient.TAGS.GetAccessPackageDelegationCheck.action}` };

export const options = getOptions([delegationCheckLabel]);

/**
 * Test: the daglig leder of an organization checks whether they can delegate
 * three access packages on behalf of it, filtered on package ids.
 *
 * Only the three packages filtered on are returned. The daglig leder role
 * gives klientadministrator and post with confidential content and lets the
 * daglig leder delegate them. regnskapsforer-lonn only comes with the
 * regnskapsfører role, so the daglig leder cannot delegate it.
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
                .withPackageIds([KLIENTADMINISTRATOR.id, POST_MED_TAUSHETSBELAGT_INNHOLD.id, REGNSKAPSFORER_LONN.id])
                .build(),
            delegationCheckLabel,
        );

        if (result === null) {
            return;
        }

        const checks = result.data ?? [];

        DelegationCheckDomainChecks.CheckOnlyFilteredPackagesAreReturned(checks, [
            KLIENTADMINISTRATOR.urn,
            POST_MED_TAUSHETSBELAGT_INNHOLD.urn,
            REGNSKAPSFORER_LONN.urn,
        ]);
        DelegationCheckDomainChecks.CheckPackageCanBeDelegated(checks, KLIENTADMINISTRATOR.urn);
        DelegationCheckDomainChecks.CheckPackageCanBeDelegated(checks, POST_MED_TAUSHETSBELAGT_INNHOLD.urn);
        DelegationCheckDomainChecks.CheckPackageCannotBeDelegated(checks, REGNSKAPSFORER_LONN.urn);
    });
}
