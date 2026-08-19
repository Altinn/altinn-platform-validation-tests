import { group } from "k6";

import { getOptions, requireEnv } from "../../../../helpers.js";
import { CheckResourceDelegation, GetDelegations } from "../../../building-blocks/access-management/altinn-apps/index.js";
import { withRetries } from "../../../building-blocks/common/retry.js";
import { AltinnAppsDomainChecks } from "../../../domain-checks/access-management/altinn-apps.js";
import { EXPECTED_DELEGABLE_RIGHT_KEYS, getClients, getEmptyTokenClient, getWrongAppClient, INSTANCE_ID, RESOURCE_ID } from "./commons.js";

const checkDelegationLabel = { step: "Delegation check as the app that owns the resource" };
const getDelegationsLabel = { step: "Get delegations as the app that owns the resource" };
const emptyTokenLabel = { step: "Delegation check with an empty platform access token" };
const wrongAppLabel = { step: "Delegation check as a different app" };

export const options = getOptions([
    checkDelegationLabel,
    getDelegationsLabel,
    emptyTokenLabel,
    wrongAppLabel,
]);

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    return;
}

/**
 * Test: reading the Apps Instance Delegation API as an app.
 *
 * These endpoints take no user or organization token. The only credential is the
 * platform access token, and the org and app inside it are the identity that
 * performs the delegation. The test calls first as the app that owns the
 * resource, then gets the token wrong in the two ways that are easy to get
 * wrong: an empty token, which is a loud 401, and the wrong app, which is a
 * quiet 200 with nothing in it.
 */
export default function () {
    const [appsInstanceDelegationClient] = getClients();

    group("As an app, I can read the delegations on my own instance", function () {
        group("Check which rights are delegable on the instance", function () {
            const result = CheckResourceDelegation(
                appsInstanceDelegationClient,
                RESOURCE_ID,
                INSTANCE_ID,
                null,
                checkDelegationLabel,
            );

            AltinnAppsDomainChecks.CheckDelegableRights(result, EXPECTED_DELEGABLE_RIGHT_KEYS);
        });

        group("Read the delegations already on the instance", function () {
            const delegations = GetDelegations(
                appsInstanceDelegationClient,
                RESOURCE_ID,
                INSTANCE_ID,
                getDelegationsLabel,
            );

            AltinnAppsDomainChecks.CheckDelegationsShape(delegations);
        });
    });

    // The building blocks assert 200, so the two groups below call the clients
    // directly. They are what makes it visible that the platform access token is
    // the credential these endpoints run on.
    group("Without the right platform access token, the delegations stay out of reach", function () {
        group("An empty platform access token is rejected", function () {
            // Fails the PlatformAccess policy before the controller runs.
            const res = withRetries(
                () => getEmptyTokenClient().CheckResourceDelegation(
                    RESOURCE_ID,
                    INSTANCE_ID,
                    emptyTokenLabel,
                ),
                "CheckResourceDelegation(empty token)",
            );

            AltinnAppsDomainChecks.CheckPlatformAccessTokenRejected(res);
        });

        group("Another app gets an answer, but an empty one", function () {
            // Answering 200 with an empty data array is deliberate, not a bug.
            // Access Management's own suite covers it twice, as
            // PlatformAccessToken_OkEmpty for an app that does not exist and as
            // AppWithoutDelegableRights_OkEmpty for a real app that owns nothing
            // here, and expects 200 with empty data in both.
            //
            // The consequence is ours to handle: getting the org or app wrong
            // looks exactly like having nothing to delegate, so a test that only
            // checks the status code passes while asserting nothing. That is why
            // the org and app belong in the client's token generator and not in
            // an optional argument each call site can forget.
            const res = withRetries(
                () => getWrongAppClient().CheckResourceDelegation(
                    RESOURCE_ID,
                    INSTANCE_ID,
                    wrongAppLabel,
                ),
                "CheckResourceDelegation(wrong app)",
            );

            AltinnAppsDomainChecks.CheckNoRightsForOtherApp(res);
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
