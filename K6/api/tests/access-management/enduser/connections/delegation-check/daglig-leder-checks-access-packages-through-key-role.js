import { group } from "k6";

import { AccessPackageDelegationCheckQueryBuilder, ConnectionsClient } from "../../../../../../clients/access-management/enduser/connections/index.js";
import { getOptions } from "../../../../../../helpers.js";
import { GetAccessPackageDelegationCheck } from "../../../../../building-blocks/access-management/enduser/connections/index.js";
import { DelegationCheckDomainChecks } from "../../../../../domain-checks/access-management/enduser/delegation-check.js";
import { getClients, getPersonTokenOpts, removeKeyRoleConnection, setupKeyRoleConnection } from "./common.js";

// Makes the receiving organization tilgangsstyrer for the delegating one. An
// ordinary package such as motorvognavgift only gives access to the party, and
// the delegation check then answers 403.
const DELEGATED_PACKAGE = "tilgangsstyrer";

const groupLabel = "Daglig leder checks access packages for a party reached through a key role";

const labels = {
    createConnection: { step: `1. ${ConnectionsClient.TAGS.CreateConnection.action}` },
    delegatePackage: { step: `2. ${ConnectionsClient.TAGS.CreateAccessPackage.action}` },
    ownOrganizationCheck: { step: `3. ${ConnectionsClient.TAGS.GetAccessPackageDelegationCheck.action} own organization` },
    keyRoleCheck: { step: `4. ${ConnectionsClient.TAGS.GetAccessPackageDelegationCheck.action} through key role` },
    deleteConnection: { step: `5. ${ConnectionsClient.TAGS.DeleteConnection.action}` },
};

export const options = getOptions(Object.values(labels));

/**
 * Arrange: one AS makes another its tilgangsstyrer, so the daglig leder of the
 * receiving organization can manage access for the delegating one through
 * their key role.
 *
 * @returns {import("./common.js").KeyRoleConnection} The two organizations.
 */
export function setup() {
    return setupKeyRoleConnection(DELEGATED_PACKAGE, labels);
}

/**
 * Test: the daglig leder of the receiving organization runs the delegation
 * check, without a filter, for the organization that delegated to it.
 *
 * They reach that party only through their key role in the receiving
 * organization. The check still answers, and it lists the same access packages
 * as it does for the daglig leder's own organization.
 *
 * @param {ReturnType<typeof setup>} data The two organizations.
 * @returns {void}
 */
export default function (data) {
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getPersonTokenOpts(data.receivingOrganization));

    group(groupLabel, function () {
        const ownOrganization = GetAccessPackageDelegationCheck(
            connections,
            new AccessPackageDelegationCheckQueryBuilder()
                .withParty(data.receivingOrganization.partyUuid)
                .build(),
            labels.ownOrganizationCheck,
        );

        const throughKeyRole = GetAccessPackageDelegationCheck(
            connections,
            new AccessPackageDelegationCheckQueryBuilder()
                .withParty(data.delegatingOrganization.partyUuid)
                .build(),
            labels.keyRoleCheck,
        );

        if (ownOrganization === null || throughKeyRole === null) {
            return;
        }

        const checks = throughKeyRole.data ?? [];

        DelegationCheckDomainChecks.CheckPackagesAreReturned(checks);
        DelegationCheckDomainChecks.CheckSamePackagesAsOwnOrganization(checks, ownOrganization.data ?? []);
    });
}

/**
 * Removes the connection and the access package setup made.
 *
 * @param {ReturnType<typeof setup>} data The two organizations.
 * @returns {void}
 */
export function teardown(data) {
    removeKeyRoleConnection(data, labels.deleteConnection);
}
