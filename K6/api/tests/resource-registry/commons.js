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
 * Prefix of every list the tests create, so teardown can tell them apart.
 */
export const IDENTIFIER_PREFIX = "k6-";

/**
 * Reads `K6/testdata/resource-registry/<name>-<env>.csv` from main, or from
 * TESTDATA_BRANCH when set. For setup only.
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
 * One row of resources-<env>.csv: a resource the tests connect lists to, its
 * owner, and the actions its policy grants. See the README for what each is.
 *
 * @typedef {object} Resource
 * @property {string} owner Org code that owns the resource and the lists the tests create.
 * @property {string} ownerOrgNo Organization number of the owner.
 * @property {string} resourceId Resource identifier.
 * @property {Array<string>} actions The actions the resource's policy grants.
 */

/**
 * The resources to connect lists to. For setup.
 *
 * @returns {Array<Resource>} The resources.
 */
export function getResources() {
    /** @type {Array<{owner: string, ownerOrgNo: string, resourceId: string, actions: string}>} */
    const rows = readRows("resources");

    return rows.map((row) => ({
        ...row,
        actions: String(row.actions).split(";").filter((action) => action !== ""),
    }));
}

/**
 * One row of organizations-<env>.csv: a Tenor organization with its Altinn party.
 *
 * @typedef {object} Organization
 * @property {string} orgNo Organization number.
 * @property {string} partyId Altinn party id.
 * @property {string} partyUuid Altinn party uuid.
 * @property {"AS"|"ENK"} unitType Organization form, named as Register and Profile report it.
 */

/**
 * The organizations to add as members, optionally only those of one form. For setup.
 *
 * @param {"AS"|"ENK"} [unitType] Keep only organizations of this form.
 * @returns {Array<Organization>} The organizations. Fails when there are none.
 */
export function getOrganizations(unitType) {
    /** @type {Array<Organization>} */
    const rows = readRows("organizations");
    const organizations = unitType ? rows.filter((row) => row.unitType === unitType) : rows;

    if (organizations.length === 0) {
        throw new Error(`No ${unitType ?? ""} organizations in resource-registry/organizations-${__ENV.ENVIRONMENT}.csv`);
    }

    return organizations;
}

/** @type {Map<string, AccessListClient>} */
const accessListClients = new Map();

/**
 * Client for the lists, their members and their resource connections of one
 * owner, with an enterprise token for that org. Built once per owner per VU.
 *
 * @param {string} owner Org code of the owner.
 * @param {string} ownerOrgNo Organization number of the owner.
 * @returns {AccessListClient} The client.
 */
export function getAccessListClient(owner, ownerOrgNo) {
    let client = accessListClients.get(owner);

    if (client === undefined) {
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

        client = new AccessListClient(__ENV.BASE_URL, tokenGenerator);
        accessListClients.set(owner, client);
    }

    return client;
}

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
 * A fresh, prefixed access list identifier.
 *
 * @returns {string} The identifier.
 */
export function newIdentifier() {
    return `${IDENTIFIER_PREFIX}${uuidv4()}`;
}

/**
 * Deletes an owner's k6- lists, for teardown, so a run that failed halfway
 * leaves nothing behind. Lists people made by hand are left alone.
 *
 * @param {string} owner Org code of the owner.
 * @param {string} ownerOrgNo Organization number of the owner.
 * @returns {number} How many lists were deleted.
 */
export function deleteTestLists(owner, ownerOrgNo) {
    const client = getAccessListClient(owner, ownerOrgNo);
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
 * Deletes the k6- lists of every owner in the resources, for a teardown that
 * gets the setup data.
 *
 * @param {Array<Resource>} resources The resources the run picked from.
 * @returns {number} How many lists were deleted.
 */
export function deleteTestListsOf(resources) {
    /** @type {Map<string, string>} */
    const owners = new Map(resources.map((resource) => [resource.owner, resource.ownerOrgNo]));
    let deleted = 0;

    for (const [owner, ownerOrgNo] of owners) {
        deleted += deleteTestLists(owner, ownerOrgNo);
    }

    return deleted;
}
