// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for {@link GetIsBankruptcyEstateAdmin}.
 *
 * Use {@link GetIsBankruptcyEstateAdminQueryBuilder} to construct this object.
 *
 * @typedef {object} GetIsBankruptcyEstateAdminQuery
 * @property {string} [party] Party UUID of the bankruptcy estate.
 */

/**
 * Query parameters for {@link GetAdministrators}.
 *
 * Use {@link GetAdministratorsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetAdministratorsQuery
 * @property {string} [party] Party UUID of the bankruptcy estate.
 */

/**
 * Query parameters for {@link CreateAdministrator}.
 *
 * Use {@link CreateAdministratorQueryBuilder} to construct this object.
 *
 * @typedef {object} CreateAdministratorQuery
 * @property {string} [party] Party UUID of the bankruptcy estate.
 */

/**
 * Query parameters for {@link DeleteAdministrator}.
 *
 * Use {@link DeleteAdministratorQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteAdministratorQuery
 * @property {string} [party] Party UUID of the bankruptcy estate.
 * @property {string} [user] User UUID of the administrator to remove.
 */

export const CreateAdministratorQuery = undefined;
export const DeleteAdministratorQuery = undefined;
export const GetAdministratorsQuery = undefined;
export const GetIsBankruptcyEstateAdminQuery = undefined;
