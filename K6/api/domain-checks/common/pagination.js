import { check } from "k6";

/**
 * What these checks read off a paginated response, whichever API it came from.
 *
 * Everything is optional and nullable, since reporting on a page that is missing
 * what pagination needs is the whole point of the checks.
 *
 * @typedef {object} PaginatedResponse
 * @property {unknown[]|null} [data] The items on the page.
 * @property {{next?: string|null}|null} [links] Links to the neighbouring pages.
 */

/**
 * Checks that a paginated response has the fields the pagination relies on.
 *
 * @param {PaginatedResponse|null} paginated - The paginated response.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the response is shaped as expected, false otherwise.
 */
function CheckPaginatedShape(paginated, operation) {
    const success = check(paginated, {
        [`CheckPaginatedShape - ${operation} returns data and links`]: (response) => {
            return response !== null &&
                Array.isArray(response.data) &&
                response.links !== null &&
                response.links !== undefined;
        },
    });

    if (!success) {
        console.error(`CheckPaginatedShape - ${operation} response was not shaped as expected: ${JSON.stringify(paginated)}`);
    }

    return success;
}

/**
 * Checks that a paginated response holds at least one item.
 *
 * @param {PaginatedResponse|null} paginated - The paginated response.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the response holds items, false otherwise.
 */
function CheckPaginatedNotEmpty(paginated, operation) {
    const success = check(paginated, {
        [`CheckPaginatedNotEmpty - ${operation} returns at least one item`]: (response) => {
            return Array.isArray(response?.data) && response.data.length > 0;
        },
    });

    if (!success) {
        console.error(`CheckPaginatedNotEmpty - ${operation} returned no items, so there is nothing to page through`);
        console.error(`CheckPaginatedNotEmpty - response: ${JSON.stringify(paginated)}`);
    }

    return success;
}

/**
 * Checks that more than the first page was returned.
 *
 * @param {number} pages - Number of pages fetched, including the first one.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if more than one page was returned, false otherwise.
 */
function CheckMultiplePages(pages, operation) {
    const success = check(pages, {
        [`CheckMultiplePages - ${operation} returns more than one page`]: (count) => count > 1,
    });

    if (!success) {
        console.error(`CheckMultiplePages - ${operation} returned ${pages} page(s), expected more than one`);
    }

    return success;
}

/**
 * Checks that every item in a paginated response belongs to the system that was asked
 * for. Works for anything keyed on `systemId`, such as system users and their requests.
 *
 * @param {PaginatedResponse|null} paginated - The paginated response.
 * @param {string} expectedSystemId - The system the items were asked for.
 * @param {string} itemName - What the items are, used in the check name and logs.
 * @returns {boolean} True if every item belongs to the system, false otherwise.
 */
function CheckItemsBelongToSystem(paginated, expectedSystemId, itemName) {
    const items = /** @type {Array<{systemId?: string|null}>} */ (paginated?.data ?? []);
    const foreign = items.filter((item) => item.systemId !== expectedSystemId);

    const success = check(paginated, {
        [`CheckItemsBelongToSystem - Every ${itemName} belongs to the expected system`]: () =>
            items.length > 0 && foreign.length === 0,
    });

    if (!success) {
        console.error(`CheckItemsBelongToSystem - expected every ${itemName} to have systemId '${expectedSystemId}'`);
        console.error(`CheckItemsBelongToSystem - system ids for other systems: ${JSON.stringify(foreign.map((item) => item.systemId))}`);
    }

    return success;
}

/**
 * Checks that a paginated response hands out a next link that can actually be followed,
 * and that it points back at the environment the request was made against.
 *
 * @param {PaginatedResponse|null} paginated - The paginated response.
 * @param {string} expectedBaseUrl - The prefix the next link is expected to start with.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the next link is usable, false otherwise.
 */
function CheckNextLink(paginated, expectedBaseUrl, operation) {
    const nextLink = paginated?.links?.next;

    const success = check(paginated, {
        [`CheckNextLink - ${operation} returns a next link`]: () =>
            typeof nextLink === "string" && nextLink.length > 0,
        [`CheckNextLink - ${operation} next link is https`]: () =>
            typeof nextLink === "string" && nextLink.startsWith("https://"),
        [`CheckNextLink - ${operation} next link points at this environment`]: () =>
            typeof nextLink === "string" && nextLink.startsWith(expectedBaseUrl),
    });

    if (!success) {
        console.error(`CheckNextLink - ${operation} next link: ${nextLink}`);
        console.error(`CheckNextLink - expected it to start with: ${expectedBaseUrl}`);
    }

    return success;
}

