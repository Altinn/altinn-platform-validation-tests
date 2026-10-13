import { group } from "k6";

import { AccessListClient } from "../../../clients/resource-registry/index.js";
import {
    EnterpriseTokenBuilder,
    EnterpriseTokenGenerator,
    uuidv4,
} from "../../../common-imports.js";
import { fetchTestData, lazy } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";
import { collectNextUrlPages } from "../../building-blocks/common/follow-next-url-pagination.js";
import { AccessListDelete, AccessListGetByOwner } from "../../building-blocks/resource-registry/access-lists/index.js";

/**
 * Prefix of every list the tests create, so teardown can tell them apart.
 */
const IDENTIFIER_PREFIX = "k6-";

/**
 * A resource the tests connect lists to, its owner, and the actions its policy
 * grants.
 *
 * @typedef {object} Resource
 * @property {string} owner Org code that owns the resource and the lists the tests create.
 * @property {string} ownerOrgNo Organization number of the owner.
 * @property {string} resourceId Resource identifier.
 * @property {Array<string>} actions The actions the resource's policy grants.
 */

/**
 * The resources whose access lists the registry enforces. For setup.
 *
 * @returns {Array<Resource>} The resources.
 */
export function getEnforcedResources() {
    /** @type {Array<{owner: string, ownerOrgNo: string, resourceId: string, actions: string}>} */
    const rows = fetchTestData(`resource-registry/access-list-enforced-resources-${__ENV.ENVIRONMENT}.csv`);

    return rows.map((row) => ({
        ...row,
        actions: String(row.actions).split(";").filter((action) => action !== ""),
    }));
}

/**
 * An organization and its daglig leder, the person the policy decision point
 * asks about.
 *
 * @typedef {object} OrganizationWithDailyManager
 * @property {string} orgno Organization number.
 * @property {string} ssn National identity number of the organization's daglig leder.
 */

/**
 * Organizations with their daglig leder, from the pdp-authorize test data. The
 * policies grant access to the daglig leder role, not to the organization
 * itself, so a decision about an organization alone is always NotApplicable.
 * For setup.
 *
 * @returns {Array<OrganizationWithDailyManager>} The organizations.
 */
export function getOrganizationsWithDailyManager() {
    return fetchTestData(`authorization/pdp-authorize/orgs-dagl-${__ENV.ENVIRONMENT}.csv`);
}

/**
 * The one access list client of the VU, and the token generator behind it.
 *
 * @returns {[AccessListClient, EnterpriseTokenGenerator]} The client and its generator.
 */
const getAccessListClientAndTokenGenerator = lazy(function () {
    const tokenGenerator = new EnterpriseTokenGenerator();

    /** @type {[AccessListClient, EnterpriseTokenGenerator]} */
    const clients = [new AccessListClient(__ENV.BASE_URL, tokenGenerator), tokenGenerator];

    return clients;
});

/**
 * Client for the lists, their members and their resource connections of one
 * owner, with an enterprise token for that org.
 *
 * @param {string} owner Org code of the owner.
 * @param {string} ownerOrgNo Organization number of the owner.
 * @returns {AccessListClient} The client, with a token for the owner.
 */
export function getAccessListClient(owner, ownerOrgNo) {
    const [client, tokenGenerator] = getAccessListClientAndTokenGenerator();

    tokenGenerator.setTokenGeneratorOptions(
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

    return client;
}

/**
 * A fresh access list identifier.
 *
 * @returns {string} The identifier.
 */
export function newIdentifier() {
    return `${IDENTIFIER_PREFIX}${uuidv4()}`;
}

/**
 * Most pages to follow when reading an owner's lists. The registry pages by
 * 20, so this covers an owner with up to 400 lists.
 */
const MAX_LIST_PAGES = 20;

/**
 * Reads every page of an owner's lists. The registry answers 20 lists per
 * page, sorted by identifier, so a k6- list can sit on any page.
 *
 * @param {AccessListClient} client Client with a token for the owner.
 * @param {string} owner Org code of the owner.
 * @param {{[key: string]: string}|null} labels k6 request labels for the step.
 * @returns {Array<import("../../../clients/resource-registry/types.js").AccessListInfoDto>|null} The lists on every page, or null when the first page did not come back.
 */
function getAllListsOfOwner(client, owner, labels) {
    const firstPage = AccessListGetByOwner(client, owner, null, labels);

    if (firstPage === null) {
        return null;
    }

    const rest = collectNextUrlPages(client.tokenGenerator.getToken(), firstPage.links?.next ?? null, MAX_LIST_PAGES, labels);

    if (rest.failedUrl !== null) {
        console.error(`getAllListsOfOwner - a page of the lists of ${owner} answered ${rest.failedStatus}: ${rest.failedUrl}`);
    }

    return [firstPage, ...rest.pages].flatMap((page) => /** @type {Array<any>} */ (page.data ?? []));
}

/**
 * Deletes every k6- list of the owners in the resources.
 *
 * @param {Array<Resource>} resources The resources the run picked from.
 * @returns {number} How many lists were deleted.
 */
export function deleteTestLists(resources) {
    /** @type {Map<string, string>} */
    const owners = new Map(resources.map((resource) => [resource.owner, resource.ownerOrgNo]));
    let deleted = 0;

    for (const [owner, ownerOrgNo] of owners) {
        const client = getAccessListClient(owner, ownerOrgNo);
        const teardownLabel = { step: `Teardown - delete the k6- lists of ${owner}` };

        group(teardownLabel.step, function () {
            const lists = getAllListsOfOwner(client, owner, teardownLabel) ?? [];

            for (const list of lists.filter((item) => item.identifier.startsWith(IDENTIFIER_PREFIX))) {
                if (AccessListDelete(client, owner, list.identifier, teardownLabel) !== null) {
                    deleted++;
                }
            }
        });
    }

    return deleted;
}
