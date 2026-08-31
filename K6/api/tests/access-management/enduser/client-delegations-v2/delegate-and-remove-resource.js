export { handleSummary } from "../../../../../common-imports.js";
import { fail, group } from "k6";
import exec from "k6/execution";

import { AgentResourcesQueryBuilder, AgentsQueryBuilder, ClientDelegationV2Client, ClientResourcesQueryBuilder, ClientsQueryBuilder, DelegateAgentResourcesQueryBuilder, ResourceDelegationBatchInputBuilder } from "../../../../../clients/access-management/enduser/client-delegation-v2/index.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { DelegateAgentResources, DeleteAgentResources, GetAgentResources, GetAgents, GetClientResources, GetClients } from "../../../../building-blocks/access-management/enduser/client-delegation-v2/index.js";
import { ClientDelegationV2DomainChecks } from "../../../../domain-checks/access-management/enduser/client-delegation-v2.js";
import { getClient, setup } from "./commons.js";

export { setup };

const labels = { step: "DelegateAndRemoveResource" };

export const options = getOptions([labels]);

/**
 * Describes an entity for a log line, so a failure says what was drawn.
 *
 * The variant matters: a role-package coupling can be restricted to one, which
 * is why the same role delegates fine for one unit type and is refused for
 * another. Without it in the output a red run cannot be told apart from an
 * unlucky draw.
 *
 * @param {*} entity A CompactEntityDto.
 * @returns {string} Name, type and variant.
 */
function describe(entity) {
    return `${entity?.name ?? "?"} (type=${entity?.type ?? "?"}, variant=${entity?.variant ?? "none"})`;
}
/**
 * Picks the client, agent and role the delegation goes between.
 *
 * Everything reads from v2, the same version the delegation itself goes to. That
 * matters rather than being tidiness: v2 reports a client held through a
 * rettighetshaver relation and v1 does not. Measured against at22, where one
 * party returns one client from v2 and none from v1, for a client the delegation
 * then succeeds for.
 *
 * The fixture names the client, the agent and the role, and each is verified to
 * be there rather than taken on trust. That is what makes a reset environment
 * visible: the lists come back as an empty 200, so the status checks pass either
 * way, and without a check on the contents the run keeps its green checks and
 * simply has fewer of them. Nothing would say the test had stopped testing.
 *
 * Discovery is the fallback for a fixture that has not been filled in. It picks
 * the first client carrying any role and the first agent that is a person, which
 * leaves the outcome to the order the API returns its rows, so it logs what it
 * landed on. Agents are filtered to persons because an organisation as agent is
 * refused with 400 AM.VLD-00008, which would fail the delegation for a reason
 * that has nothing to do with what this test checks.
 *
 * @param {ClientDelegationV2Client} clientDelegationV2 The v2 Client Delegation API client.
 * @param {import("./commons.js").ClientDelegationV2TestRow} row The fixture row in play.
 * @returns {{clientId: string, agentId: string, roleCode: string}|null} The delegation target, or null when the party lacks the data.
 */
function arrangeDelegationTarget(clientDelegationV2, row) {
    const party = row.orgUuid;

    const agents = GetAgents(
        clientDelegationV2,
        new AgentsQueryBuilder().withParty(party).build(),
        null,
        labels,
    );

    let agentId;

    if (row.agentUuid) {
        if (!ClientDelegationV2DomainChecks.CheckAgentRegistered(agents, row.agentUuid, "GetAgents")) {
            return null;
        }

        agentId = row.agentUuid;
    } else {
        const agentRows = agents?.data ?? [];
        const persons = agentRows.filter((entry) => entry?.agent?.id && entry?.agent?.type === "Person");
        const skipped = agentRows.length - persons.length;

        if (persons.length === 0) {
            console.error(
                `arrangeDelegationTarget - party ${party} has no person agents to delegate to`
                + (skipped > 0 ? `; ${skipped} of ${agentRows.length} were other types` : ""),
            );
            return null;
        }

        agentId = persons[0].agent.id;
        console.log(`arrangeDelegationTarget - party ${party} agent=${describe(persons[0].agent)} (discovered)`);
    }

    const clients = GetClients(
        clientDelegationV2,
        new ClientsQueryBuilder().withParty(party).build(),
        null,
        labels,
    );

    if (row.clientUuid && row.roleCode) {
        if (!ClientDelegationV2DomainChecks.CheckClientListed(clients, row.clientUuid, row.roleCode, "GetClients")) {
            return null;
        }

        console.log(`arrangeDelegationTarget - party ${party} client=${row.clientUuid} role=${row.roleCode} (pinned) agent=${agentId}`);

        return { clientId: row.clientUuid, agentId, roleCode: row.roleCode };
    }

    const client = (clients?.data ?? [])
        .find((entry) => entry?.client?.id && (entry?.access ?? []).some((access) => access?.role?.code));

    if (client === undefined) {
        console.error(`arrangeDelegationTarget - party ${party} has no client with a role to delegate through`);
        return null;
    }

    const roleCode = (client.access ?? []).map((access) => access?.role?.code).find(Boolean);

    if (!roleCode) {
        console.error(`arrangeDelegationTarget - party ${party} has no role code to delegate through`);
        return null;
    }

    console.log(
        `arrangeDelegationTarget - party ${party} client=${describe(client.client)} role=${roleCode} (discovered) agent=${agentId}`,
    );

    return { clientId: client.client.id, agentId, roleCode };
}

