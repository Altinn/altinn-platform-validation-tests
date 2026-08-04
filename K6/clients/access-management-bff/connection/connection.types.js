// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for {@link DeleteReporteeConnection}.
 *
 * Use {@link DeleteReporteeConnectionQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteReporteeConnectionQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 */

/**
 * Query parameters for {@link CreateRightHolder}.
 *
 * Use {@link CreateRightHolderQueryBuilder} to construct this object.
 *
 * @typedef {object} CreateRightHolderQuery
 * @property {string} [rightholderPartyUuid] Party UUID of the person to add as
 * right holder.
 */

/**
 * Query parameters for {@link GetRightHolders}.
 *
 * Use {@link GetRightHoldersQueryBuilder} to construct this object.
 *
 * @typedef {object} GetRightHoldersQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 * @property {boolean} [includeClientDelegations] Whether to include client
 * delegations.
 * @property {boolean} [includeAgentConnections] Whether to include agent
 * connections.
 */

/**
 * Query parameters for {@link GetSimplifiedConnections}.
 *
 * Use {@link GetSimplifiedConnectionsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetSimplifiedConnectionsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 */
