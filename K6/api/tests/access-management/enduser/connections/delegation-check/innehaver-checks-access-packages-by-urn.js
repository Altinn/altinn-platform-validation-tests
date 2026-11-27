import { group } from "k6";

import { AccessPackageDelegationCheckQueryBuilder, ConnectionsClient } from "../../../../../../clients/access-management/enduser/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { GetAccessPackageDelegationCheck } from "../../../../../building-blocks/access-management/enduser/connections/index.js";
import { DelegationCheckDomainChecks } from "../../../../../domain-checks/access-management/enduser/delegation-check.js";
import { getClients, getPersonTokenOpts, setupEnkeltpersonforetak } from "./common.js";

export const setup = setupEnkeltpersonforetak;

const HOVEDADMINISTRATOR = "urn:altinn:accesspackage:hovedadministrator";
const BARNEHAGELEDER = "urn:altinn:accesspackage:barnehageleder";
const EKSPLISITT = "urn:altinn:accesspackage:eksplisitt";
const FORRETNINGSFORER_EIENDOM = "urn:altinn:accesspackage:forretningsforer-eiendom";

const groupLabel = "Innehaver checks access packages filtered by urn";

const delegationCheckLabel = { step: `1. ${ConnectionsClient.TAGS.GetAccessPackageDelegationCheck.action}` };

export const options = getOptions([delegationCheckLabel]);

/**
 * Test: the innehaver of an enkeltpersonforetak checks whether they can
 * delegate four access packages on behalf of it, filtered on package urns.
 *
 * The filter mixes the two forms the API accepts: the code alone for
 * hovedadministrator and barnehageleder, and the full urn for eksplisitt and
 * forretningsforer-eiendom. Only those four packages are returned. The
 * innehaver role gives hovedadministrator and barnehageleder, so the innehaver
 * can delegate them. eksplisitt can never be delegated, and
 * forretningsforer-eiendom only comes with the forretningsfører role.
 *
 * @param {ReturnType<typeof setup>} data Environment-specific test data.
 * @returns {void}
 */
export default function (data) {
    const row = getItemFromList(data.enkeltpersonforetak);
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getPersonTokenOpts(row));

    group(groupLabel, function () {
        const result = GetAccessPackageDelegationCheck(
            connections,
            new AccessPackageDelegationCheckQueryBuilder()
                .withParty(row.partyUuid)
                .withPackages(["hovedadministrator", "barnehageleder", EKSPLISITT, FORRETNINGSFORER_EIENDOM])
                .build(),
            delegationCheckLabel,
        );

        if (result === null) {
            return;
        }

        const checks = result.data ?? [];

        DelegationCheckDomainChecks.CheckOnlyFilteredPackagesAreReturned(checks, [HOVEDADMINISTRATOR, BARNEHAGELEDER, EKSPLISITT, FORRETNINGSFORER_EIENDOM]);
        DelegationCheckDomainChecks.CheckPackageCanBeDelegatedThroughRole(checks, HOVEDADMINISTRATOR);
        DelegationCheckDomainChecks.CheckPackageCanBeDelegatedThroughRole(checks, BARNEHAGELEDER);
        DelegationCheckDomainChecks.CheckPackageCannotBeDelegated(checks, EKSPLISITT);
        DelegationCheckDomainChecks.CheckPackageCannotBeDelegated(checks, FORRETNINGSFORER_EIENDOM);
    });
}
