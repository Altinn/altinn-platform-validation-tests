import { group } from "k6";
import exec from "k6/execution";

import { DeleteAgentSystemUserQueryBuilder } from "../../../../clients/access-management-bff/system-user/index.js";
import {
    AgentDelegationRequestFEBuilder,
    CreateAgentSystemUserDelegationQueryBuilder,
    GetAgentSystemUserCustomersQueryBuilder,
    GetAgentSystemUserDelegationsQueryBuilder,
} from "../../../../clients/access-management-bff/system-user-agent-delegation/index.js";
import { getOptions, requireEnv } from "../../../../helpers.js";
import { DeleteAgentSystemUser } from "../../../building-blocks/access-management-bff/system-user/index.js";
import {
    CreateAgentSystemUserDelegation,
    GetAgentSystemUserCustomers,
    GetAgentSystemUserDelegations,
} from "../../../building-blocks/access-management-bff/system-user-agent-delegation/index.js";
import { ClientDelegationDomainChecks } from "../../../domain-checks/access-management/system-user-client-delegation.js";
import {
    arrangeAgentSystemUsers,
    getClients,
    getFacilitators,
    getFacilitatorTokenOpts,
    MAX_CLIENTS_TO_DELEGATE,
} from "./commons.js";

const getCustomersLabel = { step: "Get the clients the facilitator can delegate" };
const getDelegationsLabel = { step: "Get the clients already delegated" };
const delegateClientLabel = { step: "Delegate one client to the agent system user" };

export const options = {
    ...getOptions([getCustomersLabel, getDelegationsLabel, delegateClientLabel]),

    // The arrange registers a system and then walks every facilitator through an
    // agent request, an approval and a lookup, so it needs far longer than the
    // default minute.
    setupTimeout: "10m",
};

/**
 * Gives every facilitator in the test data an approved agent system user.
 *
 * All of it happens here rather than in the iteration, so what the test measures
 * is the delegation and nothing else.
 *
 * @returns {object[]} Facilitators with the uuid of their agent system user.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AM_UI_BASE_URL"]);

    return arrangeAgentSystemUsers(getFacilitators(__ENV.ENVIRONMENT));
}

/**
 * Test: delegating a facilitator's whole client list to its agent system user.
 *
 * Each VU acts as one facilitator, reads the clients it may still delegate and
 * delegates them one by one, which is what a regnskapsfører, revisor or
 * forretningsfører does after taking a system into use. The access management ui
 * sends five at a time; this deliberately does not copy that, and turns the VU
 * count up instead to find where the endpoint gives way.
 *
 * yt01 delegates the whole list, since that is the load the environment exists to
 * measure. Everywhere else it stops at MAX_CLIENTS_TO_DELEGATE, so a facilitator
 * with a very long client list cannot quietly turn a smoke test into a load test.
 *
 * @param {object[]} systemUsers - Facilitators with an agent system user, from setup.
 */
