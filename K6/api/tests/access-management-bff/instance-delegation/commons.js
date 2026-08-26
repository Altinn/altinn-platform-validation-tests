
import { AccessPackageClient } from "../../../../clients/access-management-bff/access-package/index.js";
import { AltinnCdnClient } from "../../../../clients/access-management-bff/altinn-cdn/index.js";
import { InstanceRightsDelegationDto, Right } from "../../../../clients/access-management-bff/common/common.types.js";
import { ConnectionClient } from "../../../../clients/access-management-bff/connection/index.js";
import { ConsentClient } from "../../../../clients/access-management-bff/consent/index.js";
import { InstanceClient, InstanceRightsDelegationDtoBuilder } from "../../../../clients/access-management-bff/instance/index.js";
import { LookupClient } from "../../../../clients/access-management-bff/lookup/index.js";
import { ResourceClient } from "../../../../clients/access-management-bff/resource/index.js";
import { RoleClient } from "../../../../clients/access-management-bff/role/index.js";
import { SingleRightClient } from "../../../../clients/access-management-bff/single-right/index.js";
import { SystemUserClient } from "../../../../clients/access-management-bff/system-user/index.js";
import { UserClient } from "../../../../clients/access-management-bff/user/index.js";
import { GraphqlClient } from "../../../../clients/dialogporten/graphql/index.js";
import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../common-imports.js";
import { pickUnique } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";

export const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : false;

// All apiclient used in this test
/** @type {ServiceOwnerApiClient | undefined} */
let serviceOwnerApiClient = undefined;

/**
 * Builds the clients that act as the end user.
 *
 * They all share one personal token generator, so they are built together and
 * cached together rather than one variable at a time.
 *
 * @returns {{
 * user: UserClient,
 * lookup: LookupClient,
 * altinnCdn: AltinnCdnClient,
 * role: RoleClient,
 * instance: InstanceClient,
 * consent: ConsentClient,
 * systemUser: SystemUserClient,
 * resource: ResourceClient,
 * singleRight: SingleRightClient,
 * connection: ConnectionClient,
 * accessPackage: AccessPackageClient,
 * graphql: GraphqlClient,
 * tokenGenerator: PersonalTokenGenerator
 * }} The end user clients and the generator they share.
 */
function buildEndUserClients() {
    const scopes = CreateScopeString([
        AltinnScopes.PDP.AUTHORIZE.ENDUSER
    ]);
    const tokenOpts = new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(scopes)
        .build();

    const tokenGenerator = new PersonalTokenGenerator(tokenOpts);

    return {
        user: new UserClient(__ENV.AM_UI_BASE_URL, tokenGenerator),
        lookup: new LookupClient(__ENV.AM_UI_BASE_URL, tokenGenerator),
        altinnCdn: new AltinnCdnClient(__ENV.AM_UI_BASE_URL, tokenGenerator),
        role: new RoleClient(__ENV.AM_UI_BASE_URL, tokenGenerator),
        instance: new InstanceClient(__ENV.AM_UI_BASE_URL, tokenGenerator),
        consent: new ConsentClient(__ENV.AM_UI_BASE_URL, tokenGenerator),
        systemUser: new SystemUserClient(__ENV.AM_UI_BASE_URL, tokenGenerator),
        resource: new ResourceClient(__ENV.AM_UI_BASE_URL, tokenGenerator),
        singleRight: new SingleRightClient(__ENV.AM_UI_BASE_URL, tokenGenerator),
        connection: new ConnectionClient(__ENV.AM_UI_BASE_URL, tokenGenerator),
        accessPackage: new AccessPackageClient(__ENV.AM_UI_BASE_URL, tokenGenerator),
        graphql: new GraphqlClient(__ENV.BASE_URL, tokenGenerator),
        tokenGenerator,
    };
}

/** @type {ReturnType<typeof buildEndUserClients> | undefined} */
let endUserClients = undefined;

