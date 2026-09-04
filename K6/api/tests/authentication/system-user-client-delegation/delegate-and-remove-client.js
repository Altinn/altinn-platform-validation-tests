import { fail, group } from "k6";

import { getItemFromList } from "../../../../helpers.js";
import { SystemUserClientDelegationBuildingBlocks, SystemUserClientDelegationDomainChecks } from "../../../authentication-imports.js";
import { arrangeAgentSystemUser, cleanupArranged, getClients, getFacilitatorTokenOpts } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * What this test names the system it registers, and so what its teardown sweeps up.
 *
 * Unique to this file. functional.yaml lists the two tests in this folder as their
 * own test definitions, so they run as two k6 processes at the same time, and both
 * draw a vendor at random from the same list. Drawing the same one used to be
 * enough for one run's sweep to withdraw the other's pending agent request while
 * its approval was still in flight, which answered 404 on an id the vendor had just
 * been handed. Observed in at22, where the pdp call in front of the approval left a
 * 1.5 second window for the other run's teardown to land in.
 */
const SYSTEM_NAME_PREFIX = "clientdelegation-remove";

/**
 * k6 setup stage. Arranges the agent system user the clients are delegated to.
 *
 * @returns The arranged facilitator, as a single item list.
 */
export function setup() {
    return arrangeAgentSystemUser(SYSTEM_NAME_PREFIX);
}

/**
 * Test: a facilitator can delegate one of its clients to an agent system user and
 * take it back again.
 *
 * Covers the five client delegation endpoints in one flow, since none of them says
 * much on its own: listing the agent system users finds what to delegate to,
 * listing the available clients finds what to delegate, and the delegated list is
 * what says whether the delegation and the removal took effect.
 *
 * @param {ReturnType<typeof setup>} data The arranged facilitators from setup.
 */
export default function (data) {
    const arranged = getItemFromList(data, randomize);
    const { clients, facilitatorTokenGenerator } = getClients();

    facilitatorTokenGenerator.setTokenGeneratorOptions(getFacilitatorTokenOpts(arranged.facilitator));

    const delegationClient = clients.facilitator.clientDelegationClient;

    group("As a facilitator, I can delegate a client to an agent system user and remove it again", function () {
        group("The agent system user is listed for the facilitator", function () {
            const agents = SystemUserClientDelegationBuildingBlocks.GetAgents(delegationClient, arranged.facilitator.orgNo);

            SystemUserClientDelegationDomainChecks.CheckAgentSystemUserListed(agents, arranged.systemUserId);
        });

        const clientId = group("The facilitator has clients that can be delegated", function () {
            const available = SystemUserClientDelegationBuildingBlocks.GetAvailableClients(delegationClient, arranged.systemUserId);

            // Nothing below says anything without a client to delegate, so an empty
            // list ends the iteration here rather than failing every check on the
            // same cause.
            if (!SystemUserClientDelegationDomainChecks.CheckAvailableClients(available, arranged.facilitator.orgNo)) {
                fail("cannot delegate a client: the facilitator has none available");
            }

            return available?.data?.[0]?.clientId;
        });

        if (clientId === undefined) {
            fail("cannot delegate a client: the available clients carried no client id");
        }

        group("Delegate the client to the agent system user", function () {
            const delegation = SystemUserClientDelegationBuildingBlocks.DelegateClient(delegationClient, arranged.systemUserId, clientId);

            SystemUserClientDelegationDomainChecks.CheckDelegationEchoesClient(
                delegation,
                { agent: arranged.systemUserId, client: clientId },
                "DelegateClient",
            );

            const delegated = SystemUserClientDelegationBuildingBlocks.GetClients(delegationClient, arranged.systemUserId);

            SystemUserClientDelegationDomainChecks.CheckClientDelegated(delegated, clientId);
        });

        group("Remove the client from the agent system user", function () {
            const removal = SystemUserClientDelegationBuildingBlocks.RemoveClient(delegationClient, arranged.systemUserId, clientId);

            SystemUserClientDelegationDomainChecks.CheckDelegationEchoesClient(
                removal,
                { agent: arranged.systemUserId, client: clientId },
                "RemoveClient",
            );

            const delegated = SystemUserClientDelegationBuildingBlocks.GetClients(delegationClient, arranged.systemUserId);

            SystemUserClientDelegationDomainChecks.CheckClientNotDelegated(delegated, clientId);
        });
    });
}

/**
 * k6 teardown stage. Deletes the agent system user this test delegated to and the
 * system it belongs to.
 *
 * Every iteration shares the one system user setup arranged, so it cannot be
 * deleted from the test itself without pulling it out from under the iterations
 * that follow.
 *
 * @param {ReturnType<typeof setup>} data The arranged facilitators from setup.
 */
export function teardown(data) {
    cleanupArranged(data);
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
