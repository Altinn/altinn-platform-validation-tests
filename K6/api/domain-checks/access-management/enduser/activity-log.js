import { check } from "k6";

import { ActivityLogArea, ActivityLogDirection, ActivityLogDto, ActivityLogDtoPaginatedResult, ActivityLogFilterFieldsByArea, ActivityLogFilterValueDtoPaginatedResult, ActivityTypeDto } from "../../../../clients/access-management/enduser/activity-log/activity-log.types.js";

const TYPES = ["Assignment", "Delegation", "Request"];
const SUBTYPES = ["Package", "Resource", "Instance"];
const TRIGGERS = ["Created", "Updated", "Deleted"];

/**
 * Checks that every entry belongs to the party on the side the direction asks
 * for: `To` lists what went to the party, `From` what came from it. A log that
 * ignores `direction`, or leaks another party's entries, fails here.
 *
 * @param {ActivityLogDtoPaginatedResult|null} log - The page of the activity log.
 * @param {string} party - Party UUID the log was read for.
 * @param {ActivityLogDirection} direction - The direction the log was read in.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if every entry matches, false otherwise.
 */
function CheckEntriesMatchDirection(log, party, direction, operation) {
    const side = direction === "To" ? "toId" : "fromId";
    const mismatches = (log?.data ?? []).filter((entry) => entry?.[side] !== party);

    const success = check(log, {
        [`CheckEntriesMatchDirection - ${operation} only lists entries with ${side} = party`]: () =>
            mismatches.length === 0,
    });

    if (!success) {
        console.error(`CheckEntriesMatchDirection - ${operation} expected ${side} ${party}, got: ${JSON.stringify(mismatches.slice(0, 3))}`);
    }

    return success;
}

/**
 * Checks that every entry has an id and a time, and that its type, subtype and
 * trigger are values the Swagger lists.
 *
 * @param {ActivityLogDtoPaginatedResult|null} log - The page of the activity log.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if every entry is valid, false otherwise.
 */
function CheckEntriesValid(log, operation) {
    const invalid = (log?.data ?? []).filter((entry) =>
        !entry?.id ||
        !entry.when ||
        !TYPES.includes(entry.type) ||
        !TRIGGERS.includes(entry.trigger) ||
        (entry.subtype !== null && !SUBTYPES.includes(entry.subtype)));

    const success = check(log, {
        [`CheckEntriesValid - ${operation} entries have id, when and valid type, subtype and trigger`]: () =>
            invalid.length === 0,
    });

    if (!success) {
        console.error(`CheckEntriesValid - ${operation} invalid entries: ${JSON.stringify(invalid.slice(0, 3))}`);
    }

    return success;
}

/**
 * Checks that every filter value has an id to filter on.
 *
 * @param {ActivityLogFilterValueDtoPaginatedResult|null} values - The filter values.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if every value has an id, false otherwise.
 */
function CheckFilterValuesHaveIds(values, operation) {
    const withoutId = (values?.data ?? []).filter((value) => !value?.id);

    const success = check(values, {
        [`CheckFilterValuesHaveIds - ${operation} values have an id`]: () =>
            withoutId.length === 0,
    });

    if (!success) {
        console.error(`CheckFilterValuesHaveIds - ${operation} values without id: ${JSON.stringify(withoutId.slice(0, 3))}`);
    }

    return success;
}

/**
 * Checks that an area offers exactly the filter fields it is expected to.
 *
 * @param {Array<string>|null} fields - The fields from `filter/fields`.
 * @param {ActivityLogArea} area - The area they were read for.
 * @returns {boolean} True if the fields are the expected ones, false otherwise.
 */