export default function (systemUsers) {
    if (systemUsers.length === 0) {
        // Nothing was arranged, so there is nothing to measure. Failing here would
        // report a delegation problem the test never got far enough to have.
        return;
    }

    const [apiClients, tokenGenerator] = getClients();

    // One facilitator per VU, by VU index, so a VU keeps its own agent system user
    // across iterations and raising the VU count spreads the load over more
    // facilitators. Deliberately not segmentData: it hands empty slices to every
    // VU past the length of the test data, which is exactly where a load test is
    // headed. Modulo instead lets VUs share facilitators once there are more VUs
    // than facilitators.
    const { facilitator, systemUserGuid } = systemUsers[(exec.vu.idInTest - 1) % systemUsers.length];

    tokenGenerator.setTokenGeneratorOptions(getFacilitatorTokenOpts(facilitator));

    group("As a facilitator, I can delegate my clients to my agent system user", function () {
        let clients = [];

        group("Read the clients the agent system user can be given", function () {
            // partyUuid is the organization's, not the user's. Leave it out and the
            // endpoint answers 400 AMUI-00005, and the user's uuid gets the same.
            const customers = GetAgentSystemUserCustomers(
                apiClients.facilitator.agentDelegationClient,
                facilitator.partyId,
                systemUserGuid,
                new GetAgentSystemUserCustomersQueryBuilder()
                    .withPartyUuid(facilitator.orgUuid)
                    .build(),
                getCustomersLabel,
            );

            if (!ClientDelegationDomainChecks.CheckCustomersReturned(customers, facilitator.orgNo)) {
                return;
            }

            // Skip the ones already delegated, the way the ui does before it starts
            // adding. Without this a second iteration on the same facilitator, or a
            // rerun against the same environment, would re-send delegations that
            // already exist.
            const existing = GetAgentSystemUserDelegations(
                apiClients.facilitator.agentDelegationClient,
                facilitator.partyId,
                systemUserGuid,
                new GetAgentSystemUserDelegationsQueryBuilder()
                    .withPartyUuid(facilitator.orgUuid)
                    .build(),
                getDelegationsLabel,
            ) ?? [];

            const alreadyDelegated = new Set(existing.map((delegation) => delegation.customerId));

            clients = customers.filter((customer) => !alreadyDelegated.has(customer.id));

            if (clients.length < customers.length) {
                console.log(`facilitator ${facilitator.orgNo} already had ${customers.length - clients.length} of ${customers.length} clients delegated`);
            }
        });

        group("Delegate every client to the agent system user", function () {
            if (clients.length === 0) {
                return;
            }

            const toDelegate = MAX_CLIENTS_TO_DELEGATE === null
                ? clients
                : clients.slice(0, MAX_CLIENTS_TO_DELEGATE);

            if (toDelegate.length < clients.length) {
                console.log(`facilitator ${facilitator.orgNo} has ${clients.length} clients, delegating the first ${toDelegate.length} and skipping ${clients.length - toDelegate.length}`);
            }

            let delegated = 0;

            for (const client of toDelegate) {
                // The client list already carries the role and packages this
                // facilitator holds over that client, as
                // urn:altinn:external-role:ccr:<role>. Delegating exactly what was
                // handed out beats rebuilding it from the org type and guessing
                // the urn form.
                const body = new AgentDelegationRequestFEBuilder()
                    .withCustomerId(client.id)
                    .withAccess(client.access)
                    .build();

                const delegation = CreateAgentSystemUserDelegation(
                    apiClients.facilitator.agentDelegationClient,
                    facilitator.partyId,
                    systemUserGuid,
                    new CreateAgentSystemUserDelegationQueryBuilder()
                        .withPartyUuid(facilitator.orgUuid)
                        .build(),
                    body,
                    delegateClientLabel,
                );

                if (ClientDelegationDomainChecks.CheckClientDelegated(delegation, client.id)) {
                    delegated += 1;
                } else {
                    console.error(`delegation body that was rejected: ${JSON.stringify(body)}`);
                }
            }

            ClientDelegationDomainChecks.CheckAllClientsDelegated(delegated, toDelegate.length);
        });
    });
}

/**
 * Removes the agent system users the arrange created.
 *
 * Without this every run leaves one behind per facilitator, and they pile up on
 * the same organizations the test data points at. Deleting the system user takes
 * its delegations with it, so the clients are released too.
 *
 * @param {object[]} systemUsers - What setup arranged.
 */
export function teardown(systemUsers) {
    const [apiClients, tokenGenerator] = getClients();

    let deleted = 0;

    for (const { facilitator, systemUserGuid } of systemUsers) {
        tokenGenerator.setTokenGeneratorOptions(getFacilitatorTokenOpts(facilitator));

        const removed = DeleteAgentSystemUser(
            apiClients.facilitator.systemUserClient,
            facilitator.partyId,
            systemUserGuid,
            new DeleteAgentSystemUserQueryBuilder()
                .withPartyUuid(facilitator.orgUuid)
                .build(),
        );

        if (removed) {
            deleted += 1;
        }
    }

    console.log(`teardown - deleted ${deleted} of ${systemUsers.length} agent system users`);
}
