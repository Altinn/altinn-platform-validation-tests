import encoding from "k6/encoding";
import http from "k6/http";

import {
    AccessListClient,
    AccessListMembershipsClient,
    ResourceV2Client,
} from "../../../clients/resource-registry/index.js";
import {
    EnterpriseTokenBuilder,
    EnterpriseTokenGenerator,
    PlatformTokenBuilder,
    PlatformTokenGenerator,
    uuidv4,
} from "../../../common-imports.js";
import { fetchTestData, getTestConfiguration, lazy, requireEnv } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";

/**
 * Identities the resource-registry functional tests run as, per environment.
 *
 * `owner` is the org code that owns the access lists the tests create, and the
 * org the enterprise token is issued for, since the registry only lets a token
 * touch the lists of its own org. `ownerOrgNo` goes into the same token.
 *
 * `resourceId` is the resource the tests connect their lists to. It has to be
 * owned by `owner`, exist in every environment and have access lists disabled,
 * so a connection made by a test grants nobody anything while the test runs.
 * k6-instancedelegation-test is a ttd resource that meets all three, and its
 * policy carries six actions the v2 policy rights test can read back.
 *
 * @typedef {"owner"|"ownerOrgNo"|"resourceId"} ConfigurationKey
 * @type {{[environment: string]: Record<ConfigurationKey, string>}}
 */
const TEST_CONFIGURATION = {
    at22: {
        owner: "ttd",
        ownerOrgNo: "991825827",
        resourceId: "k6-instancedelegation-test",
    },
    at23: {
        owner: "ttd",
        ownerOrgNo: "991825827",
        resourceId: "k6-instancedelegation-test",
    },
    tt02: {
        owner: "ttd",
        ownerOrgNo: "991825827",
        resourceId: "k6-instancedelegation-test",
    },
};

/**
 * The env var that overrides each configuration key for an ad-hoc run.
 *
 * @type {Record<ConfigurationKey, string>}
 */
const CONFIGURATION_ENV_VARS = {
    owner: "RESOURCE_REGISTRY_OWNER",
    ownerOrgNo: "RESOURCE_REGISTRY_OWNER_ORG_NO",
    resourceId: "RESOURCE_REGISTRY_RESOURCE_ID",
};

/**
 * Every access list a test creates starts with this, so teardown can tell the
 * lists the tests made from the ones people made by hand and delete only ours.
 */
export const IDENTIFIER_PREFIX = "k6-";

/**
 * Env vars every test in the family needs before it can build a client.
 *
 * @returns {{[key: string]: string}} The env vars, for a setup that wants them.
 */
export function requireFamilyEnv() {
    return requireEnv([
        "BASE_URL",
        "ENVIRONMENT",
        "TOKEN_GENERATOR_USERNAME",
        "TOKEN_GENERATOR_PASSWORD",
    ]);
}

/**
 * The configuration for the environment the run is against. Resolved once per
 * VU, and throws naming the missing key when the environment is not listed
 * and the env var is not set.
 */
export const getConfiguration = lazy(function () {
    return getTestConfiguration("resource-registry", TEST_CONFIGURATION, CONFIGURATION_ENV_VARS);
});

/**
 * Client for the access lists, their members and their resource connections.
 *
 * Enterprise token for the owner org with both access list scopes. The
 * registry checks the token's org against the owner in the path, so this
 * client can only read and write the lists of `owner`.
 *
 * @returns {AccessListClient} The client.
 */
export const getAccessListClient = lazy(function () {
    const { owner, ownerOrgNo } = getConfiguration();

    const tokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withOrganization(owner)
            .withOrganizationNumber(ownerOrgNo)
            .withScopes(CreateScopeString([
                AltinnScopes.RESOURCEREGISTRY.ACCESSLIST.READ,
                AltinnScopes.RESOURCEREGISTRY.ACCESSLIST.WRITE,
            ]))
            .build(),
    );

    return new AccessListClient(__ENV.BASE_URL, tokenGenerator);
});

