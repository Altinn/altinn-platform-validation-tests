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
import { fetchTestData, lazy } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";
import { collectNextUrlPages } from "../../building-blocks/common/follow-next-url-pagination.js";

/**
 * Reads `K6/testdata/resource-registry/<name>-<env>.csv` from main, or from
 * TESTDATA_BRANCH when set.
 *
 * @param {string} name File name without the environment suffix, e.g. "organizations".
 * @returns {Array<any>} The rows. Fails the test when the file is missing or empty.
 */
function readRows(name) {
    return fetchTestData(
        `resource-registry/${name}-${__ENV.ENVIRONMENT}.csv`,
        true,
        __ENV.TESTDATA_BRANCH || "main",
    );
}

/**
 * One row of configuration-<env>.csv. See the README for what each value is.
 *
 * @typedef {object} Configuration
 * @property {string} owner Org code that owns the lists the tests create.
 * @property {string} ownerOrgNo Organization number of the owner.
 * @property {string} resourceId Resource the tests connect their lists to.
 */

/**
 * Prefix of every list the tests create, so teardown can tell them apart.
 */
export const IDENTIFIER_PREFIX = "k6-";

/**
 * The configuration for the environment the run is against, read once per VU.
 * RESOURCE_REGISTRY_OWNER, RESOURCE_REGISTRY_OWNER_ORG_NO and
 * RESOURCE_REGISTRY_RESOURCE_ID override the file for an ad-hoc run.
 *
 * @returns {Configuration} The configuration.
 */
export const getConfiguration = lazy(function () {
    /** @type {Partial<Configuration>} */
    const row = readRows("configuration")[0] ?? {};
    const configuration = {
        owner: __ENV.RESOURCE_REGISTRY_OWNER || row.owner,
        ownerOrgNo: __ENV.RESOURCE_REGISTRY_OWNER_ORG_NO || row.ownerOrgNo,
        resourceId: __ENV.RESOURCE_REGISTRY_RESOURCE_ID || row.resourceId,
    };

    if (!configuration.owner || !configuration.ownerOrgNo || !configuration.resourceId) {
        throw new Error(`resource-registry/configuration-${__ENV.ENVIRONMENT}.csv needs owner, ownerOrgNo and resourceId; got ${JSON.stringify(row)}`);
    }

    return /** @type {Configuration} */ (configuration);
});

/**
 * Client for the lists, their members and their resource connections, with an
 * enterprise token for the owner org.
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
 * Platform access token for the two platform-component lookups. See the
 * README on tokens.
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
 * Second AccessListClient, on the platform token, for get-by-member only.
 *
 * @returns {AccessListClient} The client.
 */
export const getAccessListPlatformClient = lazy(function () {
    return new AccessListClient(__ENV.BASE_URL, getPlatformTokenGenerator());
});

/**
 * Client for the v2 resource endpoints, which are public.
 *
 * @returns {ResourceV2Client} The client.
 */
export const getResourceV2Client = lazy(function () {
    return new ResourceV2Client(__ENV.BASE_URL);
});

/**
 * One row of organizations-<env>.csv: a Tenor organization with its Altinn party.
 *
 * @typedef {object} Organization
 * @property {string} orgNo Organization number.
 * @property {string} partyId Altinn party id.
 * @property {string} partyUuid Altinn party uuid.
 * @property {"AS"|"ENK"} orgForm Organization form.
 */

/**
 * The organizations to add as members, optionally only those of one form.
 *
 * @param {"AS"|"ENK"} [orgForm] Keep only organizations of this form.
 * @returns {Array<Organization>} The organizations. Fails when there are none.
 */
export function loadOrganizations(orgForm) {
    /** @type {Array<Organization>} */
    const rows = readRows("organizations");
    const organizations = orgForm ? rows.filter((row) => row.orgForm === orgForm) : rows;

    if (organizations.length === 0) {
        throw new Error(`No ${orgForm ?? ""} organizations in resource-registry/organizations-${__ENV.ENVIRONMENT}.csv`);
    }

    return organizations;
}

/**
 * A fresh, prefixed access list identifier.
 *
 * @returns {string} The identifier.
 */
export function newIdentifier() {
    return `${IDENTIFIER_PREFIX}${uuidv4()}`;
}

/**
 * Deletes the owner's k6- lists, for teardown, so a run that failed halfway
 * leaves nothing behind. Lists people made by hand are left alone.
 *
 * @returns {number} How many lists were deleted.
 */
export function deleteTestLists() {
    const client = getAccessListClient();
    const { owner } = getConfiguration();
    const first = client.AccessListGetByOwner(owner);

    if (first.status !== 200) {
        console.error(`deleteTestLists - listing the lists of ${owner} answered ${first.status}: ${first.body}`);

        return 0;
    }

    /** @type {import("../../../clients/resource-registry/types.js").AccessListInfoDtoPaginated} */
    const firstPage = JSON.parse(String(first.body));
    const rest = collectNextUrlPages(client.tokenGenerator.getToken(), firstPage.links?.next ?? null, 20);

    if (rest.failedUrl !== null) {
        console.error(`deleteTestLists - a page of the lists of ${owner} answered ${rest.failedStatus}: ${rest.failedUrl}`);
    }

    if (rest.repeatedUrl !== null) {
        console.error(`deleteTestLists - the lists of ${owner} handed out the same next link twice: ${rest.repeatedUrl}`);
    }

    /** @type {Array<import("../../../clients/resource-registry/types.js").AccessListInfoDto>} */
    const lists = [firstPage, ...rest.pages].flatMap((page) => /** @type {Array<any>} */ (page.data ?? []));
    let deleted = 0;

    for (const list of lists.filter((item) => item.identifier.startsWith(IDENTIFIER_PREFIX))) {
        const deletion = client.AccessListDelete(owner, list.identifier);

        if (deletion.status === 200) {
            deleted++;
        } else {
            console.error(`deleteTestLists - deleting ${list.identifier} answered ${deletion.status}: ${deletion.body}`);
        }
    }

    return deleted;
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