function CheckFilterFields(fields, area) {
    const expected = [...ActivityLogFilterFieldsByArea[area]].sort();
    const actual = [...(fields ?? [])].sort();

    const success = check(fields, {
        [`CheckFilterFields - ${area} offers the expected filter fields`]: () =>
            JSON.stringify(actual) === JSON.stringify(expected),
    });

    if (!success) {
        console.error(`CheckFilterFields - ${area} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }

    return success;
}

/**
 * Checks that an area lists activity types, each with an id and a valid type.
 *
 * @param {Array<ActivityTypeDto>|null} types - The types from `types`.
 * @param {ActivityLogArea} area - The area they were read for.
 * @returns {boolean} True if the types are listed and valid, false otherwise.
 */
function CheckActivityTypes(types, area) {
    const invalid = (types ?? []).filter((type) => !type?.id || !TYPES.includes(type.type));

    const success = check(types, {
        [`CheckActivityTypes - ${area} lists activity types with id and valid type`]: () =>
            Array.isArray(types) && types.length > 0 && invalid.length === 0,
    });

    if (!success) {
        console.error(`CheckActivityTypes - ${area} got: ${JSON.stringify(types)}`);
    }

    return success;
}

/**
 * Checks that every entry is of one of the activity types the log was filtered
 * on with `typeId`. A type without a status matches its entries in any status:
 * "Forespørsel om tilgangspakke oppdatert" covers approved, rejected and
 * withdrawn alike.
 *
 * @param {ActivityLogDtoPaginatedResult|null} log - The page of the activity log.
 * @param {Array<ActivityTypeDto>} types - The types the log was filtered on.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if every entry is of one of the types, false otherwise.
 */
function CheckEntriesMatchTypes(log, types, operation) {
    /**
     * @param {ActivityLogDto} entry The entry to check.
     * @param {ActivityTypeDto} type The type to check it against.
     * @returns {boolean} True if the entry is of the type.
     */
    const matches = (entry, type) =>
        entry.type === type.type &&
        entry.subtype === type.subtype &&
        entry.trigger === type.trigger &&
        (type.status === null || entry.status === type.status);
    const others = (log?.data ?? []).filter((entry) => !types.some((type) => matches(entry, type)));

    const success = check(log, {
        [`CheckEntriesMatchTypes - ${operation} only lists entries of the filtered types`]: () =>
            others.length === 0,
    });

    if (!success) {
        console.error(`CheckEntriesMatchTypes - ${operation} expected ${JSON.stringify(types.map((type) => type.name))}, got: ${JSON.stringify(others.slice(0, 3))}`);
    }

    return success;
}

/**
 * Checks that every entry happened inside the window the log was filtered on,
 * from `after` (inclusive) to `before` (exclusive).
 *
 * @param {ActivityLogDtoPaginatedResult|null} log - The page of the activity log.
 * @param {string} after - Start of the window, ISO date-time.
 * @param {string} before - End of the window, ISO date-time.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if every entry is inside the window, false otherwise.
 */
function CheckEntriesWithinWindow(log, after, before, operation) {
    const from = Date.parse(after);
    const to = Date.parse(before);
    const outside = (log?.data ?? []).filter((entry) => {
        const when = Date.parse(entry?.when);
        return !(when >= from && when < to);
    });

    const success = check(log, {
        [`CheckEntriesWithinWindow - ${operation} only lists entries between after and before`]: () =>
            outside.length === 0,
    });

    if (!success) {
        console.error(`CheckEntriesWithinWindow - ${operation} expected ${after} - ${before}, got: ${JSON.stringify(outside.slice(0, 3).map((entry) => entry?.when))}`);
    }

    return success;
}

/**
 * Checks that every filter value a `term` search returned has the term in its
 * name, ignoring case, and that the value the term was taken from is among them.
 *
 * @param {ActivityLogFilterValueDtoPaginatedResult|null} values - The filter values the search returned.
 * @param {string} term - The term searched for.
 * @param {string} expectedId - Id of the value the term was taken from.
 * @param {string} operation - Name of the call being checked, used in the check name.
 * @returns {boolean} True if the search returned what it should, false otherwise.
 */
function CheckFilterValuesMatchTerm(values, term, expectedId, operation) {
    const data = values?.data ?? [];
    const withoutTerm = data.filter((value) => !(value?.name ?? "").toLowerCase().includes(term.toLowerCase()));

    const success = check(values, {
        [`CheckFilterValuesMatchTerm - ${operation} only lists values containing the term`]: () =>
            withoutTerm.length === 0,
        [`CheckFilterValuesMatchTerm - ${operation} lists the value the term was taken from`]: () =>
            data.some((value) => value?.id === expectedId),
    });

    if (!success) {
        console.error(`CheckFilterValuesMatchTerm - ${operation} term "${term}", expected id ${expectedId}, got: ${JSON.stringify(data.slice(0, 5))}`);
    }

    return success;
}

export const ActivityLogDomainChecks = {
    CheckActivityTypes,
    CheckEntriesMatchDirection,
    CheckEntriesMatchTypes,
    CheckEntriesValid,
    CheckEntriesWithinWindow,
    CheckFilterFields,
    CheckFilterValuesHaveIds,
    CheckFilterValuesMatchTerm,
};
