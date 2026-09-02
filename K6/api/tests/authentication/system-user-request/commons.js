
import { SystemUserClient as BffSystemUserClient } from "../../../../clients/access-management-bff/system-user/index.js";
import { SystemUserRequestClient as BffSystemUserRequestClient } from "../../../../clients/access-management-bff/system-user-request/index.js";
import {
    RegisterSystemRequestBuilder,
    RequestSystemUserClient,
    SystemRegisterClient,
    SystemUserClient,
} from "../../../../clients/authentication/index.js";
import { Right } from "../../../../clients/authentication/types.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, PersonalTokenBuilder, PersonalTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { fetchTestData, lazy, requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { pickVendor } from "../change-request-system-user/commons.js";
import { sweepRegisteredSystems } from "../commons.js";

/**
 * The scopes a vendor acts with.
 */
const VENDOR_SCOPES = CreateScopeString([
    AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE,
    AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.WRITE,
    AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.READ,
    AltinnScopes.AUTHORIZATION.AUTHORIZE.DEFAULT,

    // The lookup by external id is how a test finds the system user it just had
    // approved, which is what it needs to delete it again.
    AltinnScopes.MASKINPORTEN.SYSTEMUSER.READ,
]);

/**
 * The vendor whose existing system the pagination tests read from.
 */
export const PAGINATION_SYSTEM_OWNER = "312605031";

/**
 * The system the pagination tests page through.
 */
export const PAGINATION_SYSTEM_ID = "312605031_Virksomhetsbruker";

/**
 * Every system registered by these tests allows the same redirect url.
 */
const REDIRECT_URL = "https://digdir.no";

/**
 * @typedef {import("../commons.js").OrganizationUser} Customer
 */

/**
 * The clients this test folder acts with.
 *
 * @typedef {object} RequestClients
 * @property {{systemRegisterClient: SystemRegisterClient, requestSystemUserClient: RequestSystemUserClient, systemUserClient: SystemUserClient}} vendor The vendor that registers the system and asks for the system user.
 * @property {{requestSystemUserClient: RequestSystemUserClient, bffRequestClient: BffSystemUserRequestClient, bffSystemUserClient: BffSystemUserClient}} approver The customer that approves the request, and deletes the system user again.
 */

/**
 * Fetches the customers the system users are created for, and draws the vendor that
 * registers the systems.
 *
 * The customers come back flat rather than segmented per VU, so a test picks from
 * the whole list with getItemFromList, which walks it across iterations.
 *
 * The vendor is drawn once per run rather than per iteration, so a run says
 * something about a different organisation each time while the teardown still knows
 * whose register to sweep. Nothing is looked up for it: the vendor is only ever the
 * organisation the enterprise token is minted for.
 *
 * @returns {{customers: Customer[], vendorOrgNo: string}} The customers the tests act on behalf of, and the vendor they register systems as.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AM_UI_BASE_URL"]);

    return {
        customers: fetchTestData(`authentication/system-user-request/${__ENV.ENVIRONMENT}.csv`),
        vendorOrgNo: pickVendor(),
    };
}

/**
 * Removes the systems a test left in the register.
 *
 * Call from a test's teardown, with the prefix that test names its systems with.
 *
 * @param {string} vendorOrgNo - The vendor from setup.
 * @param {string} systemNamePrefix - The prefix the test names its systems with.
 */
export function sweepSystems(vendorOrgNo, systemNamePrefix) {
    const [clients, , vendorTokenGenerator] = getClients();

    vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(vendorOrgNo));

    sweepRegisteredSystems(clients.vendor.systemRegisterClient, vendorOrgNo, systemNamePrefix, clients.vendor.requestSystemUserClient);
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
 * Neither token is built for anyone in particular. Which vendor and which customer
 * an iteration acts as is decided by swapping the generator options with
 * setTokenGeneratorOptions, the vendor with getVendorTokenOpts and the approver
 * with getApproverTokenOpts. The cache is keyed on the options, so each of them
 * still gets its own cached token.
 *
 * @returns {[RequestClients, PersonalTokenGenerator, EnterpriseTokenGenerator]} Clients grouped by who they act as, and the two token generators.
 */