/**
 * Token generator for the two lookups reserved for platform components,
 * memberships and get-by-member.
 *
 * Platform access token issued for the `platform` org. The registry requires
 * that issuer for both endpoints and rejects a bearer token, whatever scopes
 * it carries, so neither lookup can share a token with getAccessListClient.
 *
 * @returns {PlatformTokenGenerator} The generator.
 */
const getPlatformTokenGenerator = lazy(function () {
    return new PlatformTokenGenerator(
        new PlatformTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withOrganization("platform")
            .withTtl(3600)
            .build(),
    );
});

/**
 * Client for the memberships query.
 *
 * @returns {AccessListMembershipsClient} The client.
 */
export const getAccessListMembershipsClient = lazy(function () {
    return new AccessListMembershipsClient(__ENV.BASE_URL, getPlatformTokenGenerator());
});

/**
 * Access list client for the get-by-member lookup only.
 *
 * get-by-member sits in AccessListClient, since the swagger has it under the
 * Access List tag, but takes the platform access token rather than the
 * enterprise token the rest of that client's methods take. Hence a second
 * instance of the same client, built on the platform token generator, the way
 * the register tests keep one RegisterClient per token flavour.
 *
 * @returns {AccessListClient} The client.
 */
export const getAccessListPlatformClient = lazy(function () {
    return new AccessListClient(__ENV.BASE_URL, getPlatformTokenGenerator());
});

/**
 * Client for the v2 resource endpoints. Policy rights are public, so no token.
 *
 * @returns {ResourceV2Client} The client.
 */
export const getResourceV2Client = lazy(function () {
    return new ResourceV2Client(__ENV.BASE_URL);
});

/**
 * A synthetic organization from Tenor, enriched with its Altinn party from
 * Register in the environment the file is for.
 *
 * @typedef {object} Organization
 * @property {string} orgNo Organization number.
 * @property {string} partyId Altinn party id.
 * @property {string} partyUuid Altinn party uuid.
 * @property {"AS"|"ENK"} orgForm Organization form.
 */

/**
 * Organizations to add as members, one file per environment.
 *
 * K6/testdata/resource-registry/organizations-<env>.csv
 * (header: orgNo,partyId,partyUuid,orgForm), regenerated with the Tenor CLI as
 * the README in that folder describes. Read from main over HTTP, like every
 * other test data file, so a branch-only edit changes nothing until merged.
 * TESTDATA_BRANCH reads from another branch instead, for running a test
 * locally against data that is still in review.
 *
 * @param {"AS"|"ENK"} [orgForm] Keep only organizations of this form.
 * @returns {Array<Organization>} The organizations. Fails the test when the file is
 * missing or empty, or holds none of the requested form.
 */
export function loadOrganizations(orgForm) {
    /** @type {Array<Organization>} */
    const rows = fetchTestData(
        `resource-registry/organizations-${__ENV.ENVIRONMENT}.csv`,
        true,
        __ENV.TESTDATA_BRANCH || "main",
    );
    const organizations = orgForm ? rows.filter((row) => row.orgForm === orgForm) : rows;

    if (organizations.length === 0) {
        throw new Error(`No ${orgForm ?? ""} organizations in resource-registry/organizations-${__ENV.ENVIRONMENT}.csv`);
    }

    return organizations;
}

/**
 * A fresh access list identifier, prefixed so teardown can find it.
 *
 * @returns {string} The identifier.
 */
export function newIdentifier() {
    return `${IDENTIFIER_PREFIX}${uuidv4()}`;
}

/**
 * Deletes every access list of the owner that a test created, for teardown.
 *
 * Pages through the owner's lists and deletes the ones carrying
 * IDENTIFIER_PREFIX, so a run that failed halfway leaves nothing behind and
 * the lists people made by hand in the environment are left alone. Deleting a
 * list takes its members and resource connections with it.
 *
 * @returns {number} How many lists were deleted.
 */
