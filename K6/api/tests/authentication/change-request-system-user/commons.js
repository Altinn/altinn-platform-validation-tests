import { fail, group } from "k6";

import { PackagesClient } from "../../../../clients/access-management/metadata/packages/index.js";
import { SystemUserClient as BffSystemUserClient } from "../../../../clients/access-management-bff/system-user/index.js";
import { SystemUserChangeRequestClient } from "../../../../clients/access-management-bff/system-user-change-request/index.js";
import { SystemUserRequestClient as BffSystemUserRequestClient } from "../../../../clients/access-management-bff/system-user-request/index.js";
import {
    ChangeRequestSystemUserClient,
    RegisterSystemRequestBuilder,
    RequestSystemUserClient,
    SystemRegisterClient,
    SystemUserClient,
} from "../../../../clients/authentication/index.js";
import { AccessPackage, Right } from "../../../../clients/authentication/types.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, PersonalTokenBuilder, PersonalTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { fetchTestData, getItemFromList, requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { ChangeRequestSystemUserDomainChecks, CreateRequestSystemUserBuilder, RequestSystemUserBuildingBlocks, SystemRegisterBuildingBlocks, SystemUserBuildingBlocks, SystemUserRequestDomainChecks } from "../../../authentication-imports.js";
import { PackagesSearch } from "../../../building-blocks/access-management/metadata/packages/index.js";
import { DeleteSystemUser } from "../../../building-blocks/access-management-bff/system-user/index.js";
import { ApproveSystemUserRequest } from "../../../building-blocks/access-management-bff/system-user-request/index.js";

/**
 * Whether to pick a random customer rather than walk the list.
 */
const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * The scopes a vendor acts with. The system user lookup scope is what lets the
 * arrange step find the system user it just had approved.
 */
const VENDOR_SCOPES = CreateScopeString([
    AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE,
    AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.WRITE,
    AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.READ,
    AltinnScopes.MASKINPORTEN.SYSTEMUSER.READ,
]);

/**
 * Every system registered by these tests allows the same redirect url.
 */
export const REDIRECT_URL = "https://digdir.no";

/**
 * @type {object | undefined}
 */
let clients = undefined;

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let approverTokenGenerator = undefined;

/**
 * @type {EnterpriseTokenGenerator | undefined}
 */
let vendorTokenGenerator = undefined;

/**
 * What a test needs arranged before it runs.
 *
 * @typedef {object} ArrangeSystemUserParams
 * @property {string} systemNamePrefix Prefix for the generated system name, so systems are traceable to the test that made them.
 * @property {string} vendorOrgNo Organisation number of the vendor to register the system as. Draw it with pickVendor.
 * @property {Right[]} grantedRights The rights the system user is granted up front.
 * @property {Right[]} [registeredRights] Every right the system is registered with. Defaults to the granted rights, pass more when the test needs a right left over to ask for.
 * @property {string[]} [grantedAccessPackages] Urns of the access packages the system user is granted up front.
 * @property {string[]} [registeredAccessPackages] Urns of every access package the system is registered with. Defaults to the granted ones.
 */

/**
 * Creates system in system register, requests a system user for it and has the end user approve it.
 * Call from a test's own setup, passing the rights that test cares about, so the
 * test decides what the system user starts with and what is left for it to ask
 * for. Returns only what it created. Clients cannot be returned at all, since k6
 * serializes the setup result to JSON and the prototypes would not survive.
 *
 * @param {ArrangeSystemUserParams} options - What the calling test needs arranged.
 * @returns A single arranged system user, as a list so the test picks from it with getItemFromList like any other test data. Carries the access packages back, so a test can ask for one it does not have and give up one it does, and the system id so a teardown can remove what was registered.
 */
export function arrangeApprovedSystemUser({
    systemNamePrefix,
    vendorOrgNo,
    grantedRights,
    registeredRights = grantedRights,
    grantedAccessPackages = [],
    registeredAccessPackages = grantedAccessPackages,
}) {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AM_UI_BASE_URL"]);

    // The end users are the ones who can approve for a company without anyone
    // having delegated to them first, so daglig leder in an AS and innehaver in
    // an ENK. Built per environment by `yarn tenor:endusers` in
    // altinn-access-management-frontend, since Tenor holds the same synthetic
    // companies everywhere while the Altinn ids differ per environment.
    const customer = getItemFromList(fetchTestData(`authentication/change-request-system-user/end-users-${__ENV.ENVIRONMENT}.csv`), randomize);

    const registration = createSystemRegistration({ systemNamePrefix, vendorOrgNo, registeredRights, registeredAccessPackages });

    // Both tokens have to be set before the arrange runs, not in the default
    // function the way the test does it.
    const [, approverTokenGenerator, vendorTokenGenerator] = getClients();

    vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(vendorOrgNo));
    approverTokenGenerator.setTokenGeneratorOptions(getApproverTokenOpts(customer));

    const systemUserId = createApprovedSystemUser(registration, customer, grantedRights, grantedAccessPackages);

    return [
        {
            customer,
            vendorOrgNo,
            systemId: registration.systemId,
            systemUserId,
            grantedAccessPackages,
            registeredAccessPackages,
        },
    ];
}

