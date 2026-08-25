// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for {@link SearchAccessPackages}.
 *
 * Use {@link SearchAccessPackagesQueryBuilder} to construct this object.
 *
 * @typedef {object} SearchAccessPackagesQuery
 * @property {string} [searchString] Free text search string.
 * @property {string} [typeName] Entity type name to search packages for.
 */

/**
 * Query parameters for {@link GetAccessPackageDelegations}.
 *
 * Use {@link GetAccessPackageDelegationsQueryBuilder} to construct this
 * object.
 *
 * @typedef {object} GetAccessPackageDelegationsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 */

/**
 * Query parameters for {@link CreateAccessPackageDelegation}.
 *
 * Use {@link CreateAccessPackageDelegationQueryBuilder} to construct this
 * object.
 *
 * @typedef {object} CreateAccessPackageDelegationQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [to] Party UUID the access is given to.
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [packageId] Access package identifier or URN.
 */

/**
 * Query parameters for {@link DeleteAccessPackageDelegation}.
 *
 * Use {@link DeleteAccessPackageDelegationQueryBuilder} to construct this
 * object.
 *
 * @typedef {object} DeleteAccessPackageDelegationQuery
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [packageId] Access package identifier or URN.
 */

/**
 * Query parameters for {@link GetAccessPackagePermission}.
 *
 * Use {@link GetAccessPackagePermissionQueryBuilder} to construct this object.
 *
 * @typedef {object} GetAccessPackagePermissionQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {string} [to] Party UUID the access is given to.
 */

/**
 * Query parameters for {@link GetAccessPackageDelegationCheck}.
 *
 * Use {@link GetAccessPackageDelegationCheckQueryBuilder} to construct this
 * object.
 *
 * @typedef {object} GetAccessPackageDelegationCheckQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 */

export const CreateAccessPackageDelegationQuery = undefined;
export const DeleteAccessPackageDelegationQuery = undefined;
export const GetAccessPackageDelegationCheckQuery = undefined;
export const GetAccessPackageDelegationsQuery = undefined;
export const GetAccessPackagePermissionQuery = undefined;
export const SearchAccessPackagesQuery = undefined;
