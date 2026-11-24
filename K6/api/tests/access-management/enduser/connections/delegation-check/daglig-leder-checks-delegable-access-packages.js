import { group } from "k6";

import { AccessPackageDelegationCheckQueryBuilder, ConnectionsClient } from "../../../../../../clients/access-management/enduser/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { GetAccessPackageDelegationCheck } from "../../../../../building-blocks/access-management/enduser/connections/index.js";
import { DelegationCheckDomainChecks } from "../../../../../domain-checks/access-management/enduser/delegation-check.js";
import { getClients, getDagligLederTokenOpts, setup } from "./common.js";

export { setup };

const groupLabel = "Daglig leder checks which access packages can be delegated";

const delegationCheckLabel = { step: `1. ${ConnectionsClient.TAGS.GetAccessPackageDelegationCheck.action}` };

export const options = getOptions([delegationCheckLabel]);

/**
 * Test: the daglig leder of an organization checks which access packages they
 * can delegate on behalf of it, without a filter.
 *
 * The answer covers every access package. None of those only a person can hold
 * are offered for an organization, eksplisitt can never be delegated, and the
 * daglig leder can delegate post with confidential content, which the role
 * gives.
 *
 * @param {ReturnType<typeof setup>} data Environment-specific test data.
 * @returns {void}
 */
export default function (data) {
    const row = getItemFromList(data.organizations);
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getDagligLederTokenOpts(row));

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
        DelegationCheckDomainChecks.CheckNoPersonOnlyPackages(checks);
        DelegationCheckDomainChecks.CheckPackageCannotBeDelegated(checks, "urn:altinn:accesspackage:eksplisitt");
        DelegationCheckDomainChecks.CheckPackageCanBeDelegated(checks, "urn:altinn:accesspackage:post-til-virksomheten-med-taushetsbelagt-innhold");
    });
}
