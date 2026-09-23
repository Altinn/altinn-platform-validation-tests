import { check } from "k6";

import {
    AccessListInfoDto,
    AccessListMembershipDtoAggregateVersionVersionedPaginated,
    AccessListResourceConnectionDto,
    AccessListResourceMembershipWithActionFilterDtoListObject,
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
 * Checks that a listing holds a given access list. Looks for the identifier
 * rather than counting, since a listing by owner or by member also holds
 * whatever lists people made by hand in the environment.
 *
 * @param {Array<AccessListInfoDto>|null|undefined} lists - The lists returned by the API.
 * @param {string} identifier - The identifier the listing has to hold.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the listing holds the list, false otherwise.
 */
function CheckContainsList(lists, identifier, operation) {
    const success = check(lists, {
        [`CheckContainsList - ${operation} holds the access list`]: (items) =>
            Array.isArray(items) && items.some((list) => list.identifier === identifier),
    });

    if (!success) {
        console.error(`CheckContainsList - ${operation} did not hold '${identifier}'`);
        console.error(`CheckContainsList - identifiers returned: ${JSON.stringify((lists ?? []).map((list) => list.identifier))}`);
    }

    return success;
}

/**
 * Checks that a listing no longer holds a given access list, after it was
 * deleted or disconnected.
 *
 * @param {Array<AccessListInfoDto>|null|undefined} lists - The lists returned by the API.
 * @param {string} identifier - The identifier the listing must not hold.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the listing does not hold the list, false otherwise.
 */
function CheckDoesNotContainList(lists, identifier, operation) {
    const success = check(lists, {
        [`CheckDoesNotContainList - ${operation} no longer holds the access list`]: (items) =>
            Array.isArray(items) && !items.some((list) => list.identifier === identifier),
    });

    if (!success) {
        console.error(`CheckDoesNotContainList - ${operation} still held '${identifier}'`);
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
 * Checks that the registry resolved each organization number to the party the
 * test data says it is. Members are reported by party uuid, so an organization
 * resolved to the wrong party would still pass CheckMembers.
 *
 * @param {AccessListMembershipDtoAggregateVersionVersionedPaginated|null} page - The members page returned by the API.
 * @param {{[organizationNumber: string]: string}} expectedPartyUuidUrns - Organization number to the party uuid URN it has to resolve to.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if every member resolved as expected, false otherwise.
 */
function CheckMembersResolveToParties(page, expectedPartyUuidUrns, operation) {
    const wrong = (page?.data ?? [])
        .filter((member) => {
            const expected = expectedPartyUuidUrns[organizationNumberOf(member)];

            return expected !== undefined && member.id !== expected;
        })
        .map((member) => `${organizationNumberOf(member)}: expected ${expectedPartyUuidUrns[organizationNumberOf(member)]}, got ${member.id}`);

    const success = check(page, {
        [`CheckMembersResolveToParties - ${operation} resolves every member to its party`]: (response) =>
            Array.isArray(response?.data) && response.data.length > 0 && wrong.length === 0,
    });

    if (!success) {
        console.error(`CheckMembersResolveToParties - ${operation} members that resolved to another party: ${JSON.stringify(wrong)}`);
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

/**
 * Checks that a memberships lookup reports a party as a member of a resource's
 * access list with the action filters the connection was made with. The lookup
 * also lists whatever other lists the party sits on, so this finds the one
 * entry rather than counting.
 *
 * @param {AccessListResourceMembershipWithActionFilterDtoListObject|null} memberships - The memberships returned by the API.
 * @param {{party: string, resource: string, actionFilters: Array<string>|null}} expected - Party uuid URN, resource URN and action filters.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the membership is reported as expected, false otherwise.
 */
function CheckMembership(memberships, expected, operation) {
    const matching = (memberships?.data ?? []).filter(
        (membership) => membership.party === expected.party && membership.resource === expected.resource,
    );

    const success = check(memberships, {
        [`CheckMembership - ${operation} reports the party as a member for the resource`]: () =>
            matching.length === 1 && sameSet(matching[0].actionFilters, expected.actionFilters),
    });

    if (!success) {
        console.error(`CheckMembership - ${operation} expected ${JSON.stringify(expected)}`);
        console.error(`CheckMembership - ${operation} returned ${JSON.stringify(memberships?.data)}`);
    }

    return success;
}

/**
 * Checks the status of a call made straight on the client, for the responses
 * the building blocks do not accept: a 404 after a delete, a 304 on a matching
 * If-None-Match, a 412 on a stale If-Match.
 *
 * @param {import("k6/http").RefinedResponse<any>} res - The response.
 * @param {number} expectedStatus - The status the call has to answer with.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the status matches, false otherwise.
 */
function CheckStatus(res, expectedStatus, operation) {
    const success = check(res, {
        [`CheckStatus - ${operation} answers ${expectedStatus}`]: (response) =>
            response.status === expectedStatus,
    });

    if (!success) {
        console.error(`CheckStatus - ${operation} answered ${res.status}, expected ${expectedStatus}`);
        console.error(`CheckStatus - ${operation} body: ${res.body}`);
    }

    return success;
}

/**
 * Checks that a response carries an ETag, which the write endpoints need for
 * If-Match and the read endpoints for If-None-Match.
 *
 * @param {string|null} etag - The ETag read off the response.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if there is an ETag, false otherwise.
 */
function CheckHasEtag(etag, operation) {
    const success = check(etag, {
        [`CheckHasEtag - ${operation} carries an ETag`]: (value) =>
            typeof value === "string" && value.length > 0,
    });

    if (!success) {
        console.error(`CheckHasEtag - ${operation} carried no ETag`);
    }

    return success;
}

/**
 * Checks that a write moved the ETag on, so a caller holding the old one gets
 * a 412 on its next write rather than overwriting what happened in between.
 *
 * @param {string|null} before - The ETag before the write.
 * @param {string|null} after - The ETag after the write.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the ETag changed, false otherwise.
 */
function CheckEtagChanged(before, after, operation) {
    const success = check(after, {
        [`CheckEtagChanged - ${operation} moves the ETag on`]: (value) =>
            typeof value === "string" && value.length > 0 && value !== before,
    });

    if (!success) {
        console.error(`CheckEtagChanged - ${operation} ETag before: ${before}, after: ${after}`);
    }

    return success;
}

/**
 * Checks that a write which changed nothing left the ETag where it was. The
 * registry records every version as an event it never deletes, so a client
 * that repeats an identical write must not cost a new version each time.
 *
 * @param {string|null} before - The ETag before the write.
 * @param {string|null} after - The ETag after the write.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the ETag is unchanged, false otherwise.
 */
function CheckEtagUnchanged(before, after, operation) {
    const success = check(after, {
        [`CheckEtagUnchanged - ${operation} keeps the ETag`]: (value) =>
            typeof before === "string" && before.length > 0 && value === before,
    });

    if (!success) {
        console.error(`CheckEtagUnchanged - ${operation} ETag before: ${before}, after: ${after}`);
    }

    return success;
}

export const AccessListDomainChecks = {
    CheckAccessListInfo,
    CheckContainsList,
    CheckDoesNotContainList,
    CheckMembers,
    CheckMembersResolveToParties,
    CheckResourceConnections,
    CheckMembership,
    CheckStatus,
    CheckHasEtag,
    CheckEtagChanged,
    CheckEtagUnchanged,
};
