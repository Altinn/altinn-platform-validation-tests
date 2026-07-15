/**
 * @typedef {Object} PaginatedResultLinks
 * @property {string|null} next
 */

/**
 * @typedef {Object} ProviderTypeDto
 * @property {string} id UUID.
 * @property {string|null} name
 */

/**
 * @typedef {Object} ResourceTypeDto
 * @property {string} id UUID.
 * @property {string|null} name
 */

/**
 * @typedef {Object} ProviderDto
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} refId
 * @property {string|null} logoUrl
 * @property {string|null} code
 * @property {string} typeId UUID.
 * @property {ProviderTypeDto} type
 */

/**
 * @typedef {Object} ResourceDto
 * @property {string} id UUID.
 * @property {string} providerId UUID.
 * @property {string} typeId UUID.
 * @property {string|null} name
 * @property {string|null} description
 * @property {string|null} refId
 * @property {ProviderDto} provider
 * @property {ResourceTypeDto} type
 */

/**
 * @typedef {Object} AccessPackageDto
 * @property {string} id UUID.
 * @property {string|null} urn
 * @property {string} areaId UUID.
 */

/**
 * @typedef {Object} ConnectionInstanceDto
 * @property {string|null} resourceRefId
 * @property {string|null} instanceId
 */

/**
 * @typedef {Object} CompactRoleDto
 * @property {string} id UUID.
 * @property {string|null} code
 * @property {string|null} urn
 * @property {string|null} legacyurn
 * @property {Array<CompactRoleDto>|null} children
 */

/**
 * @typedef {Object} CompactEntityDto
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} type
 * @property {string|null} variant
 * @property {CompactEntityDto|null} parent
 * @property {Array<CompactEntityDto>|null} children
 * @property {number|null} partyid
 * @property {number|null} userId
 * @property {string|null} username
 * @property {string|null} organizationIdentifier
 * @property {string|null} personIdentifier
 * @property {string|null} dateOfBirth ISO date.
 * @property {string|null} dateOfDeath ISO date.
 * @property {boolean} isDeleted
 * @property {string|null} deletedAt ISO date-time.
 */

/**
 * @typedef {Object} ConnectionDto
 * @property {CompactEntityDto} party
 * @property {Array<CompactRoleDto>|null} roles
 * @property {Array<AccessPackageDto>|null} packages
 * @property {Array<ResourceDto>|null} resources
 * @property {Array<ConnectionInstanceDto>|null} instances
 * @property {Array<ConnectionDto>|null} connections
 */

/**
 * @typedef {Object} ConnectionDtoPaginatedResult
 * @property {Array<ConnectionDto>|null} data
 * @property {PaginatedResultLinks} links
 */

/**
 * @typedef {Object} AssignmentDto
 * @property {string} id UUID.
 * @property {string} roleId UUID.
 * @property {string} fromId UUID.
 * @property {string} toId UUID.
 */

/**
 * @typedef {Object} PersonInput
 * @property {string|null} personIdentifier Person identifier. Either 11-digit national identity number or username.
 * @property {string|null} lastName Lastname.
 */

// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for retrieving connections.
 *
 * Use {@link GetConnectionsQueryBuilder} to construct this object.
 *
 * @typedef {Object} GetConnectionsQuery
 * @property {string} party Party UUID.
 * @property {string|null} [from] From UUID.
 * @property {string|null} [to] To UUID.
 * @property {boolean|null} [includeClientDelegations]
 * @property {boolean|null} [includeAgentConnections]
 * @property {boolean|null} [includeAccessPackages]
 * @property {boolean|null} [includeResources]
 * @property {boolean|null} [includeInstances]
 */

/**
 * Query parameters for creating a connection.
 *
 * Use {@link CreateConnectionQueryBuilder} to construct this object.
 *
 * @typedef {Object} CreateConnectionQuery
 * @property {string} party Party UUID.
 * @property {string|null} [to] To UUID.
 */

/**
 * Query parameters for deleting a connection.
 *
 * Use {@link DeleteConnectionQueryBuilder} to construct this object.
 *
 * @typedef {Object} DeleteConnectionQuery
 * @property {string} party Party UUID.
 * @property {string} from From UUID.
 * @property {string} to To UUID.
 * @property {boolean|null} [cascade]
 */

/**
 * @typedef {Object} SimplifiedPartyDto
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} type
 * @property {string|null} variant
 * @property {string|null} organizationIdentifier
 * @property {boolean} isDeleted
 * @property {string|null} deletedAt ISO date-time.
 */

/**
 * @typedef {Object} SimplifiedConnectionDto
 * @property {SimplifiedPartyDto} party
 * @property {Array<SimplifiedConnectionDto>|null} connections
 */

/**
 * @typedef {Object} SimplifiedConnectionDtoPaginatedResult
 * @property {Array<SimplifiedConnectionDto>|null} data
 * @property {PaginatedResultLinks} links
 */

// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for retrieving connection users.
 *
 * Use {@link GetConnectionUsersQueryBuilder} to construct this object.
 *
 * @typedef {Object} GetConnectionUsersQuery
 * @property {string} party Party UUID.
 */


/**
 * @typedef {Object} CompactPackageDto
 * @property {string} id UUID.
 * @property {string|null} urn
 * @property {string} areaId UUID.
 */

/**
 * @typedef {Object} PermissionDto
 * @property {CompactEntityDto} from
 * @property {CompactEntityDto} to
 * @property {CompactEntityDto} via
 * @property {CompactRoleDto} role
 * @property {CompactRoleDto} viaRole
 * @property {AccessReason} reason
 */

/**
 * @typedef {Object} PackagePermissionDto
 * @property {CompactPackageDto} package
 * @property {Array<PermissionDto>|null} permissions
 */

/**
 * @typedef {Object} PackagePermissionDtoPaginatedResult
 * @property {Array<PackagePermissionDto>|null} data
 * @property {PaginatedResultLinks} links
 */

/**
 * @typedef {Object} AssignmentPackageDto
 * @property {string} id UUID.
 * @property {string} assignmentId UUID.
 * @property {string} packageId UUID.
 */

// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for retrieving access package permissions.
 *
 * Use {@link GetAccessPackagesQueryBuilder} to construct this object.
 *
 * @typedef {Object} GetAccessPackagesQuery
 * @property {string} party Party UUID.
 * @property {string|null} [from]
 * @property {string|null} [to]
 */

/**
 * Query parameters for creating an access package assignment.
 *
 * Use {@link CreateAccessPackageQueryBuilder} to construct this object.
 *
 * @typedef {Object} CreateAccessPackageQuery
 * @property {string} party Party UUID.
 * @property {string|null} [to]
 * @property {string|null} [packageId]
 * @property {string|null} [package]
 */

/**
 * Query parameters for deleting an access package assignment.
 *
 * Use {@link DeleteAccessPackageQueryBuilder} to construct this object.
 *
 * @typedef {Object} DeleteAccessPackageQuery
 * @property {string} party Party UUID.
 * @property {string} from From party UUID.
 * @property {string} to To party UUID.
 * @property {string|null} [packageId]
 * @property {string|null} [package]
 */
