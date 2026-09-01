import { fail, group } from "k6";

import { getItemFromList, requireEnv } from "../../../../helpers.js";
import { SystemUserClientDelegationBuildingBlocks, SystemUserClientDelegationDomainChecks } from "../../../authentication-imports.js";
import { AuthorizePost } from "../../../building-blocks/authorization/authorize/post.js";
import { buildSystemUserRequest, getAuthorizeClient } from "../system-user/commons.js";
import { arrangeAgentSystemUser, cleanupArranged, getClients, getFacilitatorTokenOpts } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * The resource the decision is asked about.
 *
 * A resource whose policy permits the ansvarlig-revisor access package, which is
 * what makes it answer differently before and after the delegation. It is published
 * in at22 and tt02 and nowhere else, which is what keeps this test out of at23 and
 * yt01 while delegate-and-remove-client.js still runs in all four.
 */
const RESOURCE = "klientdelegeringressurse2e";

/**
 * The kind of facilitator this test draws.
 *
 * An auditor, because ansvarlig-revisor is theirs and it is the package the
 * resource above permits. A property manager or an accountant would get their own
 * clients delegated just as well, and the decision would stay NotApplicable
 * throughout, so the test would pass without ever having asked anything.
 */
const ORG_TYPE = "revisor";

/**
 * k6 setup stage. Arranges the agent system user the client is delegated to.
 *
 * @returns The arranged facilitator, as a single item list.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AM_UI_BASE_URL", "AUTHORIZATION_SUBSCRIPTION_KEY"]);

    return arrangeAgentSystemUser(ORG_TYPE);
}

/**
 * Test: delegating a client to an agent system user is what gives it access to that
 * client, and removing the client takes it away again.
 *
 * delegate-and-remove-client.js next to this one covers the same five endpoints,
 * but only that they answer and that the delegated list changes. That list is
 * authentication talking about its own bookkeeping. This asks the policy decision
 * point instead, which is what every api in Altinn asks before it lets the agent
 * system user act for the client, so it is the step that says the delegation
 * reached authorization at all.
 *
 * Asked three times, since a Permit on its own would also come from a pdp that
 * permitted everything: NotApplicable before the delegation, Permit after it, and
 * NotApplicable again once the client is removed.
 *
 * @param {any[]} data The arranged facilitators from setup.
 */
export default function (data) {
    const arranged = getItemFromList(data, randomize);
    const [clients, tokenGenerator] = getClients();
    const authorizeClient = getAuthorizeClient();

    tokenGenerator.setTokenGeneratorOptions(getFacilitatorTokenOpts(arranged.facilitator));

    const delegationClient = clients.facilitator.clientDelegationClient;

    group("As a facilitator, delegating a client is what lets the agent system user act for it", function () {
        const client = group("The facilitator has a client that can be delegated", function () {
            const available = SystemUserClientDelegationBuildingBlocks.GetAvailableClients(delegationClient, arranged.systemUserId);

            if (!SystemUserClientDelegationDomainChecks.CheckAvailableClients(available, arranged.facilitator.orgNo)) {
                fail("cannot ask for a decision: the facilitator has no clients available to delegate");
            }

            return available?.data?.[0];
        });

        if (!client?.clientId || !client?.clientOrganizationNumber) {
            fail("cannot ask for a decision: the available clients carried no client id and organisation number");
        }

        const decisionRequest = buildSystemUserRequest(
            arranged.systemUserId,
            RESOURCE,
            client.clientOrganizationNumber,
            "read",
        );

        group("Before the delegation the agent system user cannot act for the client", function () {
            AuthorizePost(authorizeClient, decisionRequest, "NotApplicable");
        });

        group("Delegating the client lets the agent system user act for it", function () {
            SystemUserClientDelegationBuildingBlocks.DelegateClient(delegationClient, arranged.systemUserId, client.clientId);

            AuthorizePost(authorizeClient, decisionRequest, "Permit");
        });

        group("Removing the client takes the access away again", function () {
            SystemUserClientDelegationBuildingBlocks.RemoveClient(delegationClient, arranged.systemUserId, client.clientId);

            AuthorizePost(authorizeClient, decisionRequest, "NotApplicable");
        });
    });
}

/**
 * k6 teardown stage. Deletes the agent system user this test delegated to and the
 * system it belongs to.
 *
 * @param {any[]} data The arranged facilitators from setup.
 */
export function teardown(data) {
    cleanupArranged(data);
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
