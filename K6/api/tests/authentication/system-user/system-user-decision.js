import { group } from "k6";

import { buildSystemUserRequest } from "../../../../clients/authorization/builders.js";
import { getItemFromList, requireEnv } from "../../../../helpers.js";
import { AuthorizePost } from "../../../building-blocks/authorization/authorize/post.js";
import { getAuthorizeClient } from "../../authorization/authorize-client.js";
import { arrangeSystemUser, cleanupArranged, GRANTED_RESOURCE } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * The organisation the negative question is asked for.
 *
 * Fixed rather than drawn, and drawn from neither list on purpose. The obvious
 * choice was the vendor this iteration registered its system as, but the vendors and
 * the end users overlap: half of vendors.csv also appears in end-users-<env>.csv, so
 * roughly one iteration in four hundred would draw the customer as its own vendor,
 * ask the positive question twice and report the second as a failure. On a scheduled
 * run that is a false alarm every few days, and one that reads exactly like a real
 * regression.
 *
 * 312605031 is the organisation the seeded systems in these tests belong to. It is a
 * vendor, never a customer, so it is in no end-users-<env>.csv in any environment,
 * and the system user under test can never have been granted anything for it.
 *
 * @type {string}
 */
const OTHER_ORG_NO = "312605031";

/**
 * k6 setup stage. Arranges the system user the decisions are asked about.
 *
 * @returns The system user, as a single item list.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AM_UI_BASE_URL"]);

    // The pdp sits behind API management and answers 401 without a subscription key,
    // and there is no authorization-subscription-key-at23 to give this test there.
    // Skipped rather than failed, so the folder's run-all stays usable in at23, and
    // so nothing is arranged that the test would not get to ask about. What runs
    // where is decided by functional.yaml, which lists the three that have a key.
    if (!__ENV.AUTHORIZATION_SUBSCRIPTION_KEY) {
        console.warn(`setup - skipping the system user decision test in ${__ENV.ENVIRONMENT}: it needs AUTHORIZATION_SUBSCRIPTION_KEY to reach the pdp`);

        return [];
    }

    return arrangeSystemUser("systemuserdecision");
}

/**
 * Test: an approved system user is actually permitted to do what it was granted.
 *
 * Everything else in this folder checks that the system user apis answer the way
 * they should, which they do whether or not the rights ever reach the policy
 * decision point. This asks the pdp instead, which is the component every api in
 * Altinn asks before it lets the system user in, so it is the step that says the
 * approval had an effect rather than only a status code.
 *
 * Asked twice, since a Permit on its own does not say much: a pdp that permitted
 * everything would pass that check. The second question is the same right for a
 * different organisation, which has to come back NotApplicable, because a system
 * user is granted for the one customer that approved it and for no one else.
 *
 * @param {ReturnType<typeof setup>} data The arranged system users from setup.
 */
export default function (data) {
    // Empty where there is no subscription key. See setup.
    if ((data ?? []).length === 0) {
        return;
    }

    const arranged = getItemFromList(data, randomize);
    const [authorizeClient] = getAuthorizeClient();

    group("As the customer that approved it, my system user has the right it was granted", function () {
        group("The system user may read the resource for the customer that approved it", function () {
            AuthorizePost(
                authorizeClient,
                buildSystemUserRequest(arranged.systemUserId, GRANTED_RESOURCE, arranged.customer.orgNo, "read"),
                "Permit",
            );
        });

        group("The same right does not reach another organisation", function () {
            AuthorizePost(
                authorizeClient,
                buildSystemUserRequest(arranged.systemUserId, GRANTED_RESOURCE, OTHER_ORG_NO, "read"),
                "NotApplicable",
            );
        });
    });
}

/**
 * k6 teardown stage. Deletes the system user this test asked about and the system
 * it belongs to.
 *
 * @param {ReturnType<typeof setup>} data The arranged system users from setup.
 */
export function teardown(data) {
    cleanupArranged(data);
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