export function deleteTestLists() {
    const client = getAccessListClient();
    const { owner } = getConfiguration();
    const maxPages = 20;
    let deleted = 0;
    /** @type {string|undefined} */
    let token = undefined;

    for (let page = 0; page < maxPages; page++) {
        const res = client.AccessListGetByOwner(owner, token ? { token } : null);

        if (res.status !== 200) {
            console.error(`deleteTestLists - listing the lists of ${owner} answered ${res.status}: ${res.body}`);
            break;
        }

        /** @type {import("../../../clients/resource-registry/types.js").AccessListInfoDtoPaginated} */
        const listing = JSON.parse(String(res.body));

        for (const list of listing.data.filter((item) => item.identifier.startsWith(IDENTIFIER_PREFIX))) {
            const deletion = client.AccessListDelete(owner, list.identifier);

            if (deletion.status === 200) {
                deleted++;
            } else {
                console.error(`deleteTestLists - deleting ${list.identifier} answered ${deletion.status}: ${deletion.body}`);
            }
        }

        token = nextToken(listing.links?.next);

        if (!token) {
            break;
        }
    }

    return deleted;
}

/**
 * The continuation token in a next link, for the `token` query parameter.
 *
 * @param {string|null|undefined} nextUrl The next link, if any.
 * @returns {string|undefined} The token, or undefined when there is no next page.
 */
function nextToken(nextUrl) {
    if (!nextUrl) {
        return undefined;
    }

    const match = /[?&]token=([^&]+)/.exec(nextUrl);

    return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * @param {string} orgNo Organization number.
 * @returns {string} The party URN the members endpoints take for an organization.
 */
export function organizationUrn(orgNo) {
    return `urn:altinn:organization:identifier-no:${orgNo}`;
}

/**
 * @param {string} partyUuid Party uuid.
 * @returns {string} The party URN the registry reports members and memberships by.
 */
export function partyUuidUrn(partyUuid) {
    return `urn:altinn:party:uuid:${partyUuid}`;
}

/**
 * @param {string} resourceId Resource identifier.
 * @returns {string} The resource URN memberships are reported by.
 */
export function resourceUrn(resourceId) {
    return `urn:altinn:resource:${resourceId}`;
}

/**
 * Runs one call whose expected answer is an error status, without it counting
 * as a failed request.
 *
 * k6 counts every 4xx and 5xx towards `http_req_failed`, which the strict
 * options hold at zero. A test that expects a 404 after a delete or a 412 on a
 * stale ETag therefore has to mark that status as expected for the one call
 * that is meant to get it. The default expectation is restored afterwards,
 * so nothing else in the iteration inherits it.
 *
 * @template T
 * @param {number} status The status the call is expected to answer with.
 * @param {() => T} call The call.
 * @returns {T} What the call returned.
 */
export function expectingStatus(status, call) {
    http.setResponseCallback(http.expectedStatuses(status));

    try {
        return call();
    } finally {
        http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }));
    }
}

/**
 * The ETag a response carries, for the If-Match and If-None-Match headers.
 *
 * The registry answers with weak ETags (`W/"..."`) and compares them as such,
 * so the value is passed on unchanged.
 *
 * @param {import("k6/http").RefinedResponse<any>} res The response.
 * @returns {string|null} The ETag, or null when the response has none.
 */
export function etagOf(res) {
    return res.headers["Etag"] ?? res.headers["ETag"] ?? null;
}

/**
 * The version an access list ETag stands for.
 *
 * The registry's ETag is `W/"<base64 of {"version":"N"}>"`, where N is the id
 * of the last event on the list. The difference between two versions is how
 * many events the registry recorded in between, which is what a test reports
 * to show what a run costs the event log.
 *
 * @param {string|null} etag The ETag, or null.
 * @returns {number|null} The version, or null when the ETag is missing or not
 * in the registry's format.
 */
export function versionOf(etag) {
    if (!etag) {
        return null;
    }

    const payload = etag.replace(/^W\//, "").replace(/^"|"$/g, "").replace(/-/g, "+").replace(/_/g, "/");

    try {
        const decoded = encoding.b64decode(payload, payload.includes("=") ? "std" : "rawstd", "s");
        const version = Number(JSON.parse(decoded).version);

        return Number.isInteger(version) ? version : null;
    } catch {
        return null;
    }
}
