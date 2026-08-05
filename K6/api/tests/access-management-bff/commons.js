
import http from "k6/http";

import { AccessPackageClient } from "../../../clients/access-management-bff/access-package/index.js";
import { AltinnCdnClient } from "../../../clients/access-management-bff/altinn-cdn/index.js";
import { ConnectionClient } from "../../../clients/access-management-bff/connection/index.js";
import { ConsentClient } from "../../../clients/access-management-bff/consent/index.js";
import { InstanceClient, InstanceRightsDelegationDtoBuilder } from "../../../clients/access-management-bff/instance/index.js";
import { LookupClient } from "../../../clients/access-management-bff/lookup/index.js";
import { ResourceClient } from "../../../clients/access-management-bff/resource/index.js";
import { RoleClient } from "../../../clients/access-management-bff/role/index.js";
import { SingleRightClient } from "../../../clients/access-management-bff/single-right/index.js";
import { SystemUserClient } from "../../../clients/access-management-bff/system-user/index.js";
import { UserClient } from "../../../clients/access-management-bff/user/index.js";
import { GraphqlClient } from "../../../clients/dialogporten/graphql/index.js";
import { ServiceOwnerApiClient } from "../../../clients/dialogporten/serviceowner/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, PersonalTokenBuilder, PersonalTokenGenerator } from "../../../common-imports.js";
import { getNumberOfVUs, parseCsvData, pickUnique, requireEnv, segmentData } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";

export const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : false;

// All apiclient used in this test
/** @type {ServiceOwnerApiClient | undefined} */
let serviceOwnerApiClient = undefined;
/** @type {UserClient | undefined} */
let userApiClient = undefined;
/** @type {ConnectionClient | undefined} */
let bffConnectionsApiClient = undefined;
/** @type {AccessPackageClient | undefined} */
let bffAccessPackageApiClient = undefined;
/** @type {GraphqlClient | undefined} */
let graphqlClient = undefined;
/** @type {PersonalTokenGenerator | undefined} */
let personalTokenGenerator = undefined;
/** @type {LookupClient | undefined} */
let lookupApiClient = undefined;
/** @type {AltinnCdnClient | undefined} */
let altinnCdnApiClient = undefined;
/** @type {RoleClient | undefined} */
let roleApiClient = undefined;
/** @type {InstanceClient | undefined} */
let instanceApiClient = undefined;
/** @type {ConsentClient | undefined} */
let consentApiClient = undefined;
/** @type {SystemUserClient | undefined} */
let systemUserApiClient = undefined;
/** @type {ResourceClient | undefined} */
let resourceApiClient = undefined;
/** @type {SingleRightClient | undefined} */
let singleRightApiClient = undefined;

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
    if (userApiClient == undefined) {
        const scopes = CreateScopeString([
            AltinnScopes.PDP.AUTHORIZE.ENDUSER
        ]);
        const tokenOpts = new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(scopes)
            .build();

        personalTokenGenerator = new PersonalTokenGenerator(tokenOpts);
        userApiClient = new UserClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        lookupApiClient = new LookupClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        altinnCdnApiClient = new AltinnCdnClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        roleApiClient = new RoleClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        instanceApiClient = new InstanceClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        consentApiClient = new ConsentClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        systemUserApiClient = new SystemUserClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        resourceApiClient = new ResourceClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        singleRightApiClient = new SingleRightClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        bffConnectionsApiClient = new ConnectionClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        bffAccessPackageApiClient = new AccessPackageClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
        graphqlClient = new GraphqlClient(__ENV.BASE_URL, personalTokenGenerator);
    }
    return {
        serviceOwner: serviceOwnerApiClient,
        user: userApiClient,
        lookup: lookupApiClient,
        altinnCdn: altinnCdnApiClient,
        role: roleApiClient,
        instance: instanceApiClient,
        consent: consentApiClient,
        systemUser: systemUserApiClient,
        resource: resourceApiClient,
        singleRight: singleRightApiClient,
        connection: bffConnectionsApiClient,
        accessPackage: bffAccessPackageApiClient,
        graphql: graphqlClient,
        tokenGenerator: personalTokenGenerator,
    };
}

// TODO: which one should be used here?
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
 * @param {object[]} list Organizations or users available to this VU.
 * @returns object with from and to organizations
 */
export function getFromTo(list) {
    const [from, to] = pickUnique(list, 2);
    return { from, to };
}

/**
 * Setup function to segment data for VUs.
 *
 * @returns {object[][]} Organizations with a party uuid, one slice per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "AM_UI_BASE_URL", "BASE_URL"]);

    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid-v2.csv`,
        { tags: { action: "fetch-test-data" } });
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}

// TODO: which one should be used here?
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
 * @param {Array<Right>} rightsMeta The rights the resource defines, as returned
 * by GetRightsMeta.
 * @param {object} to The user the rights are delegated to, with ssn and lastName.
 * @returns {InstanceRightsDelegationDto} Body for delegating every right of the
 * resource to that user.
 */
export function getInstanceDelegationBody(rightsMeta, to) {
    return new InstanceRightsDelegationDtoBuilder()
        .withTo({
            personIdentifier: to.ssn,
            lastName: to.lastName,
        })
        .withDirectRightKeys(rightsMeta.map((right) => right.key))
        .build();
}
