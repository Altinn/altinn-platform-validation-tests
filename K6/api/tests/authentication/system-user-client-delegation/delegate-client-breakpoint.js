import { check, fail, group } from "k6";
import exec from "k6/execution";

import { getOptions } from "../../../../helpers.js";
import { SystemUserClientDelegationBuildingBlocks, SystemUserClientDelegationClient } from "../../../authentication-imports.js";
import { arrangeAgentSystemUser, cleanupArranged, getClients, getFacilitatorTokenOpts } from "./commons.js";

const SYSTEM_NAME_PREFIX = "clientdelegation-breakpoint";

/**
 * An auditor in yt01 with about 6600 clients, from the facilitator csv.
 */
const FACILITATOR_ORG_NO = "310495670";

/**
 * Every agent system user can be given all of the auditor's clients, so 15 of them
 * give about 100 000 delegations, enough for a 10 minute ramp to 50 VUs.
 */
const AGENT_SYSTEM_USERS = 15;

const MIN_CLIENTS = 2000;

export const options = {
    ...getOptions([SystemUserClientDelegationClient.TAGS.DelegateClient]),
    setupTimeout: "10m",
    teardownTimeout: "10m",
};

/**
 * k6 setup stage. Gives the auditor its agent system users and lists the clients
 * they can be given.
 *
 * @returns The arranged agent system users and the client ids available to them.
 */
export function setup() {
    if (__ENV.ENVIRONMENT !== "yt01") {
        fail(`the client delegation breakpoint test runs in yt01 only, not in ${__ENV.ENVIRONMENT}`);
    }

    const arranged = Array.from(
        { length: AGENT_SYSTEM_USERS },
        () => arrangeAgentSystemUser(SYSTEM_NAME_PREFIX, "revisor", FACILITATOR_ORG_NO)[0],
    );
    const { clients, facilitatorTokenGenerator } = getClients();

    facilitatorTokenGenerator.setTokenGeneratorOptions(getFacilitatorTokenOpts(arranged[0].facilitator));

    // They are all asked for the same access packages, so they have the same clients available.
    const available = SystemUserClientDelegationBuildingBlocks.GetAvailableClients(clients.facilitator.clientDelegationClient, arranged[0].systemUserId);
    const clientIds = (available?.data ?? []).map((client) => client.clientId);

    if (!check(clientIds, { [`the facilitator has at least ${MIN_CLIENTS} clients available`]: (ids) => ids.length >= MIN_CLIENTS })) {
        cleanupArranged(arranged);

        fail(`cannot run the breakpoint: ${FACILITATOR_ORG_NO} has ${clientIds.length} clients available, needs ${MIN_CLIENTS}`);
    }

    return {
        arranged,
        facilitator: arranged[0].facilitator,
        systemUserIds: arranged.map((arrangement) => arrangement.systemUserId),
        clientIds,
    };
}

/**
 * Test: a facilitator delegates clients to its agent system users under increasing
 * load.
 *
 * The iteration number across all VUs picks the pair, so no client is delegated
 * twice to the same agent system user. The run stops once every pair is delegated.
 *
 * @param {ReturnType<typeof setup>} data The arranged agent system users and their available clients.
 */
export default function (data) {
    const iteration = exec.scenario.iterationInTest;
    const total = data.systemUserIds.length * data.clientIds.length;

    if (iteration >= total) {
        exec.test.abort(`all ${total} delegations are done`);
    }

    const { clients, facilitatorTokenGenerator } = getClients();

    facilitatorTokenGenerator.setTokenGeneratorOptions(getFacilitatorTokenOpts(data.facilitator));

    const systemUserId = data.systemUserIds[iteration % data.systemUserIds.length];
    const clientId = data.clientIds[Math.floor(iteration / data.systemUserIds.length)];

    group("As a facilitator, I can delegate a client to an agent system user", function () {
        SystemUserClientDelegationBuildingBlocks.DelegateClient(clients.facilitator.clientDelegationClient, systemUserId, clientId);
    });
}

/**
 * k6 teardown stage. Deletes the agent system users, which takes their client
 * delegations with them, and the systems they belong to.
 *
 * @param {ReturnType<typeof setup>} data The arranged agent system users and their available clients.
 */
export function teardown(data) {
    cleanupArranged(data.arranged);
}