/**
 * Builds the query and payload for one delegation.
 *
 * The same pair is needed to create the delegation and to remove it again, and
 * teardown has to build it without having seen the iteration that created it,
 * so it lives here rather than inline.
 *
 * @param {import("./commons.js").ClientDelegationV2TestRow} row The fixture row.
 * @param {{clientId: string, agentId: string, roleCode: string}} target What the arrange step settled on.
 * @returns {{query: *, payload: *}} Query and body, for delegate and delete alike.
 */
function delegationRequest(row, target) {
    return {
        query: new DelegateAgentResourcesQueryBuilder()
            .withParty(row.orgUuid)
            .withClient(target.clientId)
            .withAgent(target.agentId)
            .build(),
        payload: new ResourceDelegationBatchInputBuilder()
            .addPermission(target.roleCode, [row.resource])
            .build(),
    };
}

/**
 * k6 default function executed for each iteration.
 *
 * Test: a resource can be delegated from a client to an agent, is visible from
 * both sides afterwards, and can be removed again.
 *
 * @param {import("./commons.js").ClientDelegationV2TestRow[][]} data One slice per VU, from setup.
 * @returns {void}
 */
export default function (data) {
    const row = getItemFromList(data[exec.vu.idInTest - 1]);
    const clientDelegationV2 = getClient(row);

    const target = group("Arrange - find a client, an agent and a role to delegate through", function () {
        return arrangeDelegationTarget(clientDelegationV2, row);
    });

    // Nothing below says anything without a client and an agent, and no write has
    // happened yet, so ending the iteration here leaves nothing behind.
    if (target === null) {
        fail("cannot delegate a resource: the party has no client and agent to delegate between");
    }

    const { query: delegationQuery, payload } = delegationRequest(row, target);

    // Whether the write landed, which is what decides if there is anything to
    // remove. Deliberately not the same question as whether the response looked
    // the way we expected: a 200 echoing something surprising has still created a
    // delegation, and skipping the removal for that would leave it behind.
    let written = false;

    group("1. Delegate the resource to the agent", function () {
        const delegations = DelegateAgentResources(
            clientDelegationV2,
            delegationQuery,
            payload,
            labels,
        );

        written = delegations !== null;

        ClientDelegationV2DomainChecks.CheckDelegationEchoed(
            delegations,
            { from: target.clientId, to: target.agentId },
            "DelegateAgentResources",
        );
    });

    // Skipping rather than failing: a fail() here would abort the iteration and
    // leave the delegation behind, which step 4 is what removes.
    if (written) {
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

/**
 * k6 teardown stage. Removes anything an iteration may have left behind.
 *
 * Step 4 already removes the delegation on the ordinary path. This is for the
 * paths that never reach it: an iteration that timed out, threw, or was cut
 * short when the run was stopped. Without this, such a run leaves a delegation
 * in the environment and the next run sees it as pre-existing state.
 *
 * It sweeps every row rather than only the ones that ran, since teardown is not
 * told what the iterations did. Removing a delegation that is not there answers
 * 200 having changed nothing, so the sweep costs nothing where there is nothing
 * to clean.
 *
 * It needs no lookup of its own: the fixture names the client, agent and role, so
 * the request it has to undo can be rebuilt from the row alone.
 *
 * The client is called directly rather than through the building blocks, so that
 * tidying up does not add checks to the summary. Teardown should clean, not
 * assert, and a cleanup that cannot reach the API says so in the log rather than
 * turning a green run red.
 *
 * @param {import("./commons.js").ClientDelegationV2TestRow[][]} data One slice per VU, from setup.
 * @returns {void}
 */
export function teardown(data) {
    data.flat().forEach((row) => {
        if (!row.clientUuid || !row.agentUuid || !row.roleCode) {
            return;
        }

        const clientDelegationV2 = getClient(row);

        const { query, payload } = delegationRequest(row, {
            clientId: row.clientUuid,
            agentId: row.agentUuid,
            roleCode: row.roleCode,
        });

        const res = clientDelegationV2.DeleteAgentResources(query, payload);

        if (res.status !== 200) {
            console.warn(`teardown - could not remove the delegation for ${row.orgName}: ${res.status}`);
            return;
        }

        const changed = (JSON.parse(String(res.body)) ?? [])
            .filter((/** @type {*} */ entry) => entry?.changed);

        if (changed.length > 0) {
            console.info(`teardown - removed a delegation left behind for ${row.orgName}`);
        }
    });
}
