import { group } from "k6";

import { AccessPackageDelegationCheckQueryBuilder, ConnectionsClient } from "../../../../../../clients/access-management/enduser/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { GetAccessPackageDelegationCheck } from "../../../../../building-blocks/access-management/enduser/connections/index.js";
import { DelegationCheckDomainChecks } from "../../../../../domain-checks/access-management/enduser/delegation-check.js";
import { getClients, getPersonTokenOpts, setupPartsrederier } from "./common.js";

export const setup = setupPartsrederier;

const FAMILIEVERN = {
    id: "98c404f4-5350-42cd-86d0-15fd38f178c4",
    urn: "urn:altinn:accesspackage:familievern",
};

const SAMLE_BEHANDLE_AVLOPSVANN = {
    id: "fef4aac0-d227-4ef6-834b-cc2eb4b942ed",
    urn: "urn:altinn:accesspackage:samle-behandle-avlopsvann",
};

const BESTYRENDE_REDER = "urn:altinn:external-role:ccr:bestyrende-reder";

const groupLabel = "Bestyrende reder checks access packages filtered by id";

const delegationCheckLabel = { step: `1. ${ConnectionsClient.TAGS.GetAccessPackageDelegationCheck.action}` };

export const options = getOptions([delegationCheckLabel]);

/**
 * Test: the bestyrende reder of a partsrederi checks whether they can delegate
 * familievern and samle-behandle-avlopsvann on behalf of it, filtered on
 * package ids.
 *
 * Only the two packages filtered on are returned. The bestyrende reder role
 * gives samle-behandle-avlopsvann, but not familievern. The test does not
 * check the results: the bestyrende reder is usually a deltaker in the
 * partsrederi too, and that role gives both packages.
 *
 * @param {ReturnType<typeof setup>} data Environment-specific test data.
 * @returns {void}
 */
export default function (data) {
    const row = getItemFromList(data.partsrederier);
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getPersonTokenOpts(row));

    group(groupLabel, function () {
        const result = GetAccessPackageDelegationCheck(
            connections,
            new AccessPackageDelegationCheckQueryBuilder()
                .withParty(row.partyUuid)
                .withPackageIds([FAMILIEVERN.id, SAMLE_BEHANDLE_AVLOPSVANN.id])
                .build(),
            delegationCheckLabel,
        );

        if (result === null) {
            return;
        }

        const checks = result.data ?? [];

        DelegationCheckDomainChecks.CheckOnlyFilteredPackagesAreReturned(checks, [FAMILIEVERN.urn, SAMLE_BEHANDLE_AVLOPSVANN.urn]);
        DelegationCheckDomainChecks.CheckPackageIsGivenByRole(checks, SAMLE_BEHANDLE_AVLOPSVANN.urn, BESTYRENDE_REDER);
        DelegationCheckDomainChecks.CheckPackageIsNotGivenByRole(checks, FAMILIEVERN.urn, BESTYRENDE_REDER);
    });
}
