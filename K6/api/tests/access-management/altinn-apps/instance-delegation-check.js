import { check, group } from "k6";

import { getOptions, requireEnv } from "../../../../helpers.js";
import { CheckResourceDelegation, GetDelegations } from "../../../building-blocks/access-management/altinn-apps/index.js";
import { getClients, getEmptyTokenClient, getWrongAppClient, INSTANCE_ID, RESOURCE_ID } from "./commons.js";

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

            // Not asserting Delegable, since which rights are delegable is up to
            // the app's policy in this environment. Log what came back so the run
            // says something useful either way.
            check(result, {
                "delegation check returned rights": (r) => (r?.data ?? []).length > 0,
            });

            if (result !== null) {
                console.log(
                    `delegation check statuses: ${JSON.stringify((result.data ?? []).map((item) => ({ rightKey: item.rightKey, status: item.status })))}`,
                );
            }
        });

        group("Read the delegations already on the instance", function () {
            const delegations = GetDelegations(
                appsInstanceDelegationClient,
                RESOURCE_ID,
                INSTANCE_ID,
                getDelegationsLabel,
            );

            // An instance with nothing delegated on it still answers 200 with an
            // empty data array, so this only checks the shape.
            check(delegations, {
                "get delegations returned a data array": (d) => Array.isArray(d?.data),
            });
        });
    });

    // The building blocks assert 200, so the two groups below call the clients
    // directly. They are what makes it visible that the platform access token is
    // the credential these endpoints run on.
    group("Without the right platform access token, the delegations stay out of reach", function () {
        group("An empty platform access token is rejected", function () {
            // Fails the PlatformAccess policy before the controller runs.
            const res = getEmptyTokenClient().CheckResourceDelegation(
                RESOURCE_ID,
                INSTANCE_ID,
                emptyTokenLabel,
            );

            const unauthorized = check(res, {
                "empty platform access token is 401": (r) => r.status === 401,
            });

            if (!unauthorized) {
                console.log(res.status);
                console.log(res.body);
            }
        });

        group("Another app gets an answer, but an empty one", function () {
            // This does not fail loudly. Access Management answers 200 with an
            // empty data array, the same shape as an app that simply has nothing
            // delegable. A test that only checks the status code passes here
            // while asserting nothing, which is why the org and app belong in
            // the client's token generator and not in an optional argument that
            // each call site can forget.
            const res = getWrongAppClient().CheckResourceDelegation(
                RESOURCE_ID,
                INSTANCE_ID,
                wrongAppLabel,
            );

            const silentlyEmpty = check(res, {
                "wrong app in the platform access token is 200": (r) => r.status === 200,
                "wrong app in the platform access token returns no rights": (r) =>
                    (JSON.parse(r.body)?.data ?? []).length === 0,
            });

            if (!silentlyEmpty) {
                console.log(res.status);
                console.log(res.body);
            }
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
