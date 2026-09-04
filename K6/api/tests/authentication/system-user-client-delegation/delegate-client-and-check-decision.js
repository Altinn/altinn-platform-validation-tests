import { fail, group } from "k6";

import { buildSystemUserRequest } from "../../../../clients/authorization/builders.js";
import { getItemFromList, requireEnv } from "../../../../helpers.js";
import { SystemUserClientDelegationBuildingBlocks, SystemUserClientDelegationDomainChecks } from "../../../authentication-imports.js";
import { AuthorizePost } from "../../../building-blocks/authorization/authorize/post.js";
import { getAuthorizeClient } from "../../authorization/authorize-client.js";
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
const SYSTEM_NAME_PREFIX = "clientdelegation-decision";

/**
 * The resource the decision is asked about.
 *
 * A resource whose policy permits the ansvarlig-revisor access package, which is
 * what the delegated client brings the agent system user. It is published in at22
 * and tt02 and nowhere else, which is what keeps this test out of at23 and yt01
 * while delegate-and-remove-client.js still runs in all four.
 */
const RESOURCE = "klientdelegeringressurse2e";

/**
 * The kind of facilitator this test draws.
 *
 * An auditor, because ansvarlig-revisor is theirs and it is the package the
 * resource above permits. A property manager or an accountant would get their own
 * clients delegated just as well, but the decision would stay NotApplicable
 * throughout, so the test would pass without ever having asked anything.
 */
const ORG_TYPE = "revisor";

/**
 * The environments the resource above is published in, and so the only ones this
 * test says anything in.
 *
 * @type {string[]}
 */
const ENVIRONMENTS = ["at22", "tt02"];

/**
 * k6 setup stage. Arranges the agent system user the client is delegated to.
 *
 * @returns The arranged facilitator, as a single item list.
 */
export function setup() {
    // Only what the skips below need. requireEnv throws, and a throw in setup ends
    // the whole run, so the rest is asked for after them or the aggregate run-all
    // two levels up would die here in the environments this test skips.
    requireEnv(["ENVIRONMENT"]);

    // Skipped rather than failed, in both cases, so the folder's run-all and the
    // aggregate one stay usable where this test cannot say anything, and so nothing
    // is arranged that it would not get to ask about. What runs where is decided by
    // functional.yaml, which lists the two environments below.
    if (!ENVIRONMENTS.includes(__ENV.ENVIRONMENT)) {
        console.warn(`setup - skipping the client delegation decision test in ${__ENV.ENVIRONMENT}: ${RESOURCE} is only published in ${ENVIRONMENTS.join(" and ")}`);

        return [];
    }

    // The pdp sits behind API management and answers 401 without a subscription key.
    if (!__ENV.AUTHORIZATION_SUBSCRIPTION_KEY) {
        console.warn(`setup - skipping the client delegation decision test in ${__ENV.ENVIRONMENT}: it needs AUTHORIZATION_SUBSCRIPTION_KEY to reach the pdp`);

        return [];
    }

    return arrangeAgentSystemUser(SYSTEM_NAME_PREFIX, ORG_TYPE);
}

/**
 * Test: delegating a client to an agent system user is what gives it access to
 * that client.
 *
 * delegate-and-remove-client.js next to this one covers the same endpoints, but
 * only that they answer and that the delegated list changes. That list is
 * authentication talking about its own bookkeeping. This asks the policy decision
 * point instead, which is what every api in Altinn asks before it lets the agent
 * system user act for the client, so it is the step that says the delegation
 * reached authorization at all.
 *
 * Asked once, and only in the direction the delegation opens. The obvious shape was
 * NotApplicable before, Permit after and NotApplicable again once the client is
 * removed, and it does not hold: access management caches a decision for five
 * minutes, so a question asked before the delegation is answered from that cache
 * afterwards, and a question asked after the removal is answered from the
 * delegation that is already gone. Measured in at22, the answer alternated between
 * Permit and NotApplicable for over a minute after both operations. So the negative
 * half of this belongs to whoever fixes the cache, not to a test.
 *
 * @param {ReturnType<typeof setup>} data The arranged facilitators from setup.
 */
export default function (data) {
    // Empty where the resource is not published or there is no subscription key.
    // See setup.
    if ((data ?? []).length === 0) {
        return;
    }

    const arranged = getItemFromList(data, randomize);
    const { clients, facilitatorTokenGenerator } = getClients();
    const [authorizeClient] = getAuthorizeClient();

    facilitatorTokenGenerator.setTokenGeneratorOptions(getFacilitatorTokenOpts(arranged.facilitator));

    const delegationClient = clients.facilitator.clientDelegationClient;

    group("As a facilitator, delegating a client is what lets the agent system user act for it", function () {
        const client = group("The facilitator has a client that can be delegated", function () {
            const available = SystemUserClientDelegationBuildingBlocks.GetAvailableClients(delegationClient, arranged.systemUserId);

            if (!SystemUserClientDelegationDomainChecks.CheckAvailableClients(available, arranged.facilitator.orgNo)) {
                fail("cannot ask for a decision: the facilitator has no clients available to delegate");
            }

            return available?.data?.[0];
        });

        const clientId = client?.clientId;
        const clientOrgNo = client?.clientOrganizationNumber;

        if (!clientId || !clientOrgNo) {
            fail("cannot ask for a decision: the available clients carried no client id and organisation number");
        }

        const decisionRequest = buildSystemUserRequest(arranged.systemUserId, RESOURCE, clientOrgNo, "read");

        group("Delegating the client lets the agent system user act for it", function () {
            SystemUserClientDelegationBuildingBlocks.DelegateClient(delegationClient, arranged.systemUserId, clientId);

            AuthorizePost(authorizeClient, decisionRequest, "Permit");
        });
    });
}

/**
 * k6 teardown stage. Deletes the agent system user this test delegated to and the
 * system it belongs to.
 *
 * The delegation itself is not taken back: it goes with the agent system user, and
 * removing it first would only be a write into the cache described above.
 *
 * @param {ReturnType<typeof setup>} data The arranged facilitators from setup.
 */
export function teardown(data) {
    cleanupArranged(data);
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
