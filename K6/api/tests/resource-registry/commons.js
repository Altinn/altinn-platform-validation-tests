import { group } from "k6";

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
import { AccessListDelete, AccessListGetByOwner } from "../../building-blocks/resource-registry/access-lists/index.js";

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
    return toResources(readRows("resources"));
}

/**
 * The resources whose access lists the registry enforces, for the test that
 * checks a membership through the policy decision point. Kept apart from
 * resources-<env>.csv, where a connection must grant nobody anything. For setup.
 *
 * @returns {Array<Resource>} The resources.
 */
export function getEnforcedResources() {
    return toResources(readRows("access-list-enforced-resources"));
}

/**
 * @param {Array<{owner: string, ownerOrgNo: string, resourceId: string, actions: string}>} rows Rows of a resources file.
 * @returns {Array<Resource>} The rows, with the actions split.
 */
function toResources(rows) {
    return rows.map((row) => ({
        ...row,
        actions: String(row.actions).split(";").filter((action) => action !== ""),
    }));
}

/**
 * One row of the authorization test data: an organization and its daglig
 * leder, the person the policy decision point asks about.
 *
 * @typedef {object} OrganizationWithDailyManager
 * @property {string} orgno Organization number.
 * @property {string} ssn National identity number of the organization's daglig leder.
 */

/**
 * Organizations with their daglig leder, from the pdp-authorize test data. The
 * resource-registry organizations have no person attached, and the policies
 * grant access to the daglig leder role, not to the organization itself, so a
 * decision about an organization alone is always NotApplicable. For setup.
 *
 * @returns {Array<OrganizationWithDailyManager>} The organizations. Fails when there are fewer than two.
 */
export function getOrganizationsWithDailyManager() {
    /** @type {Array<OrganizationWithDailyManager>} */
    const rows = fetchTestData(
        `authorization/pdp-authorize/orgs-dagl-${__ENV.ENVIRONMENT}.csv`,
        true,
        __ENV.TESTDATA_BRANCH || "main",
    );

    if (rows.length < 2) {
        throw new Error(`Need at least two organizations in authorization/pdp-authorize/orgs-dagl-${__ENV.ENVIRONMENT}.csv`);
    }

    return rows;
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
 * A fresh id for one run, for setup, so the lists a run creates can be told
 * from the lists of a run that overlaps with it. Eight hex characters: short
 * enough to read in a listing, and two runs an hour apart will not collide.
 *
 * @returns {string} The run id.
 */
export function newRunId() {
    return uuidv4().slice(0, 8);
}

/**
 * The prefix of every list one run creates.
 *
 * @param {string} runId The run id from setup.
 * @returns {string} The prefix.
 */
function runPrefix(runId) {
    return `${IDENTIFIER_PREFIX}${runId}-`;
}

/**
 * A fresh access list identifier for this run.
 *
 * @param {string} runId The run id from setup.
 * @returns {string} The identifier.
 */
export function newIdentifier(runId) {
    return `${runPrefix(runId)}${uuidv4()}`;
}

/**
 * How old a k6- list has to be before a teardown that did not create it
 * deletes it. A run takes well under a minute, so a list this old is a
 * leftover from a run whose teardown never ran, not a list another run is
 * still using.
 */
const STALE_AFTER_MS = 60 * 60 * 1000;

/**
 * Whether a teardown for `runId` should delete a list: the run's own lists,
 * and any k6- list old enough to be a leftover. The scheduled run and a
 * manual or PR run overlap now and then, and each only deletes its own.
 *
 * @param {import("../../../clients/resource-registry/types.js").AccessListInfoDto} list A list of the owner.
 * @param {string} runId The run id from setup.
 * @returns {boolean} True when the list is this run's or a stale leftover.
 */
function isOursOrStale(list, runId) {
    if (list.identifier.startsWith(runPrefix(runId))) {
        return true;
    }

    return list.identifier.startsWith(IDENTIFIER_PREFIX) && Date.now() - Date.parse(list.createdAt) > STALE_AFTER_MS;
}

/**
 * Most pages to follow when reading an owner's lists. The registry pages by
 * 20, so this covers an owner with up to 400 lists.
 */
const MAX_LIST_PAGES = 20;

/**
 * Reads every page of an owner's lists. The registry answers 20 lists per
 * page, sorted by identifier, so a list the test just created can sit on any
 * page, and a check on the first page alone passes or fails on how many lists
 * the owner happens to have. The first page goes through the building block,
 * which checks it; the rest follow `links.next` and are only logged when a
 * page fails, since the walk is a means to the content checks and not the
 * thing under test.
 *
 * @param {AccessListClient} client Client with a token for the owner.
 * @param {string} owner Org code of the owner.
 * @param {import("../../../clients/resource-registry/types.js").AccessListGetByOwnerQuery|null} query Optional query, e.g. with resource-actions included.
 * @param {{[key: string]: string}|null} labels k6 request labels for the step.
 * @returns {Array<import("../../../clients/resource-registry/types.js").AccessListInfoDto>|null} The lists on every page, or null when the first page did not come back.
 */
export function getAllListsOfOwner(client, owner, query, labels) {
    const firstPage = AccessListGetByOwner(client, owner, query, null, labels);

    if (firstPage === null) {
        return null;
    }

    const rest = collectNextUrlPages(client.tokenGenerator.getToken(), firstPage.links?.next ?? null, MAX_LIST_PAGES, labels);

    if (rest.failedUrl !== null) {
        console.error(`getAllListsOfOwner - a page of the lists of ${owner} answered ${rest.failedStatus}: ${rest.failedUrl}`);
    }

    if (rest.repeatedUrl !== null) {
        console.error(`getAllListsOfOwner - the lists of ${owner} handed out the same next link twice: ${rest.repeatedUrl}`);
    }

    return [firstPage, ...rest.pages].flatMap((page) => /** @type {Array<any>} */ (page.data ?? []));
}

/**
 * Deletes the k6- lists of an owner that this run made, and any k6- list old
 * enough to be a leftover from a run whose teardown never ran. Lists another
 * run is using right now and lists people made by hand are left alone.
 *
 * @param {string} owner Org code of the owner.
 * @param {string} ownerOrgNo Organization number of the owner.
 * @param {string} runId The run id from setup.
 * @returns {number} How many lists were deleted.
 */
export function deleteTestLists(owner, ownerOrgNo, runId) {
    const client = getAccessListClient(owner, ownerOrgNo);
    const teardownLabel = { step: `Teardown - delete the k6- lists of ${owner}` };
    let deleted = 0;

    group(teardownLabel.step, function () {
        const lists = getAllListsOfOwner(client, owner, null, teardownLabel);

        if (lists === null) {
            return;
        }

        for (const list of lists.filter((item) => isOursOrStale(item, runId))) {
            if (AccessListDelete(client, owner, list.identifier, null, teardownLabel).status === 200) {
                deleted++;
            }
        }
    });

    return deleted;
}

/**
 * Deletes this run's lists, and stale leftovers, for every owner in the
 * resources, for a teardown that gets the setup data.
 *
 * @param {Array<Resource>} resources The resources the run picked from.
 * @param {string} runId The run id from setup.
 * @returns {number} How many lists were deleted.
 */
export function deleteTestListsOf(resources, runId) {
    /** @type {Map<string, string>} */
    const owners = new Map(resources.map((resource) => [resource.owner, resource.ownerOrgNo]));
    let deleted = 0;

    for (const [owner, ownerOrgNo] of owners) {
        deleted += deleteTestLists(owner, ownerOrgNo, runId);
    }

    return deleted;
}