/**
 * Draws the vendor a test registers its system as.
 *
 * The vendor used to be one hardcoded organisation, which meant a run only ever
 * said something about that one. The list is plain synthetic organisations built
 * by `yarn tenor:vendors` in altinn-access-management-frontend, and nothing is
 * looked up for them, since the vendor is only ever the organisation the
 * enterprise token is minted for. So unlike the end users it is not per
 * environment.
 *
 * @returns {string} Organisation number of the vendor to act as.
 */
export function pickVendor() {
    return getItemFromList(fetchTestData("authentication/change-request-system-user/vendors.csv"), randomize).orgNo;
}

/**
 * Removes what a test arranged.
 *
 * Call from a test's teardown with what its setup returned, so a run does not
 * leave a system user on the customer and a system in the register for every
 * time it has run. Deleting the system user is the customer's own action, so it
 * goes through the bff with the approver token, while the system belongs to the
 * vendor that registered it. The system goes last, since it is what the system
 * user is built on.
 *
 * @param {any[]} arranged - What arrangeApprovedSystemUser returned.
 */
export function cleanupArranged(arranged) {
    const [apiClients, approverTokenGenerator, vendorTokenGenerator] = getClients();

    group("Cleanup - the customer deletes the system user and the vendor its system", function () {
        for (const systemUser of arranged ?? []) {
            approverTokenGenerator.setTokenGeneratorOptions(getApproverTokenOpts(systemUser.customer));
            vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(systemUser.vendorOrgNo));

            DeleteSystemUser(apiClients.approver.bffSystemUserClient, systemUser.customer.orgPartyId, systemUser.systemUserId);

            SystemRegisterBuildingBlocks.VendorDelete(apiClients.vendor.systemRegisterClient, systemUser.systemId);
        }
    });
}

/**
 * Creates and caches the clients this test folder uses.
 *
 * Built once per VU and reused across its iterations. The token generators cache
 * tokens per instance, so building them per iteration refetches every token from
 * the token generator service each time.
 *
 * The vendor token adds the system user lookup scope, which the arrange step
 * needs to find the system user it just had approved.
 *
 * Neither token is built for anyone in particular. Who a run acts as is decided
 * by swapping the generator options with setTokenGeneratorOptions, the vendor
 * with getVendorTokenOpts and the approver with getApproverTokenOpts. The cache
 * is keyed on the options, so each of them still gets its own cached token.
 *
 * @returns {[any, PersonalTokenGenerator, EnterpriseTokenGenerator]} Clients grouped by who they act as, and the two token generators.
 */
export function getClients() {
    if (clients === undefined) {
        vendorTokenGenerator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(VENDOR_SCOPES)
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
                changeRequestClient: new ChangeRequestSystemUserClient(__ENV.BASE_URL, vendorTokenGenerator),
                systemUserClient: new SystemUserClient(__ENV.BASE_URL, vendorTokenGenerator),
                packagesClient: new PackagesClient(__ENV.BASE_URL, vendorTokenGenerator),
            },
            approver: {
                requestSystemUserClient: new RequestSystemUserClient(__ENV.BASE_URL, approverTokenGenerator),
                changeRequestClient: new ChangeRequestSystemUserClient(__ENV.BASE_URL, approverTokenGenerator),

                // Approving is what the customer does in the portal, so it goes through
                // the bff rather than the authentication api the vendor calls.
                bffChangeRequestClient: new SystemUserChangeRequestClient(__ENV.AM_UI_BASE_URL, approverTokenGenerator),
                bffRequestClient: new BffSystemUserRequestClient(__ENV.AM_UI_BASE_URL, approverTokenGenerator),
                bffSystemUserClient: new BffSystemUserClient(__ENV.AM_UI_BASE_URL, approverTokenGenerator),
            },
        };
    }

    return [clients, approverTokenGenerator, vendorTokenGenerator];
}

/**
 * Token options for acting as a vendor.
 *
 * The scopes have to be repeated here, since the options replace the ones the
 * generator was built with rather than adding to them.
 *
 * @param {string} vendorOrgNo - Organisation number of the vendor this run acts as.
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
 * @param {any} customer - The customer this iteration acts on behalf of.
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
 * Wraps an access package urn the way the requests expect it.
 *
 * The system register takes bare urns, while the requests and change requests take
 * objects, so this is only needed for the latter two.
 *
 * @param {string} urn - Access package urn.
 * @returns {AccessPackage} The access package.
 */
export function accessPackage(urn) {
    return { urn };
}

/**
 * Finds access packages a system can be registered with and a system user granted.
 *
 * Searching rather than hardcoding urns, so the test keeps working when the
 * package catalogue changes. Only packages that are both delegable and assignable
 * can be handed to a system user, so the rest are filtered out. The list is sorted
 * before slicing, so two runs pick the same packages and a failure is reproducible.
 *
 * @param {number} count - How many packages the caller wants
 * @param {string} vendorOrgNo - Organisation number of the vendor to search as. Draw it with pickVendor.
 * @returns {string[]} The access package urns.
 */
