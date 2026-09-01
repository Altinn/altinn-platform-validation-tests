export { handleSummary } from "../../../../../common-imports.js";
import { fail, group } from "k6";
import exec from "k6/execution";

import { AgentResourcesQueryBuilder, AgentsQueryBuilder, ClientDelegationV2Client, ClientResourcesQueryBuilder, ClientsQueryBuilder, DelegateAgentResourcesQueryBuilder, ResourceDelegationBatchInputBuilder } from "../../../../../clients/access-management/enduser/client-delegation-v2/index.js";
import { CreateConnectionQueryBuilder, CreateResourceRightsQueryBuilder, DeleteConnectionQueryBuilder, DeleteResourceQueryBuilder, GetResourceDelegationCheckQueryBuilder } from "../../../../../clients/access-management/enduser/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { DelegateAgentResources, DeleteAgentResources, GetAgentResources, GetAgents, GetClientResources, GetClients } from "../../../../building-blocks/access-management/enduser/client-delegation-v2/index.js";
import { CreateConnection, CreateResourceRights, DeleteConnection, DeleteResource, GetResourceDelegationCheck } from "../../../../building-blocks/access-management/enduser/connections/index.js";
import { ClientDelegationV2DomainChecks } from "../../../../domain-checks/access-management/enduser/client-delegation-v2.js";
import { getClient, getConnectionsClient, setup } from "./commons.js";

export { setup };

const labels = { step: "DelegateAndRemoveResource" };

export const options = getOptions([labels]);

/**
 * Picks the client, agent and role the delegation goes between.
 *
 * Everything reads from v2, the same version the delegation itself goes to. That
 * matters rather than being tidiness: v2 reports a client held through a
 * rettighetshaver relation and v1 does not. Measured against at22, where one
 * party returns one client from v2 and none from v1, for a client the delegation
 * then succeeds for.
 *
 * Nothing here is discovered. The client is either the one the row names or the
 * one the test just set up, the agent is named by the row, and both are checked
 * to be there rather than taken on trust. That is what makes a reset environment
 * visible: the lists come back as an empty 200, so the status checks pass either
 * way, and without a check on the contents the run keeps its green checks and
 * simply has fewer of them. Nothing would say the test had stopped testing.
 *
 * @param {ClientDelegationV2Client} clientDelegationV2 The v2 Client Delegation API client.
 * @param {import("./commons.js").ClientDelegationV2TestRow} row The fixture row in play.
 * @param {import("./commons.js").ClientDelegationV2TestRow|null} clientRow The row acting as client when the test set the relation up, null when the row names its own.
 * @returns {{clientId: string, agentId: string, roleCode: string}|null} The delegation target, or null when the party lacks the data.
 */
function arrangeDelegationTarget(clientDelegationV2, row, clientRow) {
    const party = row.orgUuid;
    const clientId = row.clientUuid || clientRow?.orgUuid;
    const roleCode = row.roleCode || SEEDED_ROLE;

    if (!clientId) {
        console.error(`arrangeDelegationTarget - party ${party} has no client, neither named nor set up`);
        return null;
    }

    const agents = GetAgents(
        clientDelegationV2,
        new AgentsQueryBuilder().withParty(party).build(),
        null,
        labels,
    );

    if (!ClientDelegationV2DomainChecks.CheckAgentRegistered(agents, row.agentUuid, "GetAgents")) {
        return null;
    }

    const clients = GetClients(
        clientDelegationV2,
        new ClientsQueryBuilder().withParty(party).build(),
        null,
        labels,
    );

    if (!ClientDelegationV2DomainChecks.CheckClientListed(clients, clientId, roleCode, "GetClients")) {
        return null;
    }

    // The resources filter is a v2 addition with no v1 equivalent, so nothing
    // else in the suite would notice it breaking. Only asked where the test set
    // the relation up itself: it granted the client this very resource a moment
    // ago, so the filtered listing has to still carry the client. A row that
    // names its own client holds it through an Enhetsregisteret role instead,
    // where the resource arrives via the role-package coupling rather than a
    // direct grant, and the same expectation would not follow.
    if (clientRow !== null) {
        const filtered = GetClients(
            clientDelegationV2,
            new ClientsQueryBuilder().withParty(party).withResources([row.resource]).build(),
            null,
            labels,
        );

        ClientDelegationV2DomainChecks.CheckClientListed(
            filtered,
            clientId,
            roleCode,
            "GetClients filtered by resource",
        );
    }

    console.log(
        `arrangeDelegationTarget - party ${party} client=${clientId} role=${roleCode}`
        + ` (${row.clientUuid ? "named" : "set up"}) agent=${row.agentUuid}`,
    );

    return { clientId, agentId: row.agentUuid, roleCode };
}

