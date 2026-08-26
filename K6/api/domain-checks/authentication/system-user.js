import { check } from "k6";

import { SystemUser } from "../../../clients/authentication/types.js";

/**
 * Checks that a lookup found the expected system user.
 *
 * @param {SystemUser|null} systemUser - The system user the lookup returned.
 * @param {{id: string, systemId: string}} expected - The system user the lookup was made for.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the lookup found that system user, false otherwise.
 */
function CheckSystemUserFound(systemUser, expected, operation) {
    const success = check(systemUser, {
        [`CheckSystemUserFound - ${operation} found the expected system user`]: (found) =>
            found !== null &&
            found?.id === expected.id &&
            found?.systemId === expected.systemId,
    });

    if (!success) {
        console.error(`CheckSystemUserFound - ${operation} expected: ${JSON.stringify(expected)}`);
        console.error(`CheckSystemUserFound - ${operation} returned: ${JSON.stringify(systemUser)}`);
    }

    return success;
}

/**
 * Checks that the setup produced a system user to act on.
 *
 * The arrange stops at the step that broke rather than failing the run, so this is
 * where an arrange that got nowhere surfaces. A caller that gets false back should
 * fail(): failing here rather than in the setup is what lets the teardown remove
 * what the arrange did manage to create.
 *
 * @param {string|undefined} systemUserId - The system user the setup should have produced.
 * @returns {boolean} True if there is a system user to act on, false otherwise.
 */
function CheckSystemUserArranged(systemUserId) {
    const success = check(systemUserId, {
        "CheckSystemUserArranged - The setup produced a system user": (id) =>
            id !== null && id !== undefined,
    });

    if (!success) {
        console.error(`CheckSystemUserArranged - expected a system user from the setup, got ${JSON.stringify(systemUserId)}`);
    }

    return success;
}

/**
 * Checks that a page of a stream reports where in the stream it sits.
 *
 * A stream is read with a continuation token rather than a page number, so the stats
 * are what tells a caller how far it has come and how much is left.
 *
 * Every check below needs all three numbers, so they are read once and the rest
 * short circuit on that. Otherwise a missing number would fall back to something
 * the comparisons happen to accept, and stats that plainly do not describe the page
 * would come back green.
 *
 * @param {{stats?: {pageStart?: number, pageEnd?: number, sequenceMax?: number}|null, data?: unknown[]|null}|null} page - A page of the stream.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the stats describe the page, false otherwise.
 */
function CheckStreamStats(page, operation) {
    const stats = page?.stats;
    const items = page?.data ?? [];

    const described = typeof stats?.pageStart === "number" &&
        typeof stats?.pageEnd === "number" &&
        typeof stats?.sequenceMax === "number";

    const success = check(page, {
        [`CheckStreamStats - ${operation} reports where in the stream the page sits`]: () =>
            described,
        [`CheckStreamStats - ${operation} ends the page no earlier than it starts`]: () =>
            described && stats.pageEnd >= stats.pageStart,
        [`CheckStreamStats - ${operation} holds at least what the page does`]: () =>
            described && stats.sequenceMax >= stats.pageEnd,
        [`CheckStreamStats - ${operation} puts no more items on the page than the stats say`]: () =>
            described && items.length <= stats.pageEnd - stats.pageStart + 1,
    });

    if (!success) {
        console.error(`CheckStreamStats - ${operation} stats: ${JSON.stringify(stats)}, items on the page: ${items.length}`);
    }

    return success;
}

/**
 * Checks that a stream says whether there is more of it to read.
 *
 * Which way this goes is up to the data and not to the endpoint: a stream that has
 * been read to the end has nowhere to point, while one that has not has to hand out
 * a link. Reading it off the stats rather than off the environment is what keeps the
 * check from failing on a small or freshly reset environment.
 *
 * @param {{stats?: {pageEnd?: number, sequenceMax?: number}|null, links?: {next?: string|null}|null}|null} page - A page of the stream.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if there is more of the stream to read, false otherwise.
 */
function CheckStreamHasMore(page, operation) {
    const stats = page?.stats;
    const behind = typeof stats?.pageEnd === "number" &&
        typeof stats?.sequenceMax === "number" &&
        stats.pageEnd < stats.sequenceMax;

    const next = page?.links?.next;

    check(page, {
        [`CheckStreamHasMore - ${operation} hands out a next link when the stream holds more`]: () =>
            !behind || (typeof next === "string" && next.length > 0),
        [`CheckStreamHasMore - ${operation} hands out no next link once the stream is read`]: () =>
            behind || next === null || next === undefined || next === "",
    });

    if (!behind) {
        console.log(`CheckStreamHasMore - ${operation} reached the end of the stream on the first page: ${JSON.stringify(stats)}`);
    }

    return behind;
}

export const SystemUserDomainChecks = {
    CheckStreamHasMore,
    CheckStreamStats,
    CheckSystemUserArranged,
    CheckSystemUserFound,
};
