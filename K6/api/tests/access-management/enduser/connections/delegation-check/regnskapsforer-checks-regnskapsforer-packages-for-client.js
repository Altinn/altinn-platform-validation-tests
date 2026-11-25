import { group } from "k6";

import { AccessPackageDelegationCheckQueryBuilder, ConnectionsClient } from "../../../../../../clients/access-management/enduser/connections/index.js";
import { getOptions } from "../../../../../../helpers.js";
import { GetAccessPackageDelegationCheck } from "../../../../../building-blocks/access-management/enduser/connections/index.js";
import { DelegationCheckDomainChecks } from "../../../../../domain-checks/access-management/enduser/delegation-check.js";
import { getClients, getPersonTokenOpts, removeKeyRoleConnection, setupRegnskapsforerAsTilgangsstyrer } from "./common.js";

const REGNSKAPSFORER_MED_SIGNERINGSRETTIGHET = {
    id: "955d5779-3e2b-4098-b11d-0431dc41ddbe",
    urn: "urn:altinn:accesspackage:regnskapsforer-med-signeringsrettighet",
};

const REGNSKAPSFORER_UTEN_SIGNERINGSRETTIGHET = {
    id: "a5f7f72a-9b89-445d-85bb-06f678a3d4d1",
    urn: "urn:altinn:accesspackage:regnskapsforer-uten-signeringsrettighet",
};

const groupLabel = "Regnskapsfører checks regnskapsfører packages for a client";

const labels = {
    createConnection: { step: `1. ${ConnectionsClient.TAGS.CreateConnection.action}` },
    delegatePackage: { step: `2. ${ConnectionsClient.TAGS.CreateAccessPackage.action}` },
    delegationCheck: { step: `3. ${ConnectionsClient.TAGS.GetAccessPackageDelegationCheck.action}` },
    deleteConnection: { step: `4. ${ConnectionsClient.TAGS.DeleteConnection.action}` },
};

export const options = getOptions(Object.values(labels));

/**
 * Arrange: the client of a regnskapsfører makes the regnskapsfører its
 * tilgangsstyrer, so the regnskapsfører's leader can run the delegation check
 * for the client.
 *
 * @returns {import("./common.js").KeyRoleConnection} The client as the delegating organization, and the regnskapsfører as the receiving one.
 */
export function setup() {
    return setupRegnskapsforerAsTilgangsstyrer(labels);
}

/**
 * Test: the leader of a regnskapsfører (daglig leder, or innehaver of an ENK)
 * checks whether they can delegate the two regnskapsfører packages on behalf
 * of one of its clients, filtered on package ids.
 *
 * Only the two packages filtered on are returned, and neither can be
 * delegated: being the client's regnskapsfører does not let the leader pass
 * them on.
 *
 * @param {ReturnType<typeof setup>} data The client and the regnskapsfører.
 * @returns {void}
 */
export default function (data) {
    const { delegatingOrganization: client, receivingOrganization: regnskapsforer } = data;
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getPersonTokenOpts(regnskapsforer));

    group(groupLabel, function () {
        const result = GetAccessPackageDelegationCheck(
            connections,
            new AccessPackageDelegationCheckQueryBuilder()
                .withParty(client.partyUuid)
                .withPackageIds([REGNSKAPSFORER_MED_SIGNERINGSRETTIGHET.id, REGNSKAPSFORER_UTEN_SIGNERINGSRETTIGHET.id])
                .build(),
            labels.delegationCheck,
        );

        if (result === null) {
            return;
        }

        const checks = result.data ?? [];

        DelegationCheckDomainChecks.CheckOnlyFilteredPackagesAreReturned(checks, [
            REGNSKAPSFORER_MED_SIGNERINGSRETTIGHET.urn,
            REGNSKAPSFORER_UTEN_SIGNERINGSRETTIGHET.urn,
        ]);
        DelegationCheckDomainChecks.CheckPackageCannotBeDelegated(checks, REGNSKAPSFORER_MED_SIGNERINGSRETTIGHET.urn);
        DelegationCheckDomainChecks.CheckPackageCannotBeDelegated(checks, REGNSKAPSFORER_UTEN_SIGNERINGSRETTIGHET.urn);
    });
}

/**
 * Removes the connection and the access package setup made.
 *
 * @param {ReturnType<typeof setup>} data The client and the regnskapsfører.
 * @returns {void}
 */
export function teardown(data) {
    removeKeyRoleConnection(data, labels.deleteConnection);
}
