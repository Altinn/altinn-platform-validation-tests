import { check } from "k6";

import { AltinnValidationProblem, ResourceChangePaginated } from "../../../clients/resource-registry/types.js";

/**
 * Checks that every entry in the feed names a resource and when it changed.
 *
 * Those two fields are the whole entry, and a consumer of the feed needs both:
 * the identifier to know what changed and the timestamp to know how far it has
 * come.
 *
 * @param {ResourceChangePaginated|null} changes - The page returned by the API.
 * @param {string} operation - Name of the operation, used in the logs.
 * @returns {boolean} True if the page holds entries and all of them are complete, false otherwise.
 */
function CheckChangesIdentified(changes, operation) {
    const entries = changes?.data ?? [];
    const incomplete = entries.filter(
        (entry) => !entry?.resourceId || Number.isNaN(Date.parse(`${entry?.changedAt}`)),
    );

    const success = check(changes, {
        "CheckChangesIdentified - Every change names a resource and when it changed": () =>
            entries.length > 0 && incomplete.length === 0,
    });

    if (!success) {
        console.error(`CheckChangesIdentified - ${operation} returned ${entries.length} change(s), ${incomplete.length} of them incomplete`);
        console.error(`CheckChangesIdentified - incomplete changes: ${JSON.stringify(incomplete.slice(0, 5))}`);
    }

    return success;
}

/**
 * Checks that a page holds the number of entries the limit asked for.
 *
 * The feed only hands out a next link when it has more than the limit, so a full
 * page is also what makes the next link meaningful.
 *
 * @param {ResourceChangePaginated|null} changes - The page returned by the API.
 * @param {number} expectedCount - The limit the page was asked for.
 * @param {string} operation - Name of the operation, used in the logs.
 * @returns {boolean} True if the page holds exactly that many entries, false otherwise.
 */
function CheckPageHoldsLimit(changes, expectedCount, operation) {
    const entries = changes?.data ?? [];

    const success = check(changes, {
        "CheckPageHoldsLimit - The page holds the number of changes the limit asked for": () =>
            entries.length === expectedCount,
    });

    if (!success) {
        console.error(`CheckPageHoldsLimit - ${operation} returned ${entries.length} change(s), expected ${expectedCount}`);
    }

    return success;
}

/**
 * Checks that a resource never turns up twice across the pages that were read.
 *
 * Each resource appears in the feed at most once, at the position of its latest
 * change, so a repeat means either the feed duplicated an entry or the
 * continuation token sent the walk back over ground it had already covered. A
 * page count cannot tell those apart from healthy paging, and this can.
 *
 * @param {Array<ResourceChangePaginated|null>} pages - The pages that were read, in order.
 * @param {string} operation - Name of the operation, used in the logs.
 * @returns {boolean} True if no resource appears more than once, false otherwise.
 */
function CheckResourcesAppearOnce(pages, operation) {
    const identifiers = pages.flatMap((page) => (page?.data ?? []).map((entry) => entry?.resourceId));
    const seen = new Set();
    const repeated = new Set();

    for (const identifier of identifiers) {
        if (seen.has(identifier)) {
            repeated.add(identifier);
        }

        seen.add(identifier);
    }

    const success = check(pages, {
        "CheckResourcesAppearOnce - No resource appears twice across the pages": () =>
            identifiers.length > 0 && repeated.size === 0,
    });

    if (!success) {
        console.error(`CheckResourcesAppearOnce - ${operation} handed out ${identifiers.length} change(s) across ${pages.length} page(s), ${repeated.size} resource(s) more than once`);
        console.error(`CheckResourcesAppearOnce - repeated resources: ${JSON.stringify([...repeated].slice(0, 10))}`);
    }

    return success;
}

/**
 * Checks that a refused request said which part of the request it refused.
 *
 * A 400 on its own does not say the validation did what it was meant to. The
 * path is what tells a caller where to look, and it is also what separates the
 * limit being rejected from something else going wrong.
 *
 * @param {AltinnValidationProblem|null} problem - The problem body, as the building block parsed it.
 * @param {string} expectedPath - The request path the problem is expected to name, such as "/$QUERY/limit".
 * @param {string} operation - Name of the operation, used in the logs.
 * @returns {boolean} True if a validation error names the path, false otherwise.
 */
function CheckValidationErrorForPath(problem, expectedPath, operation) {
    const errors = problem?.validationErrors ?? [];
    const paths = errors.flatMap((error) => error?.paths ?? []);

    const success = check(problem, {
        "CheckValidationErrorForPath - The problem names the expected request path": () =>
            paths.includes(expectedPath),
    });

    if (!success) {
        console.error(`CheckValidationErrorForPath - ${operation} named ${JSON.stringify(paths)}, expected it to include '${expectedPath}'`);
        console.error(`CheckValidationErrorForPath - problem body: ${JSON.stringify(problem)}`);
    }

    return success;
}

export const ResourceChangesDomainChecks = {
    CheckChangesIdentified,
    CheckPageHoldsLimit,
    CheckResourcesAppearOnce,
    CheckValidationErrorForPath,
};