/**
 * Checks that a page does not hand out a next link.
 *
 * The counterpart to CheckNextLink, for a listing that holds everything there is:
 * a next link there would send a caller to a page that cannot exist.
 *
 * @param {PaginatedResponse|null} paginated - The paginated response.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if there is no next link, false otherwise.
 */
function CheckNoNextLink(paginated, operation) {
    const nextLink = paginated?.links?.next;

    const success = check(paginated, {
        [`CheckNoNextLink - ${operation} hands out no next link`]: () =>
            nextLink === null || nextLink === undefined || nextLink === "",
    });

    if (!success) {
        console.error(`CheckNoNextLink - ${operation} next link: ${nextLink}`);
    }

    return success;
}

/**
 * Checks that paging through actually reached items the first page did not hold.
 *
 * Counting pages says pagination moved, not that it went anywhere. An endpoint that
 * answers the first page again under a fresh next link has moved a page and
 * delivered nothing, and a count cannot tell the two apart. This can: it is the
 * number of distinct items seen across every page, against the number one page can
 * hold.
 *
 * @param {number} distinctItems - Distinct items seen across all pages.
 * @param {number} firstPageItems - Items on the first page.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if paging reached items beyond the first page, false otherwise.
 */
function CheckPagesHoldDistinctItems(distinctItems, firstPageItems, operation) {
    const success = check(distinctItems, {
        [`CheckPagesHoldDistinctItems - ${operation} pages hold items the first page did not`]: (count) =>
            count > firstPageItems,
    });

    if (!success) {
        console.error(`CheckPagesHoldDistinctItems - ${operation} saw ${distinctItems} distinct item(s) across all pages, the first page alone held ${firstPageItems}`);
    }

    return success;
}

/**
 * Checks that the walk was never handed a next link it had already followed.
 *
 * A repeated link is how a stuck pagination presents itself: the endpoint keeps
 * offering the same continuation, so a walker either loops or stops. Named after
 * the operation, unlike the generic check inside the follow helper, so a failure
 * says which listing was stuck.
 *
 * @param {string|null} repeatedUrl - The URL that ended the walk by repeating, or null.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if no next link repeated, false otherwise.
 */
function CheckNextLinksDoNotRepeat(repeatedUrl, operation) {
    const success = check(repeatedUrl, {
        [`CheckNextLinksDoNotRepeat - ${operation} never hands out the same next link twice`]: (url) =>
            url === null,
    });

    if (!success) {
        console.error(`CheckNextLinksDoNotRepeat - ${operation} handed out this next link again: ${repeatedUrl}`);
    }

    return success;
}

/**
 * Checks that every page the walk asked for actually answered.
 *
 * A walk that dies partway still returns the pages it did read, so a caller looking
 * only at those sees a healthy prefix. That is the dangerous shape: a listing whose
 * last page fails still delivers enough distinct items to satisfy every other check
 * here, and the missing tail goes unreported.
 *
 * @param {string|null} failedUrl - The URL that did not answer 200, or null.
 * @param {number|null} failedStatus - The status it answered with, or null.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if every page answered, false otherwise.
 */
function CheckEveryPageLoaded(failedUrl, failedStatus, operation) {
    const success = check(failedUrl, {
        [`CheckEveryPageLoaded - ${operation} answers every page of the walk`]: (url) =>
            url === null,
    });

    if (!success) {
        console.error(`CheckEveryPageLoaded - ${operation} stopped on ${failedStatus} from: ${failedUrl}`);
    }

    return success;
}

export const PaginationDomainChecks = {
    CheckPaginatedShape,
    CheckPaginatedNotEmpty,
    CheckMultiplePages,
    CheckEveryPageLoaded,
    CheckNextLinksDoNotRepeat,
    CheckPagesHoldDistinctItems,
    CheckItemsBelongToSystem,
    CheckNextLink,
    CheckNoNextLink,
};
