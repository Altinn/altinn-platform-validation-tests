import http from "k6/http";

import { AuthorizedPartiesClient } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";

/**
 * The service owner every scenario calls as.
 *
 * The subject to look up is named in the request body on this endpoint, so the
 * token only says who is asking, never who is being asked about. digdir is the
 * same caller the Bruno suite uses, and scenario 11 filters on its org code.
 */
const SERVICE_OWNER = { org: "digdir", orgno: "991825827" };

/**
 * Another service owner's org code, for the org code filter scenario.
 *
 * A plain resource owner may only ask on behalf of the org code it owns, so this
 * one is refused for it and allowed for the admin scope.
 */
export const OTHER_SERVICE_OWNER_ORG_CODE = "skd";

/**
 * The git ref the test data is read from.
 *
 * The fixtures are fetched over HTTPS rather than read off disk, so a scheduled
 * run in the cluster does not depend on a checkout. That means a fixture change
 * only takes effect once it is on the ref named here.
 *
 * FIXME: set back to "main" before merging. This points at the feature branch so
 * the suite can be run by hand while its fixtures are not on main yet. Left as is,
 * the scheduled runs break the moment the branch is deleted.
 */
const TESTDATA_REF = "test/port-serviceowner-authorized-parties-to-k6";

const RAW_BASE = `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/${TESTDATA_REF}/K6/api/tests/access-management`;

/**
 * Clients keyed by the scope string their token carries.
 *
 * Scenarios 08 and 11 need several callers in one run, so the client cannot be a
 * single module level singleton the way it is in the enduser suite. Keying on the
 * scope string keeps one client per credential, and EnterpriseTokenGenerator
 * already caches its token per option set for the lifetime of the VU, so this
 * costs one token fetch per scope rather than one per request.
 *
 * @type {Map<string, AuthorizedPartiesClient>}
 */
const clientsByScope = new Map();

/**
 * Creates and caches a client whose enterprise token carries exactly these scopes.
 *
 * @param {Array<string>} scopes - Scopes to mint the enterprise token with.
 * @returns {AuthorizedPartiesClient} A client calling as the service owner with those scopes.
 */
function getClientForScopes(scopes) {
    const scopeString = CreateScopeString(scopes);

    if (!clientsByScope.has(scopeString)) {
        const options = new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withOrganization(SERVICE_OWNER.org)
            .withOrganizationNumber(SERVICE_OWNER.orgno)
            .withScopes(scopeString)
            .withTtl(3600)
            .build();

        clientsByScope.set(scopeString, new AuthorizedPartiesClient(
            __ENV.BASE_URL,
            new EnterpriseTokenGenerator(options),
        ));
    }

    return clientsByScope.get(scopeString);
}

/**
 * The client every positive scenario calls with, carrying the resource owner scope.
 *
 * Returns an array so the scenario files destructure it the same way the enduser
 * suite does.
 *
 * @returns {[AuthorizedPartiesClient]} The resource owner client.
 */
export function getClients() {
    return [getClientForScopes([AltinnScopes.ACCESSMANAGEMENT.AUTHORIZEDPARTIES.RESOURCEOWNER])];
}

/**
 * A client carrying the admin scope, the other scope the policy accepts.
 *
 * The admin scope additionally allows the org code filter to name any service
 * owner, where a plain resource owner is limited to its own.
 *
 * @returns {AuthorizedPartiesClient} A client calling with the admin scope.
 */
export function getAdminClient() {
    return getClientForScopes([AltinnScopes.ACCESSMANAGEMENT.AUTHORIZEDPARTIES.ADMIN]);
}

/**
 * A client whose token is valid but carries a scope this policy does not accept.
 *
 * Authentication succeeds and authorization does not, so this is the 403 case
 * rather than the 401 one. Any unaccepted scope will do; instances.read is the
 * one the Bruno suite reaches for, give or take a dot for a colon.
 *
 * @returns {AuthorizedPartiesClient} A client calling with an insufficient scope.
 */
export function getWrongScopeClient() {
    return getClientForScopes([AltinnScopes.INSTANCES.READ]);
}

/**
 * A client that sends no Authorization header at all.
 *
 * A stub generator rather than an EnterpriseTokenGenerator, since the token
 * generator has no way to hand out an empty token, and the client omits the
 * header entirely when it gets one.
 *
 * @returns {AuthorizedPartiesClient} An unauthenticated client.
 */
export function getNoTokenClient() {
    return new AuthorizedPartiesClient(__ENV.BASE_URL, { getToken: () => "" });
}

/**
 * Fetches the fixtures every scenario reads.
 *
 * `testdata` is the accounting firm tree this suite brought with it. `hierarchy`
 * is the main unit and subunit delegation tree the enduser suite already carries,
 * reused as is by the delegation directions scenario, since both suites were
 * ported from the same Bruno fixture.
 *
 * @returns {{testdata: object, hierarchy: object, sharedTestData: object}} The fixtures.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const fetchJson = (url) => JSON.parse(
        http.get(url, { tags: { action: "fetch-test-data" } }).body,
    );

    return {
        testdata: fetchJson(`${RAW_BASE}/resource-owner/testdata-${__ENV.ENVIRONMENT}.json`),
        hierarchy: fetchJson(`${RAW_BASE}/enduser/testdata-${__ENV.ENVIRONMENT}.json`),
        sharedTestData: fetchJson(`${RAW_BASE}/enduser/shared-testdata.json`),
    };
}