/**
 * Creates and caches the API clients used by the test.
 *
 * The service owner client uses an enterprise token scoped to the provided
 * organization number, while the remaining clients share a single personal
 * token generator.
 *
 * Existing client instances are reused on subsequent calls.
 *
 * The Access Management BFF is split into one client per endpoint group, so the
 * clients are returned in an object rather than a tuple. Destructure the ones
 * the test needs.
 *
 * @param {string} serviceOwnerOrgNo - Organization number used when generating the enterprise token.
 * @returns {{
 * serviceOwner: ServiceOwnerApiClient,
 * user: UserClient,
 * lookup: LookupClient,
 * altinnCdn: AltinnCdnClient,
 * role: RoleClient,
 * instance: InstanceClient,
 * consent: ConsentClient,
 * systemUser: SystemUserClient,
 * resource: ResourceClient,
 * singleRight: SingleRightClient,
 * connection: ConnectionClient,
 * accessPackage: AccessPackageClient,
 * graphql: GraphqlClient,
 * tokenGenerator: PersonalTokenGenerator
 * }} The initialized API clients and shared personal token generator.
 */
export function getClients(serviceOwnerOrgNo) {
    if (serviceOwnerApiClient == undefined) {
        const tokenOpts = new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes("digdir:dialogporten.serviceprovider")
            .withOrganization("ttd")
            .withOrganizationNumber(serviceOwnerOrgNo)
            .build();

        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        serviceOwnerApiClient = new ServiceOwnerApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    if (endUserClients == undefined) {
        endUserClients = buildEndUserClients();
    }

    return {
        serviceOwner: serviceOwnerApiClient,
        ...endUserClients,
    };
}

/**
 * Token options for acting as one end user.
 *
 * @param {string} userId Altinn user id.
 * @param {string} partyuuid Party UUID of that user.
 * @returns {ReturnType<PersonalTokenBuilder["build"]>} Options to hand to setTokenGeneratorOptions.
 */
export function getTokenOpts(userId, partyuuid) {
    const scopes = CreateScopeString([
        AltinnScopes.PORTAL.ENDUSER
    ]);
    const tokenOpts = new PersonalTokenBuilder()
        .withScopes(scopes)
        .withUserId(userId)
        .withPartyUuid(partyuuid);
    return tokenOpts.build();
}

/**
 * Helper function to get from and to organizations/users for the current iteration, ensuring that they are not the same
 *
 * @param {any[]} list Organizations or users available to this VU.
 * @returns object with from and to organizations
 */
export function getFromTo(list) {
    const [from, to] = pickUnique(list, 2);
    return { from, to };
}

// TODO: which one should be used here?
/**
 * Token options for reading Dialogporten as one end user.
 *
 * @param {string} ssn Person identifier of that user.
 * @returns {ReturnType<PersonalTokenBuilder["build"]>} Options to hand to setTokenGeneratorOptions.
 */
export function getDialogportenOpts(ssn) {
    const tokenOpts = new PersonalTokenBuilder()
        .withScopes("digdir:dialogporten")
        .withPid(ssn);

    return tokenOpts.build();
}

/**
 * Helper function to create the body for delegating rights for a resource and instance to another user,
 * based on the rights meta for the resource and the "to" user.
 *
 * @param {Array<Right>|null} rightsMeta The rights the resource defines, as
 * returned by GetRightsMeta. Null when that call failed, which leaves the body
 * with no rights to delegate.
 * @param {any} to The user the rights are delegated to, with ssn and lastName.
 * @returns {InstanceRightsDelegationDto} Body for delegating every right of the
 * resource to that user.
 */
export function getInstanceDelegationBody(rightsMeta, to) {
    return new InstanceRightsDelegationDtoBuilder()
        .withTo({
            personIdentifier: to.ssn,
            lastName: to.lastName,
        })
        .withDirectRightKeys(
            (rightsMeta ?? [])
                .map((right) => right.key)
                .filter((key) => key !== null),
        )
        .build();
}
