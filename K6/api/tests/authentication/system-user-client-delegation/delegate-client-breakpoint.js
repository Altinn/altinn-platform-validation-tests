import { fail, group } from "k6";
import exec from "k6/execution";

import { getOptions } from "../../../../helpers.js";
import { SystemUserClientDelegationBuildingBlocks, SystemUserClientDelegationClient } from "../../../authentication-imports.js";
import { arrangeBreakpoint, cleanupArranged, getClients, getFacilitatorTokenOpts } from "./commons.js";

const SYSTEM_NAME_PREFIX = "clientdelegation-breakpoint";

/**
 * The auditors in yt01 with more than 5000 clients, from the facilitator csv.
 */
const FACILITATOR_ORG_NOS = ["310495670", "313588270", "312939053"];

/**
 * Every agent system user can be given all of its auditor's clients, so 5 per
 * auditor give about 90 000 delegations, enough for a 10 minute ramp to 100 VUs.
 */
const AGENT_SYSTEM_USERS_PER_FACILITATOR = 5;

const MIN_CLIENTS = 2000;

export const options = {
    ...getOptions([SystemUserClientDelegationClient.TAGS.DelegateClient]),
    setupTimeout: "10m",
    teardownTimeout: "10m",
};

/**
 * k6 setup stage. Gives each auditor its agent system users and lists the clients
 * they can be given.
 *
 * @returns {import("./commons.js").ArrangedBreakpoint} The agent system users and the clients available per auditor.
 */
export function setup() {
    if (__ENV.ENVIRONMENT !== "yt01") {
        fail(`the client delegation breakpoint test runs in yt01 only, not in ${__ENV.ENVIRONMENT}`);
    }

    return arrangeBreakpoint(SYSTEM_NAME_PREFIX, FACILITATOR_ORG_NOS, AGENT_SYSTEM_USERS_PER_FACILITATOR, MIN_CLIENTS);
}

/**
 * Test: auditors delegate clients to their agent system users under increasing load.
 *
 * The iteration number across all VUs picks the agent system user and how far it
 * has come through its clients, so no client is delegated twice to the same agent
 * system user. The run stops once every agent system user has been through its clients.
 *
 * @param {import("./commons.js").ArrangedBreakpoint} data The arranged agent system users and the clients available per auditor.
 */
export default function (data) {
    const iteration = exec.scenario.iterationInTest;
    const total = data.agents.length * data.clientsPerAgent;

    if (iteration >= total) {
        exec.test.abort(`all ${total} delegations are done`);
    }

    const agent = data.agents[iteration % data.agents.length];
    const { facilitator, clientIds } = data.facilitators[agent.facilitatorIndex];
    const clientId = clientIds[(agent.clientOffset + Math.floor(iteration / data.agents.length)) % clientIds.length];

    const { clients, facilitatorTokenGenerator } = getClients();

    facilitatorTokenGenerator.setTokenGeneratorOptions(getFacilitatorTokenOpts(facilitator));

    group("As a facilitator, I can delegate a client to an agent system user", function () {
        SystemUserClientDelegationBuildingBlocks.DelegateClient(clients.facilitator.clientDelegationClient, agent.systemUserId, clientId);
    });
}

/**
 * k6 teardown stage. Deletes the agent system users, which takes their client
 * delegations with them, and the systems they belong to.
 *
 * @param {import("./commons.js").ArrangedBreakpoint} data The arranged agent system users and the clients available per auditor.
 */
export function teardown(data) {
    cleanupArranged(data.arranged);
}
