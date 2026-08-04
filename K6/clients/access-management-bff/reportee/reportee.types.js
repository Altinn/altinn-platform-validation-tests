// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for {@link ChangeReporteeAndRedirect}.
 *
 * Use {@link ChangeReporteeAndRedirectQueryBuilder} to construct this object.
 *
 * @typedef {object} ChangeReporteeAndRedirectQuery
 * @property {string} [partyUuid] Party UUID of the new reportee.
 * @property {string} [P] Party UUID of the new reportee, legacy parameter.
 * @property {number} [partyId] Party id of the new reportee.
 * @property {string} [goTo] URL to redirect to after the change.
 */

/**
 * Query parameters for {@link ChangeReportee}.
 *
 * Use {@link ChangeReporteeQueryBuilder} to construct this object.
 *
 * @typedef {object} ChangeReporteeQuery
 * @property {string} [partyUuid] Party UUID of the new reportee.
 * @property {number} [partyId] Party id of the new reportee.
 */
