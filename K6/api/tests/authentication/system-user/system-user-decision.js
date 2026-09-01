import { group } from "k6";

import { getItemFromList, requireEnv } from "../../../../helpers.js";
import { AuthorizePost } from "../../../building-blocks/authorization/authorize/post.js";
import { arrangeSystemUser, buildSystemUserRequest, cleanupArranged, getAuthorizeClient, GRANTED_RESOURCE } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * k6 setup stage. Arranges the system user the decisions are asked about.
 *
 * @returns The system user, as a single item list.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AM_UI_BASE_URL", "AUTHORIZATION_SUBSCRIPTION_KEY"]);

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
 * @param {any[]} data The arranged system users from setup.
 */
export default function (data) {
    const arranged = getItemFromList(data, randomize);
    const authorizeClient = getAuthorizeClient();

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
                buildSystemUserRequest(arranged.systemUserId, GRANTED_RESOURCE, arranged.vendorOrgNo, "read"),
                "NotApplicable",
            );
        });
    });
}

/**
 * k6 teardown stage. Deletes the system user this test asked about and the system
 * it belongs to.
 *
 * @param {any[]} data The arranged system users from setup.
 */
export function teardown(data) {
    cleanupArranged(data);
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
