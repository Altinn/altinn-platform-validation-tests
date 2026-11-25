import { group } from "k6";

import { ConnectionsClient, GetResourceDelegationCheckQueryBuilder } from "../../../../../../clients/access-management/enduser/connections/index.js";
import { getOptions } from "../../../../../../helpers.js";
import { GetResourceDelegationCheck } from "../../../../../building-blocks/access-management/enduser/connections/index.js";
import { ResourceDelegationCheckDomainChecks } from "../../../../../domain-checks/access-management/enduser/resource-delegation-check.js";
import { getClients, getPrivatePersonTokenOpts, removeDirectTilgangsstyrer, setupDirectTilgangsstyrer } from "./common.js";

// A resource whose policy has these six actions, the same in at22 and tt02.
const RESOURCE = "tilgangspakke_delegering_ressurs";

const ACTIONS = ["read", "write", "delete", "instantiate", "sign", "confirm"];

// The actions the daglig leder delegates to the person in setup.
const DELEGATED_ACTIONS = ["read", "write"];

const groupLabel = "Direct tilgangsstyrer checks which resource rights can be delegated";

const labels = {
    createConnection: { step: `1. ${ConnectionsClient.TAGS.CreateConnection.action}` },
    delegatePackage: { step: `2. ${ConnectionsClient.TAGS.CreateAccessPackage.action}` },
    rightKeys: { step: `3. ${ConnectionsClient.TAGS.GetResourceDelegationCheck.action}` },
    delegateRights: { step: `4. ${ConnectionsClient.TAGS.CreateResourceRights.action}` },
    delegationCheck: { step: `5. ${ConnectionsClient.TAGS.GetResourceDelegationCheck.action}` },
    deleteConnection: { step: `6. ${ConnectionsClient.TAGS.DeleteConnection.action}` },
};

export const options = getOptions(Object.values(labels));

/**
 * Arrange: the daglig leder of an AS makes a private person tilgangsstyrer
 * for the AS, and delegates read and write on the resource to them.
 *
 * @returns {import("./common.js").DirectTilgangsstyrer} The AS and the person.
 */
export function setup() {
    return setupDirectTilgangsstyrer(RESOURCE, DELEGATED_ACTIONS, labels);
}

/**
 * Test: a person who is tilgangsstyrer for an AS through a direct delegation
 * checks which rights on a resource they can delegate on behalf of the AS.
 *
 * Tilgangsstyrer lets the person run the check, and every right in the
 * resource's policy is returned. The person can delegate read and write,
 * which were delegated to them, and none of the others: being tilgangsstyrer
 * does not give the rights themselves.
 *
 * @param {ReturnType<typeof setup>} data The AS and the person.
 * @returns {void}
 */
export default function (data) {
    const { organization, person } = data;
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getPrivatePersonTokenOpts(person));

    group(groupLabel, function () {
        const result = GetResourceDelegationCheck(
            connections,
            new GetResourceDelegationCheckQueryBuilder()
                .withParty(organization.partyUuid)
                .withResource(RESOURCE)
                .build(),
            labels.delegationCheck,
        );

        if (result === null) {
            return;
        }

        const rights = result.rights ?? [];

        ResourceDelegationCheckDomainChecks.CheckRightsForActionsAreReturned(rights, ACTIONS);

        for (const action of ACTIONS) {
            if (DELEGATED_ACTIONS.includes(action)) {
                ResourceDelegationCheckDomainChecks.CheckRightCanBeDelegatedThroughDelegation(rights, action);
            } else {
                ResourceDelegationCheckDomainChecks.CheckRightCannotBeDelegated(rights, action);
            }
        }
    });
}

/**
 * Removes the connection setup made, with tilgangsstyrer and the rights.
 *
 * @param {ReturnType<typeof setup>} data The AS and the person.
 * @returns {void}
 */
export function teardown(data) {
    removeDirectTilgangsstyrer(data, labels.deleteConnection);
}
