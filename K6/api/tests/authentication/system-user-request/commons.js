import http from "k6/http";

import { SystemUserRequestClient as BffSystemUserRequestClient } from "../../../../clients/access-management-bff/system-user-request/index.js";
import {
    RegisterSystemRequestBuilder,
    RequestSystemUserClient,
    SystemRegisterClient,
} from "../../../../clients/authentication/v2/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, PersonalTokenBuilder, PersonalTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { parseCsvData, requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";

/**
 * The vendor these tests act as. Owns the registered systems they create.
 */
const SYSTEM_OWNER = "713431400";

/**
 * Every system registered by these tests allows the same redirect url.
 */
const REDIRECT_URL = "https://digdir.no";

/**
 * @type {object | undefined}
 */
let clients = undefined;

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let approverTokenGenerator = undefined;

/**
 * Fetches the customers the system users are created for.
 *
 * Returned flat rather than segmented per VU, so a test picks from the whole list
 * with getItemFromList, which walks it across iterations.
 *
 * @returns {object[]} The customers the tests act on behalf of.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AM_UI_BASE_URL"]);

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/data-${__ENV.ENVIRONMENT}-all-customers.csv`,
        { tags: { action: "fetch-test-data" } },
    );

    return parseCsvData(res.body);
}

/**
 * Creates and caches the clients this test folder uses.
 *
 * Built once per VU and reused across its iterations. The token generators cache
 * tokens per instance, so building them per iteration refetches every token from
 * the token generator service each time.
 *
 * The vendor token carries only the scopes this folder needs, so it does not ask
 * for the system user lookup scope the change request tests use.
 *
 * The approver token depends on which customer an iteration drew, so swap its
 * options with setTokenGeneratorOptions and getApproverTokenOpts rather than
 * building a new generator. The cache is keyed on the options, so each customer
 * still gets its own cached token.
 *
 * @returns {[object, PersonalTokenGenerator]} Clients grouped by who they act as, and the approver token generator.
 */
export function getClients() {
    if (clients === undefined) {
        const vendorScopes = CreateScopeString([
            AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE,
            AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.WRITE,
            AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.READ,
            AltinnScopes.AUTHORIZATION.AUTHORIZE.DEFAULT,
        ]);

        const vendorTokenGenerator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(vendorScopes)
                .withOrganizationNumber(SYSTEM_OWNER)
                .build(),
        );

        approverTokenGenerator = new PersonalTokenGenerator(
            new PersonalTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
                .build(),
        );

        clients = {
            vendor: {
                systemRegisterClient: new SystemRegisterClient(__ENV.BASE_URL, vendorTokenGenerator),
                requestSystemUserClient: new RequestSystemUserClient(__ENV.BASE_URL, vendorTokenGenerator),
            },
            approver: {
                requestSystemUserClient: new RequestSystemUserClient(__ENV.BASE_URL, approverTokenGenerator),

                // Approving is what the customer does in the portal, so it goes through
                // the bff rather than the authentication api the vendor calls.
                bffRequestClient: new BffSystemUserRequestClient(__ENV.AM_UI_BASE_URL, approverTokenGenerator),
            },
        };
    }

    return [clients, approverTokenGenerator];
}

/**
 * Token options for approving on behalf of a customer.
 *
 * @param {object} customer - The customer this iteration acts on behalf of.
 * @returns {object} Options to hand to setTokenGeneratorOptions.
 */
export function getApproverTokenOpts(customer) {
    return new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
        .withUserId(customer.userId)
        .withPartyUuid(customer.userPartyUuid)
        .build();
}

/**
 * Builds the right that grants access to a single resource.
 *
 * @param {string} resource - Resource identifier.
 * @returns {Right} A right the system register and the requests understand.
 */
export function resourceRight(resource) {
    return {
        resource: [
            {
                value: resource,
                id: "urn:altinn:resource",
            },
        ],
    };
}

/**
 * Builds the identifiers and registration payload for one iteration.
 *
 * Everything here is unique per iteration, so unlike the clients it cannot be
 * shared. The system is registered with every right in registeredRights, which
 * lets a test grant a subset up front and ask for the rest later.
 *
 * @param {object} options - Test specific parts of the registration.
 * @param {string} options.systemNamePrefix - Prefix for the generated system name, so systems are traceable to the test that made them.
 * @param {Right[]} options.registeredRights - Every right the system is registered with.
 * @returns {object} Identifiers and the registration payload.
 */
export function createSystemRegistration({ systemNamePrefix, registeredRights }) {
    const systemName = `${systemNamePrefix}${uuidv4()}`;
    const systemId = `${SYSTEM_OWNER}_${systemName}`;
    const clientId = uuidv4();
    const externalRef = uuidv4();

    const registerSystemRequest = new RegisterSystemRequestBuilder()
        .withId(systemId)
        .withVendor(`0192:${SYSTEM_OWNER}`)
        .withName({
            en: systemName,
            nb: systemName,
            nn: systemName,
        })
        .withDescription({
            en: "This is auto generated by an integration test. Some data is randomized, but some is not - like this description",
            nb: "Integrasjonstest. Noe er randomisert her, men mye blir likt.",
            nn: "integrasjonstest på nynorsk. Noe er randomisert her, men mye blir likt.",
        })
        .withRights(registeredRights)
        .withClientId([clientId])
        .withVisibility(false)
        .withAllowedRedirectUrls([REDIRECT_URL])
        .build();

    return {
        systemOwner: SYSTEM_OWNER,
        systemId,
        systemName,
        clientId,
        externalRef,
        redirectUrl: REDIRECT_URL,
        registerSystemRequest,
    };
}
