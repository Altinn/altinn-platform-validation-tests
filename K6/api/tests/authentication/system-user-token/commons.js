import { fail, group } from "k6";

import { SystemUserClient as BffSystemUserClient } from "../../../../clients/access-management-bff/system-user/index.js";
import { SystemUserRequestClient as BffSystemUserRequestClient } from "../../../../clients/access-management-bff/system-user-request/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, MaskinportenAccessTokenGenerator, MaskinportenTokenBuilder, PersonalTokenBuilder, PersonalTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { fetchTestData, getItemFromList, lazy, requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { AuthenticationClient, CreateRequestSystemUserBuilder, RequestSystemUserBuildingBlocks, RequestSystemUserClient, SystemUserBuildingBlocks, SystemUserClient, SystemUserRequestDomainChecks } from "../../../authentication-imports.js";
import { DeleteSystemUser } from "../../../building-blocks/access-management-bff/system-user/index.js";
import { ApproveSystemUserRequest } from "../../../building-blocks/access-management-bff/system-user-request/index.js";

/**
 * Whether to draw a random customer rather than walk the list.
 */
const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * The organisation that owns the Maskinporten client, and so also the system.
 *
 * The two have to be the same organisation: Maskinporten derives the system
 * provider from the client the grant is signed by, so a system registered by anyone
 * else is not one this client can be issued system user tokens for. It is the
 * client the `313175650-maskinporten-client` secret in functional.yaml is for, the
 * same one the token exchange and system register tests sign their grants with.
 *
 * @type {string}
 */
export const VENDOR_ORG_NO = "313175650";

/**
 * The system the system users are created on.
 *
 * Unlike the other authentication tests this one does not register a system of its
 * own, and cannot: a Maskinporten client can be bound to one system at a time, and
 * the token has to be signed by the client the system carries or Maskinporten finds
 * nothing to issue it for. So the system is seeded and left in place, the way
 * 312605031_Virksomhetsbruker is for the pagination tests. What the test does
 * create, and delete again, is a system user on it.
 *
 * Seeding a new one means acting as vendor 313175650: register the system with the
 * Maskinporten client id from MASKINPORTEN_CLIENT_ID as its only client id, invisible,
 * with the access package below among its access packages. It has no allowed
 * redirect urls, which is why the request built here sets none either.
 *
 * Only in tt02, since that is the Altinn environment test.maskinporten.no looks
 * system users up in. A grant signed against any other environment resolves to
 * whatever tt02 holds, so the test says nothing there.
 *
 * @type {string}
 */
export const SYSTEM_ID = `${VENDOR_ORG_NO}_ForretningsføringLeverandør`;

/**
 * The access package the system user is asked for.
 *
 * Has to be one the seeded system is registered with, or the request is rejected.
 * Which one hardly matters here: what the tests are about is the token, not what it
 * gets the caller into.
 */
const ACCESS_PACKAGE = "urn:altinn:accesspackage:jordbruk";

/**
 * The scope the grant asks for, and the one the token comes back with.
 *
 * A system user token carries scopes like any other Maskinporten token. What the
 * caller may reach comes from the `authorization_details` claim rather than from
 * these, so the scope only has to be one the client is registered for, and the tests
 * use it to check that it survives into the token and through the exchange.
 *
 * It reads oddly for a system user token, and it is not a choice: this is the only
 * scope the client has. Maskinporten answers a grant asking for anything else with
 * 400 invalid_scope, so a more neutral name would mean registering another scope on
 * the client first.
 */
export const SCOPE = AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE;

/**
 * The scopes the vendor acts with: asking for the system user, and looking up the
 * one the customer approved.
 */
const VENDOR_SCOPES = CreateScopeString([
    AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.WRITE,
    AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.READ,
    AltinnScopes.MASKINPORTEN.SYSTEMUSER.READ,
]);

/**
 * The clients this folder acts with.
 *
 * @typedef {object} SystemUserTokenClients
 * @property {{requestSystemUserClient: RequestSystemUserClient, systemUserClient: SystemUserClient}} vendor The vendor that asks for the system user and looks the approved one up.
 * @property {{bffRequestClient: BffSystemUserRequestClient, bffSystemUserClient: BffSystemUserClient}} approver The customer that approves the system user, and deletes it again.
 * @property {AuthenticationClient} authenticationClient Exchanges the system user token for an Altinn one.
 */

/**
 * @typedef {import("../commons.js").EndUser} EndUser
 */

