import { check } from "k6";

import {
    AccessListInfoDto,
    AccessListMembershipDtoAggregateVersionVersionedPaginated,
    AccessListResourceConnectionDto,
} from "../../../clients/resource-registry/types.js";

const ORGANIZATION_IDENTIFIER = "urn:altinn:organization:identifier-no";

/**
 * @param {Array<string>|null|undefined} left One list of strings.
 * @param {Array<string>|null|undefined} right Another.
 * @returns {boolean} True when both hold the same strings, in any order.
 */
function sameSet(left, right) {
    const a = [...(left ?? [])].sort();
    const b = [...(right ?? [])].sort();

    return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * @param {import("../../../clients/resource-registry/types.js").AccessListMembershipDto} member A member.
 * @returns {string} The member's organization number, or "" when it has none.
 */
function organizationNumberOf(member) {
    return String(member.identifiers?.[ORGANIZATION_IDENTIFIER] ?? "");
}

/**
 * Checks that an access list came back as the one that was written: same
 * identifier, name and description, and a URN built from owner and identifier.
 * The URN is the one field the registry derives itself, so it is what says the
 * list landed under the right owner.
 *
 * @param {AccessListInfoDto|null} accessList - The access list returned by the API.
 * @param {{owner: string, identifier: string, name: string, description: string}} expected - What was written.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if every field matches, false otherwise.
 */
function CheckAccessListInfo(accessList, expected, operation) {
    const expectedUrn = `urn:altinn:access-list:${expected.owner}:${expected.identifier}`;

    const success = check(accessList, {
        [`CheckAccessListInfo - ${operation} returns the list as written`]: (list) =>
            list !== null &&
            list.identifier === expected.identifier &&
            list.urn === expectedUrn &&
            list.name === expected.name &&
            list.description === expected.description,
    });

    if (!success) {
        console.error(`CheckAccessListInfo - ${operation} expected ${JSON.stringify({ ...expected, urn: expectedUrn })}`);
        console.error(`CheckAccessListInfo - ${operation} returned ${JSON.stringify(accessList)}`);
    }

    return success;
}

/**
 * Checks that the members of a list are exactly the organizations that were
 * added, read off the organization number in each member's identifiers. An
 * empty expectation checks that the list has no members.
 *
 * @param {AccessListMembershipDtoAggregateVersionVersionedPaginated|null} page - The members page returned by the API.
 * @param {Array<string>} expectedOrganizationNumbers - The organization numbers the list has to hold, and no others.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the members match, false otherwise.
 */
function CheckMembers(page, expectedOrganizationNumbers, operation) {
    const organizationNumbers = (page?.data ?? []).map(organizationNumberOf);

    const success = check(page, {
        [`CheckMembers - ${operation} holds exactly the expected members`]: (response) =>
            Array.isArray(response?.data) && sameSet(organizationNumbers, expectedOrganizationNumbers),
    });

    if (!success) {
        console.error(`CheckMembers - ${operation} expected members ${JSON.stringify(expectedOrganizationNumbers)}`);
        console.error(`CheckMembers - ${operation} returned members ${JSON.stringify(organizationNumbers)}`);
    }

    return success;
}

/**
 * Checks that the resource connections of a list are exactly the ones made,
 * with the action filters that were written. An empty expectation checks that
 * the list has no connections.
 *
 * Takes the connections themselves, so it serves both the connections page
 * and the `resourceConnections` a listing includes on each list.
 *
 * @param {Array<AccessListResourceConnectionDto>|null|undefined} connections - The connections returned by the API.
 * @param {Array<{resourceIdentifier: string, actionFilters: Array<string>|null}>} expected - The connections the list has to hold.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the connections match, false otherwise.
 */
function CheckResourceConnections(connections, expected, operation) {
    const identifiers = (connections ?? []).map((connection) => connection.resourceIdentifier);
    const wrongFilters = expected
        .filter((wanted) => {
            const actual = (connections ?? []).find((connection) => connection.resourceIdentifier === wanted.resourceIdentifier);

            return actual !== undefined && !sameSet(actual.actionFilters, wanted.actionFilters);
        })
        .map((wanted) => wanted.resourceIdentifier);

    const success = check(connections, {
        [`CheckResourceConnections - ${operation} holds exactly the expected connections`]: (items) =>
            Array.isArray(items) &&
            sameSet(identifiers, expected.map((wanted) => wanted.resourceIdentifier)) &&
            wrongFilters.length === 0,
    });

    if (!success) {
        console.error(`CheckResourceConnections - ${operation} expected ${JSON.stringify(expected)}`);
        console.error(`CheckResourceConnections - ${operation} returned ${JSON.stringify(connections)}`);
    }

    return success;
}

export const AccessListDomainChecks = {
    CheckAccessListInfo,
    CheckMembers,
    CheckResourceConnections,
};
