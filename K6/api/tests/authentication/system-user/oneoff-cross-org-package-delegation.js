// One off exploratory test, safe to delete.
//
// Org A gets an agent system user, the kind used for client delegation, with the
// Jordbruk access package. Org B, which has nothing to do with that system user,
// then tries to delegate the access package Tilgangsstyrer straight to it through
// the enduser Connections API.
//
// The delegation attempt is deliberately not asserted to succeed. It goes through
// the client rather than the CreateAccessPackage building block, so a rejection
// is reported as an outcome instead of failing the run.

import { check, fail, group } from "k6";
import encoding from "k6/encoding";
import http from "k6/http";

import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { AuthorizedPartiesClient as EndUserAuthorizedPartiesClient } from "../../../../clients/access-management/enduser/authorized-parties/index.js";
import { AccessPackageDelegationCheckQueryBuilder, ConnectionsClient, CreateAccessPackageQueryBuilder, DeleteAccessPackageQueryBuilder, GetAccessPackagesQueryBuilder, GetConnectionsQueryBuilder } from "../../../../clients/access-management/enduser/connections/index.js";
import { PackagesClient } from "../../../../clients/access-management/metadata/packages/index.js";
import { ClientDelegationsClient, CreateAgentAccessPackagesQueryBuilder, DelegationBatchInputDtoBuilder, GetClientsQueryBuilder } from "../../../../clients/access-management-bff/client-delegations/index.js";
import { ConnectionClient, GetRightHoldersQueryBuilder } from "../../../../clients/access-management-bff/connection/index.js";
import { SystemUserAgentRequestClient as BffSystemUserAgentRequestClient } from "../../../../clients/access-management-bff/system-user-agent-request/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, PersonalTokenBuilder, PersonalTokenGenerator, uuidv4 } from "../../../../common-imports.js";
import { parseCsvData, pickUnique, requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import {
    CreateAgentRequestSystemUserBuilder,
    RegisterSystemRequestBuilder,
    RequestSystemUserBuildingBlocks,
    RequestSystemUserClient,
    SystemRegisterBuildingBlocks,
    SystemRegisterClient,
    SystemUserBuildingBlocks,
    SystemUserClient,
} from "../../../authentication-imports.js";
import { GetAuthorizedParties as GetEndUserAuthorizedParties } from "../../../building-blocks/access-management/enduser/authorized-parties/index.js";
import { GetAccessPackageDelegationCheck, GetAccessPackages, GetConnections } from "../../../building-blocks/access-management/enduser/connections/index.js";
import { PackagesGetPackageByUrn } from "../../../building-blocks/access-management/metadata/packages/index.js";
import { GetRightHolders } from "../../../building-blocks/access-management-bff/connection/index.js";
import { ApproveAgentRequest } from "../../../building-blocks/access-management-bff/system-user-agent-request/index.js";

/**
 * The vendor that owns the registered system.
 */
const SYSTEM_OWNER = "713431400";

const REDIRECT_URL = "https://digdir.no";

/**
 * The access packages the agent system user is created with.
 *
 * Jordbruk only. Tilgangsstyrer cannot be asked for on an agent request, it can
 * only be delegated directly, which is exactly the route Org B takes further
 * down. The system user therefore starts out without the package it is later
 * handed by a party it has nothing to do with.
 */
const SYSTEM_USER_PACKAGES = [
    "urn:altinn:accesspackage:jordbruk",
];

/**
 * The access package Org B tries to delegate to Org A's system user.
 */
const DELEGATED_PACKAGE = "urn:altinn:accesspackage:tilgangsstyrer";

/**
 * Where the token generator hands out system user tokens.
 * See https://github.com/Altinn/AltinnTestTools.
 */
const SYSTEM_USER_TOKEN_URL = "https://altinn-testtools-token-generator.azurewebsites.net/api/GetSystemUserToken";

/**
 * The building blocks pass headers straight through, so the paging headers the
 * client defaults to are lost unless they are given explicitly.
 */
const PAGE_HEADERS = {
    "X-Page-Size": 100,
    "X-Page-Number": 0,
};

/**
 * Reads the claims out of an access token, for logging only.
 *
 * @param {string} token The access token to inspect.
 * @returns {object} The decoded payload, or an object describing why it could
 * not be decoded.
 */
function decodeJwtPayload(token) {
    try {
        const payloadSegment = token.split(".")[1];

        const base64 = payloadSegment
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(4 * Math.ceil(payloadSegment.length / 4), "=");

        return JSON.parse(encoding.b64decode(base64, "std", "s"));
    } catch (err) {
        return { unableToDecode: err.message };
    }
}

// One shot, this is not a load test.
export const options = {
    vus: 1,
    iterations: 1,
};

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AM_UI_BASE_URL"]);

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/data-${__ENV.ENVIRONMENT}-all-customers.csv`,
        { tags: { action: "fetch-test-data" } },
    );

    return parseCsvData(res.body);
}

export default function (customers) {
    const [orgA, orgB] = pickUnique(customers, 2);

    // Logged up front so the run can be traced back to the parties it drew, and
    // so the approving user can be looked up afterwards.
    console.log(`org A ${orgA.orgNo} (partyId ${orgA.partyId}) approving as userId ${orgA.userId}, org B ${orgB.orgNo} (orgUuid ${orgB.orgUuid}) delegating as userId ${orgB.userId}`);

    const vendorTokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(CreateScopeString([
                AltinnScopes.AUTHENTICATION.SYSTEMREGISTER.WRITE,
                AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.WRITE,
                AltinnScopes.AUTHENTICATION.SYSTEMUSER.REQUEST.READ,
                AltinnScopes.MASKINPORTEN.SYSTEMUSER.READ,
            ]))
            .withOrganizationNumber(SYSTEM_OWNER)
            .build(),
    );

    // Org A approves the request in the portal, so it goes through the bff.
    const orgATokenGenerator = new PersonalTokenGenerator(
        new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(CreateScopeString([AltinnScopes.PORTAL.ENDUSER]))
            .withUserId(orgA.userId)
            .withPartyUuid(orgA.userPartyUuid)
            .build(),
    );

    const orgBTokenGenerator = new PersonalTokenGenerator(
        new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(CreateScopeString([
                AltinnScopes.PORTAL.ENDUSER,
                AltinnScopes.PDP.AUTHORIZE.ENDUSER,
            ]))
            .withUserId(orgB.userId)
            .withPartyUuid(orgB.userPartyUuid)
            .build(),
    );

    const systemRegisterClient = new SystemRegisterClient(__ENV.BASE_URL, vendorTokenGenerator);
    const requestSystemUserClient = new RequestSystemUserClient(__ENV.BASE_URL, vendorTokenGenerator);
    const systemUserClient = new SystemUserClient(__ENV.BASE_URL, vendorTokenGenerator);
    const bffAgentRequestClient = new BffSystemUserAgentRequestClient(__ENV.AM_UI_BASE_URL, orgATokenGenerator);
    const packagesClient = new PackagesClient(__ENV.BASE_URL, orgBTokenGenerator);
    const connectionsClient = new ConnectionsClient(__ENV.BASE_URL, orgBTokenGenerator);

    const systemName = `oneoff${uuidv4()}`;
    const systemId = `${SYSTEM_OWNER}_${systemName}`;
    const clientId = uuidv4();
    const externalRef = uuidv4();

    let systemUser;

    group("Org A gets an agent system user with the Jordbruk access package", function () {
        const registerSystemRequest = new RegisterSystemRequestBuilder()
            .withId(systemId)
            .withVendor(`0192:${SYSTEM_OWNER}`)
            .withName({ en: systemName, nb: systemName, nn: systemName })
            .withDescription({
                en: "One off test of cross org access package delegation to a system user.",
                nb: "Engangstest av tilgangspakkedelegering fra en annen virksomhet til en systembruker.",
                nn: "Engangstest av tilgangspakkedelegering frå ei anna verksemd til ein systembrukar.",
            })
            .withRights([])
            .withAccessPackages(SYSTEM_USER_PACKAGES)
            .withClientId([clientId])
            .withVisibility(false)
            .withAllowedRedirectUrls([REDIRECT_URL])
            .build();

        if (SystemRegisterBuildingBlocks.VendorCreate(systemRegisterClient, registerSystemRequest) === null) {
            fail("registering the system did not return a system id");
        }

        // The system register takes bare urns and wraps them itself, the agent
        // request takes them already wrapped.
        const createRequest = new CreateAgentRequestSystemUserBuilder()
            .withExternalRef(externalRef)
            .withSystemId(systemId)
            .withPartyOrgNo(orgA.orgNo)
            .withAccessPackages(SYSTEM_USER_PACKAGES.map((urn) => ({ urn })))
            .withRedirectUrl(REDIRECT_URL)
            .build();

        const createdRequest = RequestSystemUserBuildingBlocks.VendorAgentCreate(requestSystemUserClient, createRequest);

        if (!createdRequest?.id) {
            fail("creating the agent system user request returned no id");
        }

        // Approved through the api rather than the confirmUrl the response
        // carries, which is where the browser test drives the portal instead.
        ApproveAgentRequest(bffAgentRequestClient, orgA.partyId, createdRequest.id);

        systemUser = SystemUserBuildingBlocks.GetByExternalId(systemUserClient, {
            clientId: clientId,
            systemProviderOrgNo: SYSTEM_OWNER,
            systemUserOwnerOrgNo: orgA.orgNo,
            externalRef: externalRef,
        });

        if (!systemUser?.id) {
            fail("the lookup by external ref returned no system user");
        }

        console.log(`agent system user: id=${systemUser.id} partyUuId=${systemUser.partyUuId} owner=${orgA.orgNo}`);
        console.log(`agent system user, full record: ${JSON.stringify(systemUser)}`);
    });

    // Commented out to see what the delegation answers with no connection in
    // place at all. Put it back to tell "an unrelated org cannot delegate to a
    // system user" apart from "nobody can delegate to a system user", and put
    // CreateConnectionQueryBuilder back in the connections import while you are
    // at it, since the linter drops imports that only the comment uses.
    /*
    group("Org B connects to Org A before delegating anything", function () {
        // The delegation below may be refused simply because the two parties are
        // strangers to each other. Creating the connection first separates "the
        // api will not let an unrelated org delegate to a system user" from "the
        // api will not let anyone delegate to a system user at all".
        //
        // Both directions of target are tried, since it is not obvious which one
        // the api considers the counterparty: the organisation that owns the
        // system user, or the system user itself. Neither is asserted, the
        // outcome is the point.
        const connectionTargets = [
            {
                label: `org A ${orgA.orgNo} as an organisation`,
                to: orgA.orgUuid,
            },
            {
                label: `org A's system user ${systemUser.id}`,
                to: systemUser.id,
            },
        ];

        for (const { label, to } of connectionTargets) {
            const res = connectionsClient.CreateConnection(
                new CreateConnectionQueryBuilder()
                    .withParty(orgB.orgUuid)
                    .withTo(to)
                    .build(),
                null,
                { step: `org b adds ${label} as a connection` },
            );

            console.log(`POST connections, org B ${orgB.orgNo} adds ${label}: ${res.status} ${res.status_text}`);
            console.log(res.body);
        }

        // What org B actually ended up with, whatever the two attempts answered.
        const connections = GetConnections(
            connectionsClient,
            new GetConnectionsQueryBuilder()
                .withParty(orgB.orgUuid)
                .withFrom(orgB.orgUuid)
                .build(),
            PAGE_HEADERS,
            { step: "connections org b has after connecting" },
        );

        console.log(`connections from org B ${orgB.orgNo} after the attempts: ${JSON.stringify(connections?.data ?? connections)}`);
    });
    */

    group("Org A adds Org B as a client on the agent system user", function () {
        // The other route to the same place. Instead of Org B pushing a package
        // to the system user, Org A pulls Org B in as a client of its own agent,
        // which is the flow the portal drives when a customer is added under an
        // access package. Org A is the one acting, so it goes through Org A's
        // token, and Org B is the client the packages are delegated on.
        //
        // Whether it should work at all is the question: the two orgs have no
        // client provider relationship, so a refusal here is as interesting as a
        // success. Raw client call, no assert, status and body logged.
        const clientDelegationsClient = new ClientDelegationsClient(__ENV.AM_UI_BASE_URL, orgATokenGenerator);

        const res = clientDelegationsClient.CreateAgentAccessPackages(
            new CreateAgentAccessPackagesQueryBuilder()
                .withParty(orgA.orgUuid)
                .withFrom(orgB.orgUuid)
                .withTo(systemUser.id)
                .build(),
            new DelegationBatchInputDtoBuilder()
                .addPermission("rettighetshaver", SYSTEM_USER_PACKAGES)
                .build(),
            { step: "org a adds org b as a client on the system user" },
        );

        console.log(`POST agents/accesspackages, org A ${orgA.orgNo} adds org B ${orgB.orgNo} as a client on system user ${systemUser.id}: ${res.status} ${res.status_text}`);
        console.log(res.body);

        // What the system user ended up with as an agent, whatever the call
        // above answered.
        const clients = clientDelegationsClient.GetClients(
            new GetClientsQueryBuilder()
                .withParty(orgA.orgUuid)
                .build(),
            { step: "clients org a has after adding org b" },
        );

        console.log(`clients for org A ${orgA.orgNo} after the attempt: ${clients.status} ${clients.status_text}`);
        console.log(clients.body);
    });

    group("Org B tries to delegate Tilgangsstyrer to Org A's system user", function () {
        const packageDto = PackagesGetPackageByUrn(packagesClient, DELEGATED_PACKAGE);

        if (!packageDto?.id) {
            fail(`could not resolve the package id for ${DELEGATED_PACKAGE}`);
        }

        // Says whether Org B's user can hand out this package at all, and through
        // which role, so a rejection below can be told apart from a rejection that
        // is about the system user being an unrelated party.
        const delegationCheck = GetAccessPackageDelegationCheck(
            connectionsClient,
            new AccessPackageDelegationCheckQueryBuilder()
                .withParty(orgB.orgUuid)
                .withPackageIds([packageDto.id])
                .build(),
            { step: "can org b delegate tilgangsstyrer at all" },
        );

        console.log(`delegation check as ${orgB.orgNo}: ${delegationCheck?.data?.map((entry) => entry.result).join(", ")}`);

        const res = connectionsClient.CreateAccessPackage(
            new CreateAccessPackageQueryBuilder()
                .withParty(orgB.orgUuid)
                .withTo(systemUser.id)
                .withPackageId(packageDto.id)
                .build(),
            null,
            { step: "org b delegates tilgangsstyrer to org a system user" },
        );

        console.log(`delegation of ${DELEGATED_PACKAGE} from ${orgB.orgNo} to system user ${systemUser.id}: ${res.status} ${res.status_text}`);

        // Printed on success as well as failure: on success it is the assignment
        // that was created, on failure the reason it was not.
        console.log(res.body);

        // One check rather than a pair, so the summary has no red line for the
        // outcome the test exists to observe. Green means the api let an unrelated
        // org delegate to the system user, red means it refused. Either way the
        // status and body are in the log above.
        check(res, {
            [`POST accesspackages: org B could delegate ${DELEGATED_PACKAGE} to org A's system user`]: (r) => r.status < 400,
        });
    });

    group("Read back what the delegation actually created", function () {
        // The portal lists the packages the system user was granted by its own
        // owner, which is a different list from the connection assignments this
        // test creates. Reading it back through the api says whether the
        // assignment exists at all, and between which two parties.
        const packagesFromOrgB = GetAccessPackages(
            connectionsClient,
            new GetAccessPackagesQueryBuilder()
                .withParty(orgB.orgUuid)
                .withFrom(orgB.orgUuid)
                .withTo(systemUser.id)
                .build(),
            PAGE_HEADERS,
            { step: "packages org b has given the system user" },
        );

        const connectionsFromOrgB = GetConnections(
            connectionsClient,
            new GetConnectionsQueryBuilder()
                .withParty(orgB.orgUuid)
                .withFrom(orgB.orgUuid)
                .withTo(systemUser.id)
                .build(),
            PAGE_HEADERS,
            { step: "connection between org b and the system user" },
        );

        console.log(`from ${orgB.orgNo} to system user ${systemUser.id}: ${packagesFromOrgB?.data?.length ?? 0} access packages, ${connectionsFromOrgB?.data?.length ?? 0} connections`);
    });

    group("Authorized parties says whether the system user actually has the package", function () {
        // Asked with the system user's own token against the enduser endpoint,
        // which is what the system user itself sees when it calls Altinn.
        //
        // System user tokens come from their own endpoint in the token generator,
        // which none of the exported generators point at. Reusing the enterprise
        // generator and repointing it keeps the basic auth and the per option
        // token cache; only the url and the parameter names differ.
        const systemUserTokenGenerator = new EnterpriseTokenGenerator({
            env: __ENV.ENVIRONMENT,
            ttl: 3600,
            scopes: CreateScopeString([
                AltinnScopes.ACCESSMANAGEMENT.AUTHORIZEDPARTIES.DEFAULT,
                AltinnScopes.PORTAL.ENDUSER,
            ]),
            systemUserId: systemUser.id,
            systemUserOrg: orgA.orgNo,
            orgNo: SYSTEM_OWNER,
            clientId: clientId,
        });

        systemUserTokenGenerator.endpoint = SYSTEM_USER_TOKEN_URL;

        // The enduser endpoints take no party parameter, so whoever the token
        // says it is decides what comes back. Logged before the first call, so a
        // response that looks like the organisation rather than the system user
        // can be pinned on the token instead of on the api.
        console.log(`system user token claims: ${JSON.stringify(decodeJwtPayload(systemUserTokenGenerator.getToken()))}`);

        // Read straight off the clients rather than the building blocks, so the
        // whole body is logged whatever the status is. A 403 here is an answer
        // in its own right: it says the system user cannot see the delegation
        // rather than that the delegation is missing.
        const systemUserConnectionsClient = new ConnectionsClient(__ENV.BASE_URL, systemUserTokenGenerator);

        const packageQueries = [
            {
                label: "every access package the system user has been given, from anyone",
                query: new GetAccessPackagesQueryBuilder()
                    .withParty(systemUser.id)
                    .withTo(systemUser.id)
                    .build(),
            },
            {
                label: `access packages given to the system user by org B ${orgB.orgNo}`,
                query: new GetAccessPackagesQueryBuilder()
                    .withParty(systemUser.id)
                    .withFrom(orgB.orgUuid)
                    .withTo(systemUser.id)
                    .build(),
            },
        ];

        for (const { label, query } of packageQueries) {
            const packagesRes = systemUserConnectionsClient.GetAccessPackages(
                query,
                PAGE_HEADERS,
                { step: "access packages as the system user" },
            );

            console.log(`GET accesspackages as system user, ${label}: ${packagesRes.status} ${packagesRes.status_text}`);
            console.log(packagesRes.body);
        }

        const authorizedPartiesClient = new EndUserAuthorizedPartiesClient(__ENV.BASE_URL, systemUserTokenGenerator);

        const authorizedParties = GetEndUserAuthorizedParties(
            authorizedPartiesClient,
            new EndUserAuthorizedPartiesQueryBuilder()
                .includeAccessPackages(true)
                .build(),
            { step: "authorized parties as the system user" },
        );

        console.log(`authorized parties as system user ${systemUser.id}, full response: ${JSON.stringify(authorizedParties)}`);

        const parties = authorizedParties?.data ?? authorizedParties ?? [];

        // One line per party, so the access packages of every party the system
        // user can act for are readable without digging through the blob above.
        for (const party of parties) {
            console.log(`authorized party ${party.name} (orgNo ${party.organizationNumber}, uuid ${party.partyUuid}): ${JSON.stringify(party.authorizedAccessPackages ?? [])}`);
        }
        const orgBParty = parties.find((party) => party.organizationNumber === orgB.orgNo);

        console.log(`authorized parties for system user ${systemUser.id}: ${parties.map((party) => `${party.name} (${party.organizationNumber})`).join(", ")}`);
        console.log(`the org that delegated ${DELEGATED_PACKAGE} was org B ${orgBParty?.name ?? "(not in the list)"} (orgNo ${orgB.orgNo}, orgUuid ${orgB.orgUuid}), acting as userId ${orgB.userId}`);
        console.log(`org B as an authorized party: ${JSON.stringify(orgBParty)}`);

        const authorizedPackages = orgBParty?.authorizedAccessPackages ?? [];

        // Both packages are checked, because they arrive by different routes and
        // only together do they say what happened. Jordbruk is the one the system
        // user was created with, and it can only show up for Org B once Org B is
        // a client of the agent, since an agent system user holds nothing until a
        // client is delegated to it. Tilgangsstyrer never went through that route
        // at all, it was pushed straight at the system user by Org B.
        check(authorizedPackages, {
            [`system user has ${DELEGATED_PACKAGE} for org B`]: (packages) =>
                packages.some((urn) => urn.toLowerCase().includes("tilgangsstyrer")),
            [`system user has ${SYSTEM_USER_PACKAGES[0]} for org B`]: (packages) =>
                packages.some((urn) => urn.toLowerCase().includes("jordbruk")),
        });
    });

    group("Authorized parties seen from Org B's own side", function () {
        // The same endpoint asked the other way round. The group above asks what
        // the system user can reach, this one asks what Org B sees now that it
        // has handed a package to a system user belonging to somebody else.
        //
        // The enterprise token is tried first, since asking as the organisation
        // itself is the natural reading of the question. It goes through the raw
        // client so a rejection is logged rather than turned into a red line: the
        // endpoint is the enduser one, and every other caller in this repo comes
        // to it with a personal token.
        const orgBEnterpriseTokenGenerator = new EnterpriseTokenGenerator(
            new EnterpriseTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(CreateScopeString([AltinnScopes.ACCESSMANAGEMENT.AUTHORIZEDPARTIES.DEFAULT]))
                .withOrganizationNumber(orgB.orgNo)
                .build(),
        );

        const enterpriseRes = new EndUserAuthorizedPartiesClient(__ENV.BASE_URL, orgBEnterpriseTokenGenerator)
            .GetAuthorizedParties(
                new EndUserAuthorizedPartiesQueryBuilder()
                    .includeAccessPackages(true)
                    .build(),
                { step: "authorized parties as org b, enterprise token" },
            );

        console.log(`authorized parties as org B ${orgB.orgNo} with an enterprise token: ${enterpriseRes.status} ${enterpriseRes.status_text}`);
        console.log(enterpriseRes.body);

        // Then as a person who can act for Org B, which is how the rest of the
        // repo calls this endpoint. Same question, a subject the endpoint
        // accepts.
        const orgBUserTokenGenerator = new PersonalTokenGenerator(
            new PersonalTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(CreateScopeString([AltinnScopes.ACCESSMANAGEMENT.AUTHORIZEDPARTIES.DEFAULT]))
                .withUserId(orgB.userId)
                .withPartyUuid(orgB.userPartyUuid)
                .withPid(orgB.ssn)
                .build(),
        );

        console.log(`org B user token claims: ${JSON.stringify(decodeJwtPayload(orgBUserTokenGenerator.getToken()))}`);

        const orgBAuthorizedPartiesClient = new EndUserAuthorizedPartiesClient(__ENV.BASE_URL, orgBUserTokenGenerator);

        const authorizedParties = GetEndUserAuthorizedParties(
            orgBAuthorizedPartiesClient,
            new EndUserAuthorizedPartiesQueryBuilder()
                .includeAccessPackages(true)
                .build(),
            { step: "authorized parties as a user of org b" },
        );

        console.log(`authorized parties as org B ${orgB.orgNo}, full response: ${JSON.stringify(authorizedParties)}`);

        const parties = authorizedParties?.data ?? authorizedParties ?? [];

        for (const party of parties) {
            console.log(`org B sees party ${party.name} (orgNo ${party.organizationNumber}, uuid ${party.partyUuid}, type ${party.type ?? party.partyTypeName}): ${JSON.stringify(party.authorizedAccessPackages ?? [])}`);
        }

        // The system user is not an organisation, so it is matched on its own
        // identifiers rather than on an org number. Both are logged in the first
        // group, since it is not given which one the party list carries.
        const systemUserParty = parties.find((party) =>
            party.partyUuid === systemUser.id ||
            party.partyUuid === systemUser.partyUuId,
        );

        console.log(`the system user as a party in org B's list: ${JSON.stringify(systemUserParty) ?? "(not in the list)"}`);

        check(parties, {
            "org B sees the system user it delegated to in its own authorized parties": () =>
                systemUserParty !== undefined,
        });
    });

    group("What Org B can see in the portal", function () {
        // Authorized parties answers "who can I act for", which is the wrong
        // question for a delegation Org B gave away. The right holder view is
        // what the portal renders, so this is the flate where Org B would have
        // to see the delegation to be able to revoke it again.
        const orgBConnectionClient = new ConnectionClient(__ENV.AM_UI_BASE_URL, orgBTokenGenerator);

        const rightHolders = GetRightHolders(
            orgBConnectionClient,
            new GetRightHoldersQueryBuilder()
                .withParty(orgB.orgUuid)
                .withFrom(orgB.orgUuid)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(true)
                .build(),
            { step: "right holders org b has given access to" },
        );

        console.log(`right holders for org B ${orgB.orgNo}, full response: ${JSON.stringify(rightHolders)}`);

        // Narrowed to the system user, so a hit in the broad list can be told
        // apart from the api simply not filtering on it.
        const rightHoldersToSystemUser = GetRightHolders(
            orgBConnectionClient,
            new GetRightHoldersQueryBuilder()
                .withParty(orgB.orgUuid)
                .withFrom(orgB.orgUuid)
                .withTo(systemUser.id)
                .withIncludeClientDelegations(true)
                .withIncludeAgentConnections(true)
                .build(),
            { step: "right holders org b has given access to, narrowed to the system user" },
        );

        console.log(`right holders for org B ${orgB.orgNo} narrowed to system user ${systemUser.id}: ${JSON.stringify(rightHoldersToSystemUser)}`);

        // Matched on the raw response rather than on a field, since the shape of
        // this view is not published and the system user may sit anywhere in it.
        const mentionsSystemUser = (view) =>
            JSON.stringify(view ?? "").includes(systemUser.id);

        check(null, {
            "org B sees the system user among its right holders": () =>
                mentionsSystemUser(rightHolders),
            "org B sees the system user when asking for it directly": () =>
                mentionsSystemUser(rightHoldersToSystemUser),
        });
    });

    group("The system user acts as Tilgangsstyrer on behalf of Org B", function () {
        // The point of the whole test. Everything above shows the package was
        // handed over and is visible. This asks the only question that matters:
        // can the system user actually use it, and administer Org B's access as
        // if it were Org B itself.
        //
        // The scope is the whole game here. An earlier version asked the token
        // generator for portal/enduser, but that is a scope Maskinporten never
        // puts in a system user token: the AltinnTestTools generator is a stand
        // in that will mint whatever is asked for, so a token like that proves
        // nothing about what a real system user can do. A real system user
        // presents the scopes its system was registered with, and this system was
        // registered with none beyond what it needs to exist. So the token is
        // minted the way the generator issues it for this system, with no scope
        // override, and its claims are logged so the actual scopes are on record.
        const systemUserTokenGenerator = new EnterpriseTokenGenerator({
            env: __ENV.ENVIRONMENT,
            ttl: 3600,
            systemUserId: systemUser.id,
            systemUserOrg: orgA.orgNo,
            orgNo: SYSTEM_OWNER,
            clientId: clientId,
        });

        systemUserTokenGenerator.endpoint = SYSTEM_USER_TOKEN_URL;

        console.log(`realistic system user token claims: ${JSON.stringify(decodeJwtPayload(systemUserTokenGenerator.getToken()))}`);

        const asSystemUser = new ConnectionsClient(__ENV.BASE_URL, systemUserTokenGenerator);

        // Jordbruk, the package the system user was legitimately created with, is
        // what gets delegated onward. Org A, the system user's own owner, is the
        // third party it gets delegated to, so no extra customer is needed.
        const packageDto = PackagesGetPackageByUrn(packagesClient, SYSTEM_USER_PACKAGES[0]);

        if (!packageDto?.id) {
            fail(`could not resolve the package id for ${SYSTEM_USER_PACKAGES[0]}`);
        }

        // First the check the portal runs before offering the action: is the
        // acting subject, the system user, allowed to delegate on behalf of Org B.
        const delegationCheck = GetAccessPackageDelegationCheck(
            asSystemUser,
            new AccessPackageDelegationCheckQueryBuilder()
                .withParty(orgB.orgUuid)
                .withPackageIds([packageDto.id])
                .build(),
            { step: "can the system user delegate on behalf of org b" },
        );

        console.log(`delegation check as the system user for org B ${orgB.orgNo}: ${JSON.stringify(delegationCheck?.data ?? delegationCheck)}`);

        // Then the action itself. Party is Org B, so the system user is acting as
        // Org B, and the package is delegated onward to Org A.
        const delegateRes = asSystemUser.CreateAccessPackage(
            new CreateAccessPackageQueryBuilder()
                .withParty(orgB.orgUuid)
                .withTo(orgA.orgUuid)
                .withPackageId(packageDto.id)
                .build(),
            null,
            { step: "system user delegates org b's package onward to org a" },
        );

        console.log(`system user, acting as org B ${orgB.orgNo}, delegates ${SYSTEM_USER_PACKAGES[0]} onward to org A ${orgA.orgNo}: ${delegateRes.status} ${delegateRes.status_text}`);
        console.log(delegateRes.body);

        const couldAdminister = delegateRes.status < 400;

        // Cleanup, so a green run does not leave Org A holding a package from Org
        // B behind it. Only attempted when the delegation went through.
        if (couldAdminister) {
            const undoRes = asSystemUser.DeleteAccessPackage(
                new DeleteAccessPackageQueryBuilder()
                    .withParty(orgB.orgUuid)
                    .withFrom(orgB.orgUuid)
                    .withTo(orgA.orgUuid)
                    .withPackageId(packageDto.id)
                    .build(),
                { step: "system user revokes the package it just delegated" },
            );

            console.log(`cleanup, system user revokes the onward delegation: ${undoRes.status} ${undoRes.status_text}`);
            console.log(undoRes.body);
        }

        // The one that matters, and the semantics are flipped from the delegation
        // group above: there a rejection was the interesting outcome, here a
        // rejection is the safe one. Green means a realistic system user token was
        // denied, which is what should happen. A red line here is the alarm: an
        // agent system user in Org A, holding only the scopes Maskinporten really
        // issues, could turn around and administer Org B's access as Org B.
        check(couldAdminister, {
            "a realistic system user token is denied administering org B's access": (ok) => !ok,
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