export function findAccessPackages(count, vendorOrgNo) {
    const [apiClients, , vendorTokenGenerator] = getClients();

    vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(vendorOrgNo));

    const results = PackagesSearch(apiClients.vendor.packagesClient, { term: "" }) ?? [];

    const urns = results
        .map((result) => result.object)
        .filter((found) => found?.urn && found.isDelegable && found.isAssignable)
        .map((found) => found.urn)
        .sort();

    if (urns.length < count) {
        fail(`cannot arrange a system user: needed ${count} delegable access packages, the environment has ${urns.length}`);
    }

    return urns.slice(0, count);
}

/**
 * Builds the right that grants access to a single resource.
 *
 * @param {string} resource - Resource identifier.
 * @returns {Right} A right the system register and the requests understand.
 */
export function resource(resource) {
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
 * @property {string} systemNamePrefix Prefix for the generated system name, so systems are traceable to the test that made them.
 * @property {string} vendorOrgNo Organisation number of the vendor the system is registered as.
 * @property {Right[]} registeredRights Every right the system is registered with.
 * @property {string[]} registeredAccessPackages Urns of every access package the system is registered with.
 */

/**
 * Builds the identifiers and registration payload for one iteration.
 *
 * Every identifier here is generated fresh, so unlike the clients it cannot be
 * shared. The system is registered with every right in registeredRights, which
 * lets a test grant a subset up front and ask for the rest later.
 *
 * @param {SystemRegistrationParams} options - Test specific parts of the registration.
 * @returns Identifiers and the registration payload.
 */
function createSystemRegistration({ systemNamePrefix, vendorOrgNo, registeredRights, registeredAccessPackages }) {
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
 * Registers the system, requests a system user for it and has the customer approve it.
 *
 * This is the arrange step for tests about what you can do to an existing system
 * user, so it stays out of those test files. The flow itself is the subject of
 * create-and-confirm-system-user-request.js, which tests it directly.
 *
 * Keeps its own checks, so an arrange that breaks is visible and points at the
 * step that broke rather than surfacing as a confusing failure later, and fails
 * the iteration rather than letting the test carry on without a system user.
 *
 * @param {any} registration - Registration from createSystemRegistration.
 * @param {any} customer - The customer the system user is created for.
 * @param {Right[]} grantedRights - The rights the system user is granted up front.
 * @param {string[]} grantedAccessPackages - Urns of the access packages the system user is granted up front.
 * @returns {string} Identifier of the approved system user.
 */
function createApprovedSystemUser(registration, customer, grantedRights, grantedAccessPackages) {
    const [apiClients] = getClients();

    let systemUserId;

    group("Arrange - the customer has an approved system user", function () {
        const createdSystemId = SystemRegisterBuildingBlocks.VendorCreate(apiClients.vendor.systemRegisterClient, registration.registerSystemRequest);

        if (createdSystemId === null) {
            fail("cannot arrange a system user: registering the system did not return a system id");
        }

        const createRequest = new CreateRequestSystemUserBuilder()
            .withExternalRef(registration.externalRef)
            .withSystemId(registration.systemId)
            .withPartyOrgNo(customer.orgNo)
            .withRights(grantedRights)
            .withAccessPackages(grantedAccessPackages.map(accessPackage))
            .withRedirectUrl(registration.redirectUrl)
            .build();

        const createdRequest = RequestSystemUserBuildingBlocks.VendorCreate(apiClients.vendor.requestSystemUserClient, createRequest);

        SystemUserRequestDomainChecks.CheckRequestCreated(createdRequest, {
            systemId: registration.systemId,
            partyOrgNo: customer.orgNo,
            externalRef: registration.externalRef,
        });

        if (!SystemUserRequestDomainChecks.CheckRequestId(createdRequest?.id)) {
            fail("cannot arrange a system user: creating the system user request returned no id");
        }

        const approved = ApproveSystemUserRequest(
            apiClients.approver.bffRequestClient,
            customer.orgPartyId,
            createdRequest?.id,
        );

        // Nothing to look up unless the request was approved, so stop here rather
        // than let the lookup fail as a second, unrelated failure.
        if (!SystemUserRequestDomainChecks.CheckRequestApproved(approved)) {
            fail("cannot arrange a system user: approving the system user request failed");
        }

        const systemUser = SystemUserBuildingBlocks.GetByExternalId(apiClients.vendor.systemUserClient, {
            clientId: registration.clientId,
            systemProviderOrgNo: registration.systemOwner,
            systemUserOwnerOrgNo: customer.orgNo,
            externalRef: registration.externalRef,
        });

        systemUserId = systemUser?.id;

        if (!ChangeRequestSystemUserDomainChecks.CheckSystemUserToChange(systemUserId)) {
            fail("cannot arrange a system user: the lookup by external ref returned no system user");
        }
    });

    return systemUserId;
}
