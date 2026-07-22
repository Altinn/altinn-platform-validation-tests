/**
 * Represents a request to update an existing SystemUser.
 *
 * @typedef {Object} SystemUserUpdateDto
 * @property {string|null} id SystemUser identifier.
 * @property {string|null} partyId Party identifier.
 * @property {string|null} reporteeOrgNo Reportee organisation number.
 * @property {string|null} integrationTitle Integration title.
 * @property {string|null} systemId System identifier.
 */

/**
 * Represents a SystemUser integration.
 *
 * @typedef {Object} SystemUser
 * @property {string|null} id SystemUser identifier.
 * @property {string|null} integrationTitle Integration title.
 * @property {string|null} systemId External system identifier.
 * @property {string|null} productName Product name.
 * @property {string|null} systemInternalId Internal system UUID.
 * @property {string|null} partyId Party identifier.
 * @property {string|null} partyUuId Party UUID.
 * @property {string|null} reporteeOrgNo Reportee organisation number.
 * @property {string} created Creation timestamp.
 * @property {boolean} isDeleted Whether the SystemUser is deleted.
 * @property {string|null} supplierName Supplier name.
 * @property {string|null} supplierOrgno Supplier organisation number.
 * @property {string|null} externalRef External reference.
 * @property {AccessPackage[]|null} accessPackages Assigned access packages.
 * @property {SystemUserType|null} userType System user type.
 */

/**
 * Represents a paginated list of SystemUsers.
 *
 * @typedef {Object} SystemUserPaginated
 * @property {SystemUser[]|null} data SystemUser items.
 * @property {PaginatedLinks|null} links Pagination links.
 */

/**
 * Represents a paginated stream of SystemUser register items.
 *
 * @typedef {Object} SystemUserRegisterDTOItemStream
 * @property {SystemUserRegisterDTO[]|null} data Register items.
 * @property {PaginatedLinks|null} links Pagination links.
 * @property {ItemStreamStats|null} stats Stream statistics.
 */

/**
 * Represents an opaque int64 pagination token.
 *
 * @typedef {Object} Int64Opaque
 * @property {number} value Inner integer value.
 */

/**
 * Represents an access package assigned to a SystemUser.
 *
 * @typedef {Object} AccessPackage
 * @property {string|null} id Access package identifier.
 * @property {string|null} name Access package name.
 */

/**
 * Represents the type of a SystemUser.
 *
 * @typedef {Object} SystemUserType
 * @property {string|null} name System user type name.
 */

/**
 * Represents pagination links.
 *
 * @typedef {Object} PaginatedLinks
 * @property {*} next Next page link.
 * @property {*} previous Previous page link.
 */

/**
 * Represents statistics for an item stream.
 *
 * @typedef {Object} ItemStreamStats
 * @property {number|null} count Number of items.
 */

/**
 * Represents a SystemUser register DTO item.
 *
 * @typedef {Object} SystemUserRegisterDTO
 * @property {string|null} id SystemUser identifier.
 * @property {string|null} partyId Party identifier.
 * @property {string|null} reporteeOrgNo Reportee organisation number.
 * @property {string|null} systemId System identifier.
 */