/**
 * The role a client relation the client sets up itself is held through.
 *
 * Creating a connection takes no role parameter: the API decides, and it decides
 * rettighetshaver. A client held through an Enhetsregisteret role instead comes
 * with whatever role ER gave it, which is why a pinned row states its own.
 */
const SEEDED_ROLE = "rettighetshaver";

/**
 * Picks the row whose organisation acts as the client for this one.
 *
 * The neighbour, wrapping at the end, so the rows form a ring and no two of them
 * touch the same pair. That matters once VUs run in parallel: each row sets up
 * and tears down one relation, and a shared pair would mean one VU removing what
 * another just made.
 *
 * The client is a row rather than a column because the row already carries what
 * setting the relation up needs. It is the client's own administrator who grants
 * it, not the facilitator's, so naming only the organisation would leave the test
 * without anyone able to act for it.
 *
 * @param {import("./commons.js").ClientDelegationV2TestRow[]} all Every row in the fixture.
 * @param {import("./commons.js").ClientDelegationV2TestRow} row The row in play.
 * @returns {import("./commons.js").ClientDelegationV2TestRow|null} The row acting as client, or null when the fixture is too small.
 */
function clientRowFor(all, row) {
    if (all.length < 2) {
        return null;
    }

    const index = all.findIndex((candidate) => candidate.orgUuid === row.orgUuid);

    return index === -1 ? null : all[(index + 1) % all.length];
}

/**
 * Has the client let the facilitator act for it, and grant it the resource.
 *
 * Two steps, both as the client's administrator. The connection alone is not
 * enough: a rettighetshaver relation holding nothing does not surface as a
 * client anywhere. The grant is what makes it one, and the right key it needs
 * is opaque, so it has to be read from the delegation check rather than
 * constructed.
 *
 * @param {import("./commons.js").ClientDelegationV2TestRow} clientRow The row acting as client.
 * @param {import("./commons.js").ClientDelegationV2TestRow} row The facilitator row.
 * @returns {boolean} True when the relation is in place.
 */
function setUpClientRelation(clientRow, row) {
    const connections = getConnectionsClient(clientRow);

    const connection = CreateConnection(
        connections,
        new CreateConnectionQueryBuilder().withParty(clientRow.orgUuid).withTo(row.orgUuid).build(),
        null,
        labels,
    );

    if (connection === null) {
        return false;
    }

    const delegable = GetResourceDelegationCheck(
        connections,
        new GetResourceDelegationCheckQueryBuilder().withParty(clientRow.orgUuid).withResource(row.resource).build(),
        labels,
    );

    // The key is opaque and issued per right, so it has to come from the check
    // rather than be constructed. A right that is delegable but carries no key is
    // no use here, so both are required rather than only the first.
    const key = (delegable?.rights ?? [])
        .find((/** @type {*} */ right) => right?.right?.action?.value === "read" && right?.result === true)
        ?.right?.key;

    if (!key) {
        console.error(
            `setUpClientRelation - ${clientRow.orgName} may not delegate read on ${row.resource} onwards;`
            + " the resource has to be one the client's own administrator holds",
        );
        return false;
    }

    return CreateResourceRights(
        connections,
        new CreateResourceRightsQueryBuilder()
            .withParty(clientRow.orgUuid)
            .withTo(row.orgUuid)
            .withResource(row.resource)
            .build(),
        { directRightKeys: [key] },
        labels,
    );
}

/**
 * Removes what setUpClientRelation put there.
 *
 * The grant first, then the connection with cascade, which is the order the
 * Bruno suite unwinds it in. Cascade takes anything still hanging off the
 * relation, so a delegation the test failed to remove does not block it.
 *
 * @param {import("./commons.js").ClientDelegationV2TestRow} clientRow The row acting as client.
 * @param {import("./commons.js").ClientDelegationV2TestRow} row The facilitator row.
 * @returns {void}
 */
