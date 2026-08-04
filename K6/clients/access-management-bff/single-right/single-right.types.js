// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for {@link GetSingleRightDelegationCheck}.
 *
 * Use {@link GetSingleRightDelegationCheckQueryBuilder} to construct this
 * object.
 *
 * @typedef {object} GetSingleRightDelegationCheckQuery
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [resource] Resource identifier.
 */

/**
 * Query parameters for {@link GetRightsMeta}.
 *
 * Use {@link GetRightsMetaQueryBuilder} to construct this object.
 *
 * @typedef {object} GetRightsMetaQuery
 * @property {string} [resource] Resource identifier.
 */

/**
 * Query parameters for {@link DelegateSingleRights}.
 *
 * Use {@link DelegateSingleRightsQueryBuilder} to construct this object.
 *
 * @typedef {object} DelegateSingleRightsQuery
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [resourceId] Resource identifier.
 */

/**
 * Query parameters for {@link GetResourceDelegations}.
 *
 * Use {@link GetResourceDelegationsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetResourceDelegationsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 */

/**
 * Query parameters for {@link GetResourceRights}.
 *
 * Use {@link GetResourceRightsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetResourceRightsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 * @property {string} [resourceId] Resource identifier.
 */

/**
 * Query parameters for {@link RevokeSingleRights}.
 *
 * Use {@link RevokeSingleRightsQueryBuilder} to construct this object.
 *
 * @typedef {object} RevokeSingleRightsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 * @property {string} [resourceId] Resource identifier.
 */

/**
 * Query parameters for {@link UpdateSingleRights}.
 *
 * Use {@link UpdateSingleRightsQueryBuilder} to construct this object.
 *
 * @typedef {object} UpdateSingleRightsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 * @property {string} [resourceId] Resource identifier.
 */