/**
 * The system user the setup arranged, and what the tests need to reach it.
 *
 * @typedef {object} ArrangedSystemUser
 * @property {EndUser} customer The customer that holds the system user.
 * @property {string} externalRef The reference the system user was asked for with, which the Maskinporten grant names.
 * @property {string} systemUserId Identifier of the approved system user, which the token has to come back with.
 * @property {string} systemId The seeded system the system user was created on.
 * @property {string} vendorOrgNo The vendor that owns the system, which the exchanged token acts as.
 */

/**
 * k6 setup stage. Gives a customer a system user on the seeded system.
 *
 * The system user is what Maskinporten looks up while it issues the token, so it
 * has to exist before the test asks for one. Created here rather than in the
 * iteration so that a run which cannot arrange it says so before any iteration
 * starts, and so the iterations measure the token endpoint rather than the arrange.
 *
 * @returns {ArrangedSystemUser[]} The system user the token is asked for, as a single item list.
 */
export function setup() {
    // Only what the skip below needs, since requireEnv throws and a throw in setup
    // ends the whole run. The Maskinporten secrets are asked for after it, or the
    // aggregate run-all one level up would die here in the three environments that
    // do not have them rather than skipping the way the next comment promises.
    requireEnv(["ENVIRONMENT"]);

    // Nothing to arrange anywhere else: the seeded system is only in tt02, so the
    // request below would be rejected. Skipped rather than failed, so the aggregate
    // run-all one level up stays usable in the other three environments. What runs
    // where is decided by functional.yaml, which lists tt02 alone for this folder.
    if (__ENV.ENVIRONMENT !== "tt02") {
        console.warn(`setup - skipping the system user token tests: they only say something in tt02, not in ${__ENV.ENVIRONMENT}`);

        return [];
    }

    requireEnv(["BASE_URL", "AM_UI_BASE_URL", "MASKINPORTEN_CLIENT_ID"]);

    // The same customers the other system user tests act on behalf of: daglig leder
    // in an AS and innehaver in an ENK, so someone who can approve for the company
    // without anyone having delegated to them first.
    /** @type {EndUser} */
    const customer = getItemFromList(fetchTestData(`authentication/change-request-system-user/end-users-${__ENV.ENVIRONMENT}.csv`), randomize);
    const externalRef = uuidv4();

    const [apiClients, , approverTokenGenerator] = getClients();

    // Only the approver's, since the vendor is always the one organisation that owns
    // the Maskinporten client and getClients built its generator for exactly that.
    // Which customer this run acts on behalf of is what changes.
    approverTokenGenerator.setTokenGeneratorOptions(getApproverTokenOpts(customer));

    const systemUserId = group("Arrange - the customer has a system user on the seeded system", function () {
        const createRequest = new CreateRequestSystemUserBuilder()
            .withExternalRef(externalRef)
            .withSystemId(SYSTEM_ID)
            .withPartyOrgNo(customer.orgNo)
            .withAccessPackages([{ urn: ACCESS_PACKAGE }])
            .build();

        const createdRequest = RequestSystemUserBuildingBlocks.VendorCreate(apiClients.vendor.requestSystemUserClient, createRequest);

        if (!SystemUserRequestDomainChecks.CheckRequestId(createdRequest?.id)) {
            fail(`cannot ask for a system user token: no system user request could be made on ${SYSTEM_ID}`);
        }

        const approved = ApproveSystemUserRequest(apiClients.approver.bffRequestClient, Number(customer.orgPartyId), createdRequest?.id);

        if (!SystemUserRequestDomainChecks.CheckRequestApproved(approved)) {
            RequestSystemUserBuildingBlocks.VendorDelete(apiClients.vendor.requestSystemUserClient, createdRequest?.id);

            fail("cannot ask for a system user token: the customer did not approve the system user request");
        }

        const systemUser = SystemUserBuildingBlocks.GetByExternalId(apiClients.vendor.systemUserClient, {
            clientId: __ENV.MASKINPORTEN_CLIENT_ID,
            systemProviderOrgNo: VENDOR_ORG_NO,
            systemUserOwnerOrgNo: customer.orgNo,
            externalRef,
        });

        // The request was approved, so the system user exists. Left for someone to
        // look at rather than unwound, since the lookup is the same one Maskinporten
        // makes and a failure here is the thing the tests are about.
        if (!systemUser?.id) {
            fail("cannot ask for a system user token: the approved system user could not be looked up");
        }

        return systemUser?.id;
    });

    return [{ customer, externalRef, systemUserId, systemId: SYSTEM_ID, vendorOrgNo: VENDOR_ORG_NO }];
}