export const getClients = lazy(function () {
    const vendorTokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(VENDOR_SCOPES)
            .build(),
    );

    const approverTokenGenerator = new PersonalTokenGenerator(
        new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
            .build(),
    );

    /** @type {RequestClients} */
    const clients = {
        vendor: {
            systemRegisterClient: new SystemRegisterClient(__ENV.BASE_URL, vendorTokenGenerator),
            requestSystemUserClient: new RequestSystemUserClient(__ENV.BASE_URL, vendorTokenGenerator),
            systemUserClient: new SystemUserClient(__ENV.BASE_URL, vendorTokenGenerator),
        },
        approver: {
            requestSystemUserClient: new RequestSystemUserClient(__ENV.BASE_URL, approverTokenGenerator),

            // Approving is what the customer does in the portal, so it goes through
            // the bff rather than the authentication api the vendor calls. So is
            // deleting the system user afterwards.
            bffRequestClient: new BffSystemUserRequestClient(__ENV.AM_UI_BASE_URL, approverTokenGenerator),
            bffSystemUserClient: new BffSystemUserClient(__ENV.AM_UI_BASE_URL, approverTokenGenerator),
        },
    };

    /** @type {[RequestClients, PersonalTokenGenerator, EnterpriseTokenGenerator]} */
    const built = [clients, approverTokenGenerator, vendorTokenGenerator];

    return built;
});

/**
 * Token options for acting as a vendor.
 *
 * The scopes have to be repeated here, since the options replace the ones the
 * generator was built with rather than adding to them.
 *
 * @param {string} vendorOrgNo - Organisation number of the vendor this iteration acts as.
 * @returns Options to hand to setTokenGeneratorOptions.
 */
export function getVendorTokenOpts(vendorOrgNo) {
    return new EnterpriseTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(VENDOR_SCOPES)
        .withOrganizationNumber(vendorOrgNo)
        .build();
}

/**
 * Token options for approving on behalf of a customer.
 *
 * @param {Customer} customer - The customer this iteration acts on behalf of.
 * @returns Options to hand to setTokenGeneratorOptions.
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
 * The test specific parts of a system registration.
 *
 * @typedef {object} SystemRegistrationParams
 * @property {string} systemNamePrefix Prefix for the generated system name, so systems are traceable to the test that made them, and so the teardown can find what a failed run left behind.
 * @property {string} vendorOrgNo Organisation number of the vendor the system is registered as, from setup.
 * @property {Right[]} registeredRights Every right the system is registered with.
 * @property {string[]} [registeredAccessPackages] Urns of the access packages the system is registered with. Agent system users are asked for access packages rather than rights.
 */

/**
 * Builds the identifiers and registration payload for one iteration.
 *
 * Everything here is unique per iteration, so unlike the clients it cannot be
 * shared. The system is registered with every right in registeredRights, which
 * lets a test grant a subset up front and ask for the rest later.
 *
 * @param {SystemRegistrationParams} options - Test specific parts of the registration.
 * @returns Identifiers and the registration payload.
 */
export function createSystemRegistration({ systemNamePrefix, vendorOrgNo, registeredRights, registeredAccessPackages = [] }) {
    const systemName = `${systemNamePrefix}${uuidv4()}`;
    const systemId = `${vendorOrgNo}_${systemName}`;
    const clientId = uuidv4();
    const externalRef = uuidv4();

    const registerSystemRequest = new RegisterSystemRequestBuilder()
        .withId(systemId)
        .withVendor(`0192:${vendorOrgNo}`)
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
        .withAccessPackages(registeredAccessPackages)
        .withClientId([clientId])
        .withVisibility(false)
        .withAllowedRedirectUrls([REDIRECT_URL])
        .build();

    return {
        systemOwner: vendorOrgNo,
        systemId,
        systemName,
        clientId,
        externalRef,
        redirectUrl: REDIRECT_URL,
        registerSystemRequest,
    };
}

/**
 * Creates and caches the client the pagination tests read with.
 *
 * A different vendor and a narrower scope than getClients: these tests only list
 * requests for an existing system, so they read as that system's owner and ask
 * for nothing beyond the read scope.
 *
 * Cached at module scope, so a VU builds it once and keeps the token it fetched
 * rather than refetching on every iteration.
 *
 * @returns {[RequestSystemUserClient, EnterpriseTokenGenerator]} The client, and the generator the pagination helper needs to follow next links.
 */
export const getPaginationClients = lazy(function () {
    const paginationTokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(CreateScopeString([AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.READ]))
            .withOrganizationNumber(PAGINATION_SYSTEM_OWNER)
            .build(),
    );

    /** @type {[RequestSystemUserClient, EnterpriseTokenGenerator]} */
    const built = [new RequestSystemUserClient(__ENV.BASE_URL, paginationTokenGenerator), paginationTokenGenerator];

    return built;
});
