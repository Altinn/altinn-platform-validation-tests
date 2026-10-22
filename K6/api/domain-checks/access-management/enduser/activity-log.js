import { check } from "k6";

import { ActivityLogArea, ActivityLogDirection, ActivityLogDtoPaginatedResult, ActivityLogFilterFieldsByArea, ActivityLogFilterValueDtoPaginatedResult, ActivityTypeDto } from "../../../../clients/access-management/enduser/activity-log/activity-log.types.js";

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

export const ActivityLogDomainChecks = {
    CheckActivityTypes,
    CheckEntriesMatchDirection,
    CheckEntriesValid,
    CheckFilterFields,
    CheckFilterValuesHaveIds,
};
