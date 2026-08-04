// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for {@link GetRolePermissions}.
 *
 * Use {@link GetRolePermissionsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetRolePermissionsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 */

/**
 * Query parameters for {@link GetRolePackages}.
 *
 * Use {@link GetRolePackagesQueryBuilder} to construct this object.
 *
 * @typedef {object} GetRolePackagesQuery
 * @property {string} [roleCode] Role code.
 * @property {string} [variant] Entity variant the role is held for.
 * @property {boolean} [includeResources] Whether to include the resources of
 * each package.
 */

/**
 * Query parameters for {@link DeleteRole}.
 *
 * Use {@link DeleteRoleQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteRoleQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 * @property {string} [rolecode] Role code.
 */

/**
 * Query parameters for {@link GetRoleResources}.
 *
 * Use {@link GetRoleResourcesQueryBuilder} to construct this object.
 *
 * @typedef {object} GetRoleResourcesQuery
 * @property {string} [roleCode] Role code.
 * @property {string} [variant] Entity variant the role is held for.
 * @property {boolean} [includePackageResources] Whether to include resources
 * granted through access packages.
 */
