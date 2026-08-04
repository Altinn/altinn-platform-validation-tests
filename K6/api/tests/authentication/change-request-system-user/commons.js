import { fail, group } from "k6";
import http from "k6/http";

import {
    ChangeRequestSystemUserClient,
    RegisterSystemRequestBuilder,
    RequestSystemUserClient,
    SystemRegisterClient,
    SystemUserClient,
} from "../../../../clients/authentication/v2/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, PersonalTokenBuilder, PersonalTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { getItemFromList, parseCsvData, requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { CreateRequestSystemUserBuilder, RequestSystemUserBuildingBlocks, SystemRegisterBuildingBlocks, SystemUserBuildingBlocks, SystemUserRequestDomainChecks } from "../../../authentication-v2-imports.js";
import { PrerequisiteDomainChecks } from "../../../domain-checks/common/prerequisite.js";

/**
 * Whether to pick a random customer rather than walk the list.
 */
const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * The vendor these tests act as. Owns the registered systems they create.
 */
const SYSTEM_OWNER = "713431400";

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
 * Creates system in system register, requests a system user for it and has the end user approve it.
 * Call from a test's own setup, passing the rights that test cares about, so the
 * test decides what the system user starts with and what is left for it to ask
 * for. Returns only what it created. Clients cannot be returned at all, since k6
 * serializes the setup result to JSON and the prototypes would not survive.
 *
 * @param {object} options - What the calling test needs arranged.
 * @param {string} options.systemNamePrefix - Prefix for the generated system name, so systems are traceable to the test that made them.
 * @param {Right[]} options.grantedRights - The rights the system user is granted up front.
 * @param {Right[]} [options.registeredRights] - Every right the system is registered with. Defaults to the granted rights, pass more when the test needs a right left over to ask for.
 * @returns {object[]} A single arranged system user, as a list so the test picks from it with getItemFromList like any other test data.
 */
export function arrangeApprovedSystemUser({ systemNamePrefix, grantedRights, registeredRights = grantedRights }) {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/data-${__ENV.ENVIRONMENT}-all-customers.csv`,
        { tags: { action: "fetch-test-data" } },
    );

    const customer = getItemFromList(parseCsvData(res.body), randomize);

    const registration = createSystemRegistration({ systemNamePrefix, registeredRights });

    // The approver acts as this customer, so its token has to be set before the
    // arrange runs, not in the default function the way the test does it.
    const [, approverTokenGenerator] = getClients();

    approverTokenGenerator.setTokenGeneratorOptions(getApproverTokenOpts(customer));

    const systemUserId = createApprovedSystemUser(registration, customer, grantedRights);

    return [
        {
            customer,
            systemUserId,
        },
    ];
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
 * @returns {[object, PersonalTokenGenerator]} Clients grouped by who they act as, and the approver token generator.
 */
export function getClients() {
    if (clients === undefined) {
        const vendorScopes = CreateScopeString([
            AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE,
            AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.WRITE,
            AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.READ,
            AltinnScopes.AUTHORIZATION.AUTHORIZE,
            AltinnScopes.MASKINPORTEN.SYSTEMUSER.READ,
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
                changeRequestClient: new ChangeRequestSystemUserClient(__ENV.BASE_URL, vendorTokenGenerator),
                systemUserClient: new SystemUserClient(__ENV.BASE_URL, vendorTokenGenerator),
            },
            approver: {
                requestSystemUserClient: new RequestSystemUserClient(__ENV.BASE_URL, approverTokenGenerator),
                changeRequestClient: new ChangeRequestSystemUserClient(__ENV.BASE_URL, approverTokenGenerator),
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
 * @returns {string} Identifier of the approved system user.
 */
export function createApprovedSystemUser(registration, customer, grantedRights) {
    const [apiClients] = getClients();

    let systemUserId;

    group("Arrange - the customer has an approved system user", function () {
        SystemRegisterBuildingBlocks.CreateRegisteredSystem(apiClients.vendor.systemRegisterClient, registration.registerSystemRequest);

        const createRequest = new CreateRequestSystemUserBuilder()
            .withExternalRef(registration.externalRef)
            .withSystemId(registration.systemId)
            .withPartyOrgNo(customer.orgNo)
            .withRights(grantedRights)
            .withRedirectUrl(registration.redirectUrl)
            .build();

        const createdRequest = RequestSystemUserBuildingBlocks.CreateRequest(apiClients.vendor.requestSystemUserClient, createRequest);

        SystemUserRequestDomainChecks.CheckRequestCreated(createdRequest, {
            systemId: registration.systemId,
            partyOrgNo: customer.orgNo,
            externalRef: registration.externalRef,
        });

        if (!PrerequisiteDomainChecks.CheckPrerequisite(createdRequest, "the system user request was created")) {
            fail("missing prerequisite: the system user request was created");
        }

        const approved = RequestSystemUserBuildingBlocks.ApproveSystemUserRequest(
            apiClients.approver.requestSystemUserClient,
            customer.partyId,
            createdRequest?.id,
        );

        SystemUserRequestDomainChecks.CheckRequestApproved(approved);

        const systemUser = SystemUserBuildingBlocks.GetByExternalId(apiClients.vendor.systemUserClient, {
            clientId: registration.clientId,
            systemProviderOrgNo: registration.systemOwner,
            systemUserOwnerOrgNo: customer.orgNo,
            externalRef: registration.externalRef,
        });

        systemUserId = systemUser?.id;

        if (!PrerequisiteDomainChecks.CheckPrerequisite(systemUserId, "the customer has a system user to change")) {
            fail("missing prerequisite: the customer has a system user to change");
        }
    });

    return systemUserId;
}
