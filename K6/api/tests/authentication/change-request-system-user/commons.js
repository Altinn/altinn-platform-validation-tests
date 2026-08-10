import { fail, group } from "k6";
import http from "k6/http";

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
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, PersonalTokenBuilder, PersonalTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { getItemFromList, parseCsvData, requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { ChangeRequestSystemUserDomainChecks, CreateRequestSystemUserBuilder, RequestSystemUserBuildingBlocks, SystemRegisterBuildingBlocks, SystemUserBuildingBlocks, SystemUserRequestDomainChecks } from "../../../authentication-imports.js";
import { PackagesSearch } from "../../../building-blocks/access-management/metadata/packages/index.js";
import { DeleteSystemUser } from "../../../building-blocks/access-management-bff/system-user/index.js";
import { ApproveSystemUserRequest } from "../../../building-blocks/access-management-bff/system-user-request/index.js";
import { withRetries } from "../../../building-blocks/common/retry.js";

/**
 * Whether to pick a random customer rather than walk the list.
 */
const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * Where the test data these tests draw from lives.
 */
const TESTDATA_URL = "https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/change-request";

/**
 * Every system registered by these tests allows the same redirect url.
 */
export const REDIRECT_URL = "https://digdir.no";

/**
 * @type {object | undefined}
 */
let clients = undefined;

/**
 * The vendor the cached clients act as.
 *
 * @type {string | undefined}
 */
let clientsVendorOrgNo = undefined;

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let approverTokenGenerator = undefined;

/**
 * Creates system in system register, requests a system user for it and has the end user approve it.
 * Call from a test's own setup, passing the rights that test cares about, so the
 * test decides what the system user starts with and what is left for it to ask
 * for. Returns only what it created. Clients cannot be returned at all, since k6
 * serializes the setup result to JSON and the prototypes would not survive.
 *
 * @param {object} options - What the calling test needs arranged.
 * @param {string} options.systemNamePrefix - Prefix for the generated system name, so systems are traceable to the test that made them.
 * @param {string} options.vendorOrgNo - Organisation number of the vendor to register the system as. Draw it with pickVendor.
 * @param {Right[]} options.grantedRights - The rights the system user is granted up front.
 * @param {Right[]} [options.registeredRights] - Every right the system is registered with. Defaults to the granted rights, pass more when the test needs a right left over to ask for.
 * @param {string[]} [options.grantedAccessPackages] - Urns of the access packages the system user is granted up front.
 * @param {string[]} [options.registeredAccessPackages] - Urns of every access package the system is registered with. Defaults to the granted ones.
 * @returns {object[]} A single arranged system user, as a list so the test picks from it with getItemFromList like any other test data. Carries the access packages back, so a test can ask for one it does not have and give up one it does.
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
    const customer = getItemFromList(fetchTestData(`end-users-${__ENV.ENVIRONMENT}.csv`), randomize);

    const registration = createSystemRegistration({ systemNamePrefix, vendorOrgNo, registeredRights, registeredAccessPackages });

    // The approver acts as this customer, so its token has to be set before the
    // arrange runs, not in the default function the way the test does it.
    const [, approverTokenGenerator] = getClients(vendorOrgNo);

    approverTokenGenerator.setTokenGeneratorOptions(getApproverTokenOpts(customer));

    const systemUserId = createApprovedSystemUser(registration, customer, grantedRights, grantedAccessPackages);

    return [
        {
            customer,
            vendorOrgNo,
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
    return getItemFromList(fetchTestData("vendors.csv"), randomize).orgNo;
}

/**
 * Fetches one of this test folder's test data files.
 *
 * Read over http from main rather than with k6's open(), which the cloud runner
 * cannot use, so a new file only takes effect once it is merged.
 *
 * @param {string} fileName - File name under the change-request test data folder.
 * @returns {object[]} The rows, keyed by column name.
 */
function fetchTestData(fileName) {
    const res = withRetries(
        () => http.get(`${TESTDATA_URL}/${fileName}`, { tags: { action: "fetch-test-data" } }),
        "fetch-test-data",
    );

    return parseCsvData(res.body);
}

/**
 * Deletes the system users a test arranged.
 *
 * Call from a test's teardown with what its setup returned, so a run does not
 * leave a system user behind on the customer for every time it has run. Deleting
 * is the customer's own action, so it goes through the bff with the approver
 * token, which has to be swapped to the customer that owns each system user.
 *
 * @param {object[]} systemUsers - What arrangeApprovedSystemUser returned.
 */
export function cleanupSystemUsers(systemUsers) {
    group("Cleanup - the customer deletes the system user", function () {
        for (const systemUser of systemUsers ?? []) {
            const [apiClients, tokenGenerator] = getClients(systemUser.vendorOrgNo);

            tokenGenerator.setTokenGeneratorOptions(getApproverTokenOpts(systemUser.customer));

            DeleteSystemUser(apiClients.approver.bffSystemUserClient, systemUser.customer.orgPartyId, systemUser.systemUserId);
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
 * The approver token depends on which customer an iteration drew, so swap its
 * options with setTokenGeneratorOptions and getApproverTokenOpts rather than
 * building a new generator. The cache is keyed on the options, so each customer
 * still gets its own cached token.
 *
 * @param {string} vendorOrgNo - Organisation number the vendor token is minted for. A run draws it once in setup and passes it back in, so every VU acts as the vendor that registered the system.
 * @returns {[object, PersonalTokenGenerator]} Clients grouped by who they act as, and the approver token generator.
 */
export function getClients(vendorOrgNo) {
    // A VU that is handed a different vendor than the one it built its clients
    // for has to rebuild them, or it keeps acting as the previous vendor.
    if (clients !== undefined && clientsVendorOrgNo !== vendorOrgNo) {
        clients = undefined;
    }

    if (clients === undefined) {
        clientsVendorOrgNo = vendorOrgNo;

        const vendorScopes = CreateScopeString([
            AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE,
            AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.WRITE,
            AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.READ,
            AltinnScopes.AUTHORIZATION.AUTHORIZE.DEFAULT,
            AltinnScopes.MASKINPORTEN.SYSTEMUSER.READ,
        ]);

        const vendorTokenGenerator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(vendorScopes)
                .withOrganizationNumber(vendorOrgNo)
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
    const [apiClients] = getClients(vendorOrgNo);

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
 * Builds the identifiers and registration payload for one iteration.
 *
 * Every identifier here is generated fresh, so unlike the clients it cannot be
 * shared. The system is registered with every right in registeredRights, which
 * lets a test grant a subset up front and ask for the rest later.
 *
 * @param {object} options - Test specific parts of the registration.
 * @param {string} options.systemNamePrefix - Prefix for the generated system name, so systems are traceable to the test that made them.
 * @param {string} options.vendorOrgNo - Organisation number of the vendor the system is registered as.
 * @param {Right[]} options.registeredRights - Every right the system is registered with.
 * @param {string[]} options.registeredAccessPackages - Urns of every access package the system is registered with.
 * @returns {object} Identifiers and the registration payload.
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
 * @param {object} registration - Registration from createSystemRegistration.
 * @param {object} customer - The customer the system user is created for.
 * @param {Right[]} grantedRights - The rights the system user is granted up front.
 * @param {string[]} grantedAccessPackages - Urns of the access packages the system user is granted up front.
 * @returns {string} Identifier of the approved system user.
 */
function createApprovedSystemUser(registration, customer, grantedRights, grantedAccessPackages) {
    const [apiClients] = getClients(registration.systemOwner);

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
