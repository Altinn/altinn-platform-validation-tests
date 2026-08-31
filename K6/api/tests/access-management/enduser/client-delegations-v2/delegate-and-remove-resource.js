export { handleSummary } from "../../../../../common-imports.js";
import { fail, group } from "k6";

import { AgentsQueryBuilder, ClientDelegationClient, ClientsQueryBuilder } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { AgentResourcesQueryBuilder, ClientResourcesQueryBuilder, DelegateAgentResourcesQueryBuilder, ResourceDelegationBatchInputBuilder } from "../../../../../clients/access-management/enduser/client-delegation-v2/index.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { GetAgents, GetClients } from "../../../../building-blocks/access-management/enduser/client-delegation/index.js";
import { DelegateAgentResources, DeleteAgentResources, GetAgentResources, GetClientResources } from "../../../../building-blocks/access-management/enduser/client-delegation-v2/index.js";
import { ClientDelegationV2DomainChecks } from "../../../../domain-checks/access-management/enduser/client-delegation-v2.js";
import { getClients, setup } from "./commons.js";

export { setup };

const labels = { step: "DelegateAndRemoveResource" };

export const options = getOptions([labels]);

/**
 * Picks the client, agent and role the delegation goes between.
 *
 * v2 has no endpoint listing clients or agents, so this reads them from v1. The
 * role comes from the client rather than being configured, since it has to be a
 * role that client relationship actually grants.
 *
 * @param {ClientDelegationClient} clientDelegation The v1 Client Delegation API client.
 * @param {string} party Party uuid whose clients and agents are used.
 * @returns {{clientId: string, agentId: string, roleCode: string}|null} The delegation target, or null when the party lacks the data.
 */
function arrangeDelegationTarget(clientDelegation, party) {
    const clients = GetClients(
        clientDelegation,
        new ClientsQueryBuilder().withParty(party).build(),
        null,
        labels,
    );

    const agents = GetAgents(
        clientDelegation,
        new AgentsQueryBuilder().withParty(party).build(),
        null,
        labels,
    );

    const client = (clients?.data ?? [])
        .find((entry) => entry?.client?.id && (entry?.access ?? []).some((access) => access?.role?.code));

    const agent = (agents?.data ?? []).find((entry) => entry?.agent?.id);

    if (client === undefined) {
        console.error(`arrangeDelegationTarget - party ${party} has no client with a role to delegate through`);
        return null;
    }

    if (agent === undefined) {
        console.error(`arrangeDelegationTarget - party ${party} has no agents to delegate to`);
        return null;
    }

    // The find above already established that one of these carries a role code,
    // but it has to be read out again for the result to be typed as a string.
    const roleCode = (client.access ?? []).find((access) => access?.role?.code)?.role?.code;

    if (!roleCode) {
        console.error(`arrangeDelegationTarget - party ${party} has no role code to delegate through`);
        return null;
    }

    return {
        clientId: client.client.id,
        agentId: agent.agent.id,
        roleCode,
    };
}

/**
 * k6 default function executed for each iteration.
 *
 * Test: a resource can be delegated from a client to an agent, is visible from
 * both sides afterwards, and can be removed again.
 *
 * @param {import("./commons.js").ClientDelegationV2TestRow[]} data What the setup arranged.
 * @returns {void}
 */
export default function (data) {
    const row = getItemFromList(data);
    const { clientDelegation, clientDelegationV2 } = getClients(row);

    const target = group("Arrange - find a client, an agent and a role to delegate through", function () {
        return arrangeDelegationTarget(clientDelegation, row.orgUuid);
    });

    // Nothing below says anything without a client and an agent, and no write has
    // happened yet, so ending the iteration here leaves nothing behind.
    if (target === null) {
        fail("cannot delegate a resource: the party has no client and agent to delegate between");
    }

    const delegationQuery = new DelegateAgentResourcesQueryBuilder()
        .withParty(row.orgUuid)
        .withClient(target.clientId)
        .withAgent(target.agentId)
        .build();

    const payload = new ResourceDelegationBatchInputBuilder()
        .addPermission(target.roleCode, [row.resource])
        .build();

    let delegated = false;

    group("1. Delegate the resource to the agent", function () {
        const delegations = DelegateAgentResources(
            clientDelegationV2,
            delegationQuery,
            payload,
            labels,
        );

        delegated = ClientDelegationV2DomainChecks.CheckDelegationEchoed(
            delegations,
            { from: target.clientId, to: target.agentId },
            "DelegateAgentResources",
        );
    });

    // Skipping rather than failing: a fail() here would abort the iteration and
    // leave the delegation behind, which step 4 is what removes.
    if (delegated) {
        group("2. The agent has the resource", function () {
            const resources = GetAgentResources(
                clientDelegationV2,
                new AgentResourcesQueryBuilder()
                    .withParty(row.orgUuid)
                    .withAgent(target.agentId)
                    .build(),
                null,
                labels,
            );

            ClientDelegationV2DomainChecks.CheckResourceDelegated(
                resources,
                row.resource,
                "GetAgentResources",
            );
            ClientDelegationV2DomainChecks.CheckResourcesGrantedViaRole(
                resources,
                target.roleCode,
                "GetAgentResources",
            );
        });

        group("3. The client shows the resource as delegated", function () {
            const resources = GetClientResources(
                clientDelegationV2,
                new ClientResourcesQueryBuilder()
                    .withParty(row.orgUuid)
                    .withClient(target.clientId)
                    .build(),
                null,
                labels,
            );

            ClientDelegationV2DomainChecks.CheckResourceDelegated(
                resources,
                row.resource,
                "GetClientResources",
            );
        });
    }

    if (delegated) {
        group("4. Remove the resource from the agent", function () {
            const removals = DeleteAgentResources(
                clientDelegationV2,
                delegationQuery,
                payload,
                labels,
            );

            ClientDelegationV2DomainChecks.CheckDelegationEchoed(
                removals,
                { from: target.clientId, to: target.agentId },
                "DeleteAgentResources",
            );

            const resources = GetAgentResources(
                clientDelegationV2,
                new AgentResourcesQueryBuilder()
                    .withParty(row.orgUuid)
                    .withAgent(target.agentId)
                    .build(),
                null,
                labels,
            );

            ClientDelegationV2DomainChecks.CheckResourceNotDelegated(
                resources,
                row.resource,
                "GetAgentResources",
            );
        });
    }
}
