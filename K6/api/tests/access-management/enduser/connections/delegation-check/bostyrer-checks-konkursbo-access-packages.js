import { group } from "k6";

import { AccessPackageDelegationCheckQueryBuilder, ConnectionsClient } from "../../../../../../clients/access-management/enduser/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { GetAccessPackageDelegationCheck } from "../../../../../building-blocks/access-management/enduser/connections/index.js";
import { DelegationCheckDomainChecks } from "../../../../../domain-checks/access-management/enduser/delegation-check.js";
import { getClients, getPersonTokenOpts, setupKonkursbo } from "./common.js";

export const setup = setupKonkursbo;

const KONKURSBO_SKRIVETILGANG = {
    id: "0e219609-02c6-44e6-9c80-fe2c1997940e",
    urn: "urn:altinn:accesspackage:konkursbo-skrivetilgang",
};

const KONKURSBO_LESETILGANG = {
    id: "5ef836c7-69cc-4ea8-84d6-fb933cc4fc5c",
    urn: "urn:altinn:accesspackage:konkursbo-lesetilgang",
};

const groupLabel = "Bostyrer checks which konkursbo access packages can be delegated";

const delegationCheckLabel = { step: `1. ${ConnectionsClient.TAGS.GetAccessPackageDelegationCheck.action}` };

export const options = getOptions([delegationCheckLabel]);

/**
 * Test: the bostyrer of a konkursbo checks whether they can delegate the two
 * konkursbo access packages on behalf of it, filtered on package ids.
 *
 * Only the two packages filtered on are returned. The bostyrer role gives both
 * of them and lets the bostyrer delegate them, so both can be delegated
 * through the role.
 *
 * @param {ReturnType<typeof setup>} data Environment-specific test data.
 * @returns {void}
 */
export default function (data) {
    const row = getItemFromList(data.konkursbo);
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getPersonTokenOpts(row));

    group(groupLabel, function () {
        const result = GetAccessPackageDelegationCheck(
            connections,
            new AccessPackageDelegationCheckQueryBuilder()
                .withParty(row.partyUuid)
                .withPackageIds([KONKURSBO_SKRIVETILGANG.id, KONKURSBO_LESETILGANG.id])
                .build(),
            delegationCheckLabel,
        );

        if (result === null) {
            return;
        }

        const checks = result.data ?? [];

        DelegationCheckDomainChecks.CheckOnlyFilteredPackagesAreReturned(checks, [KONKURSBO_SKRIVETILGANG.urn, KONKURSBO_LESETILGANG.urn]);
        DelegationCheckDomainChecks.CheckPackageCanBeDelegatedThroughRole(checks, KONKURSBO_SKRIVETILGANG.urn);
        DelegationCheckDomainChecks.CheckPackageCanBeDelegatedThroughRole(checks, KONKURSBO_LESETILGANG.urn);
    });
}
