// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for {@link GetActivityLog}.
 *
 * Use {@link GetActivityLogQueryBuilder} to construct this object.
 *
 * @typedef {object} GetActivityLogQuery
 * @property {string} Party Party UUID of the party the request is made on behalf of.
 * @property {string} Direction Direction of the activity, either "from" or "to".
 * @property {Array<string>} [From] Party UUIDs the access was given from.
 * @property {Array<string>} [To] Party UUIDs the access was given to.
 * @property {Array<string>} [Via] Party UUIDs the access was given via.
 * @property {Array<string>} [By] Party UUIDs of the actors that performed the activity.
 * @property {Array<string>} [TypeId] Activity type UUIDs to filter by.
 * @property {string} [After] Only include activity after this date-time (ISO 8601).
 * @property {string} [Before] Only include activity before this date-time (ISO 8601).
 * @property {number} [PageNo] Page number, starting at 0.
 * @property {number} [PageSize] Page size, from 1 to 1000.
 */

/**
 * Query parameters for {@link GetActivityLogFilterValues}.
 *
 * Use {@link GetActivityLogFilterValuesQueryBuilder} to construct this object.
 *
 * @typedef {object} GetActivityLogFilterValuesQuery
 * @property {string} [Term] Free text term to filter the values by.
 * @property {string} [OrderBy] Order of the values, either "Name" or "When".
 * @property {string} Party Party UUID of the party the request is made on behalf of.
 * @property {string} Direction Direction of the activity, either "from" or "to".
 * @property {Array<string>} [From] Party UUIDs the access was given from.
 * @property {Array<string>} [To] Party UUIDs the access was given to.
 * @property {Array<string>} [Via] Party UUIDs the access was given via.
 * @property {Array<string>} [By] Party UUIDs of the actors that performed the activity.
 * @property {Array<string>} [TypeId] Activity type UUIDs to filter by.
 * @property {string} [After] Only include activity after this date-time (ISO 8601).
 * @property {string} [Before] Only include activity before this date-time (ISO 8601).
 * @property {number} [PageNo] Page number, starting at 0.
 * @property {number} [PageSize] Page size, from 1 to 1000.
 */

export const GetActivityLogFilterValuesQuery = undefined;
export const GetActivityLogQuery = undefined;