function tearDownClientRelation(clientRow, row) {
    const connections = getConnectionsClient(clientRow);

    DeleteResource(
        connections,
        new DeleteResourceQueryBuilder()
            .withParty(clientRow.orgUuid)
            .withFrom(clientRow.orgUuid)
            .withTo(row.orgUuid)
            .withResource(row.resource)
            .build(),
        labels,
    );

    DeleteConnection(
        connections,
        new DeleteConnectionQueryBuilder()
            .withParty(clientRow.orgUuid)
            .withFrom(clientRow.orgUuid)
            .withTo(row.orgUuid)
            .withCascade(true)
            .build(),
        labels,
    );
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
 * A row with no clientUuid brings its own client: the neighbouring row's
 * organisation lets this one act for it, and that relation is removed again at
 * the end. A row that names a client uses it as it stands and sets nothing up,
 * which is what a client held through an Enhetsregisteret role needs, since no
 * test can create one of those.
 *
 * @param {import("./commons.js").ClientDelegationV2TestRow[][]} data One slice per VU, from setup.
 * @returns {void}
 */
export default function (data) {
    const row = getItemFromList(data[exec.vu.idInTest - 1]);
    const clientDelegationV2 = getClient(row);

    const clientRow = row.clientUuid ? null : clientRowFor(data.flat(), row);

    if (!row.clientUuid && clientRow === null) {
        fail("cannot delegate a resource: the fixture has no other row to act as client");
    }

    if (clientRow !== null) {
        const ready = group("Arrange - the client lets the facilitator act for it", function () {
            return setUpClientRelation(clientRow, row);
        });

        // Ending here leaves the relation half made rather than not made at all,
        // so teardown has to sweep it either way. It does, from the fixture.
        if (!ready) {
            fail(`cannot delegate a resource: ${clientRow.orgName} could not be made a client of ${row.orgName}`);
        }
    }

    const target = group("Arrange - find a client, an agent and a role to delegate through", function () {
        return arrangeDelegationTarget(clientDelegationV2, row, clientRow);
    });

    // Nothing below says anything without a client and an agent. A seeded relation
    // is already in place by now, which teardown removes.
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

    if (clientRow !== null) {
        group("5. The client relationship is removed", function () {
            tearDownClientRelation(clientRow, row);
        });
    }
}

/**
 * k6 teardown stage. Removes anything an iteration may have left behind.
 *
 * The iteration already unwinds what it made on the ordinary path. This is for
 * the paths that never reach the end: an iteration that timed out, threw, or was
 * cut short when the run was stopped. Without this, such a run leaves a
 * delegation and possibly a whole client relation in the environment, and the
 * next run sees them as pre-existing state.
 *
 * teardown is not told what the iterations did, so it sweeps the rows this run
 * could have reached rather than every row in the fixture. Sweeping everything
 * would mean a scheduled run tearing down a relation a manual one is in the
 * middle of using. Removing what is not there answers 200 or 204 having changed
 * nothing, so the sweep costs nothing where there is nothing to clean. A row
 * that names its own client is left alone: that relation was not made by the
 * test and is not the test's to remove.
 *
 * The delegation is removed through the client directly rather than through the
 * building block, since a row that has nothing left to remove is the normal case
 * and should not report a check for it. Removing the client relation does go
 * through the building blocks, and so does report: a cleanup that cannot reach
 * the API leaves the environment dirty for the next run, which is worth turning
 * the run red for.
 *
 * @param {import("./commons.js").ClientDelegationV2TestRow[][]} data One slice per VU, from setup.
 * @returns {void}
 */
export function teardown(data) {
    const all = data.flat();

    // Only the rows this run could have drawn. Sweeping every row would mean a
    // scheduled run tearing down a relation a manual one is in the middle of
    // using, and the two have no way of knowing about each other. A VU takes rows
    // from the front of its slice, one per iteration, so that prefix is the reach
    // of this run. Unset means k6 default, which is one of each.
    // Cast for the same reason getNumberOfVUs does it: Scenario is a union and
    // only some of its members carry vus and iterations.
    const scenario = /** @type {*} */ (exec.test.options.scenarios?.default);
    const vus = scenario?.vus ?? 1;
    const iterations = scenario?.iterations ?? 1;
    const perVu = scenario?.executor === "shared-iterations"
        ? Math.ceil(iterations / vus)
        : iterations;

    const touched = data.flatMap((slice) => slice.slice(0, perVu));

    touched.forEach((row) => {
        if (!row.agentUuid) {
            return;
        }

        const clientRow = row.clientUuid ? null : clientRowFor(all, row);
        const clientUuid = row.clientUuid || clientRow?.orgUuid;
        const roleCode = row.roleCode || SEEDED_ROLE;

        if (!clientUuid) {
            return;
        }

        const clientDelegationV2 = getClient(row);

        const { query, payload } = delegationRequest(row, {
            clientId: clientUuid,
            agentId: row.agentUuid,
            roleCode,
        });

        const res = clientDelegationV2.DeleteAgentResources(query, payload);

        if (res.status !== 200) {
            console.warn(`teardown - could not remove the delegation for ${row.orgName}: ${res.status}`);
        } else {
            const changed = (JSON.parse(String(res.body)) ?? [])
                .filter((/** @type {*} */ entry) => entry?.changed);

            if (changed.length > 0) {
                console.info(`teardown - removed a delegation left behind for ${row.orgName}`);
            }
        }

        if (clientRow !== null) {
            tearDownClientRelation(clientRow, row);
        }
    });
}
