// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for {@link GetInstanceDelegations}.
 *
 * Use {@link GetInstanceDelegationsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetInstanceDelegationsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 * @property {string} [resource] Resource identifier.
 * @property {string} [instance] Instance identifier.
 */

/**
 * Query parameters for {@link DeleteInstanceDelegation}.
 *
 * Use {@link DeleteInstanceDelegationQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteInstanceDelegationQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 * @property {string} [resource] Resource identifier.
 * @property {string} [instance] Instance identifier.
 */

/**
 * Query parameters for {@link GetInstanceDelegationCheck}.
 *
 * Use {@link GetInstanceDelegationCheckQueryBuilder} to construct this object.
 *
 * @typedef {object} GetInstanceDelegationCheckQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [resource] Resource identifier.
 * @property {string} [instance] Instance identifier.
 */

/**
 * Query parameters for {@link CreateInstanceRights}.
 *
 * Use {@link CreateInstanceRightsQueryBuilder} to construct this object.
 *
 * @typedef {object} CreateInstanceRightsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [to] Party UUID the access is given to.
 * @property {string} [resource] Resource identifier.
 * @property {string} [instance] Instance identifier.
 */

/**
 * Query parameters for {@link GetInstanceRights}.
 *
 * Use {@link GetInstanceRightsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetInstanceRightsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 * @property {string} [resource] Resource identifier.
 * @property {string} [instance] Instance identifier.
 */

/**
 * Query parameters for {@link UpdateInstanceRights}.
 *
 * Use {@link UpdateInstanceRightsQueryBuilder} to construct this object.
 *
 * @typedef {object} UpdateInstanceRightsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [to] Party UUID the access is given to.
 * @property {string} [resource] Resource identifier.
 * @property {string} [instance] Instance identifier.
 */

/**
 * Query parameters for {@link GetInstanceSimplifiedUsers}.
 *
 * Use {@link GetInstanceSimplifiedUsersQueryBuilder} to construct this object.
 *
 * @typedef {object} GetInstanceSimplifiedUsersQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [resource] Resource identifier.
 * @property {string} [instance] Instance identifier.
 */

export const CreateInstanceRightsQuery = undefined;
export const DeleteInstanceDelegationQuery = undefined;
export const GetInstanceDelegationCheckQuery = undefined;
export const GetInstanceDelegationsQuery = undefined;
export const GetInstanceRightsQuery = undefined;
export const GetInstanceSimplifiedUsersQuery = undefined;
export const UpdateInstanceRightsQuery = undefined;