/**
 * k6 teardown stage. Deletes the system users the setup arranged.
 *
 * Deleting is the customer's own action, so it goes through the bff. Without this a
 * scheduled run leaves a system user on the customer every time it has run, and the
 * next run's grant has two to resolve between.
 *
 * @param {ArrangedSystemUser[]} data - What setup returned.
 */
export function teardown(data) {
    const [apiClients, , approverTokenGenerator] = getClients();

    group("Cleanup - the customer deletes the system user", function () {
        for (const arranged of data ?? []) {
            approverTokenGenerator.setTokenGeneratorOptions(getApproverTokenOpts(arranged.customer));

            DeleteSystemUser(apiClients.approver.bffSystemUserClient, Number(arranged.customer.orgPartyId), arranged.systemUserId);
        }
    });
}

/**
 * Creates and caches the clients this folder uses.
 *
 * Built once per VU and reused across its iterations. The token generators cache
 * tokens per instance, so building them per iteration refetches every token again.
 *
 * @returns {[SystemUserTokenClients, EnterpriseTokenGenerator, PersonalTokenGenerator]} The clients, and the two token generators.
 */
export const getClients = lazy(function () {
    const vendorTokenGenerator = new EnterpriseTokenGenerator(getVendorTokenOpts());

    const approverTokenGenerator = new PersonalTokenGenerator(
        new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
            .build(),
    );

    /** @type {SystemUserTokenClients} */
    const clients = {
        vendor: {
            requestSystemUserClient: new RequestSystemUserClient(__ENV.BASE_URL, vendorTokenGenerator),
            systemUserClient: new SystemUserClient(__ENV.BASE_URL, vendorTokenGenerator),
        },
        approver: {
            bffRequestClient: new BffSystemUserRequestClient(__ENV.AM_UI_BASE_URL, approverTokenGenerator),
            bffSystemUserClient: new BffSystemUserClient(__ENV.AM_UI_BASE_URL, approverTokenGenerator),
        },

        // No generator: the token this one exchanges is the system user token
        // from Maskinporten, which the test passes in rather than mints.
        authenticationClient: new AuthenticationClient(__ENV.BASE_URL),
    };

    /** @type {[SystemUserTokenClients, EnterpriseTokenGenerator, PersonalTokenGenerator]} */
    const built = [clients, vendorTokenGenerator, approverTokenGenerator];

    return built;
});

/**
 * Token options for acting as the vendor that owns the system.
 *
 * @returns Options to hand to setTokenGeneratorOptions.
 */
export function getVendorTokenOpts() {
    return new EnterpriseTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(VENDOR_SCOPES)
        .withOrganizationNumber(VENDOR_ORG_NO)
        .build();
}

/**
 * Token options for approving on behalf of a customer.
 *
 * @param {EndUser} customer - The customer this run acts on behalf of.
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
 * Asks Maskinporten for a token that acts as the arranged system user.
 *
 * The same generator the token exchange and system register tests sign their grants
 * with, only asked for a system user token instead of an ordinary enterprise one.
 * Signing goes through SubtleCrypto, which is promise based, so this is awaited.
 *
 * @param {ArrangedSystemUser} arranged - What setup returned for this iteration.
 * @returns {Promise<string>} A Maskinporten system user token.
 */
export async function fetchSystemUserToken(arranged) {
    const maskinportenTokenGenerator = getMaskinportenTokenGenerator();

    maskinportenTokenGenerator.setTokenGeneratorOptions(
        new MaskinportenTokenBuilder()
            .withScopes(CreateScopeString([SCOPE]))
            .withSystemUser(arranged.customer.orgNo, arranged.externalRef)
            .build(),
    );

    return await maskinportenTokenGenerator.ensureToken();
}

/**
 * Creates and caches the generator the system user tokens are signed with.
 *
 * Cached the way the clients are, so a VU keeps the token it fetched rather than
 * signing a new grant on every iteration. What the grant asks for is set per call,
 * since the system user it names is the one this iteration arranged.
 *
 * @returns {MaskinportenAccessTokenGenerator} The generator.
 */
const getMaskinportenTokenGenerator = lazy(function () {
    return new MaskinportenAccessTokenGenerator({});
});
