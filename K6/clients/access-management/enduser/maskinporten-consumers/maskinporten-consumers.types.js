/**
 * @typedef {0|1|2|4|8|16} AccessReasonFlag
 */

/**
 * @typedef {Object} AccessReasonRecord
 * @property {string|null} name
 * @property {string|null} description
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
 * @typedef {Object} AccessPackageDto
 * @property {string} id UUID.
 * @property {string} urn
 * @property {string} areaId UUID.
 */

/**
 * @typedef {Object} ConnectionInstanceDto
 * @property {string|null} resourceRefId
 * @property {string|null} instanceId
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
 * @typedef {Object} AccessReason
 * @property {AccessReasonFlag} flag
 * @property {Array<AccessReasonRecord>|null} items
 */

// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for retrieving or deleting Maskinporten consumers.
 *
 * Use {@link MaskinportenConsumersQueryBuilder} to construct this object.
 *
 * @typedef {Object} MaskinportenConsumersQuery
 * @property {string} party Party UUID.
 * @property {string|null} [consumer]
 * @property {boolean|null} [cascade]
 */

/**
 * Query parameters for retrieving or deleting Maskinporten consumer resources.
 *
 * Use {@link MaskinportenConsumerResourcesQueryBuilder} to construct this object.
 *
 * @typedef {Object} MaskinportenConsumerResourcesQuery
 * @property {string} party Party UUID.
 * @property {string|null} [consumer]
 * @property {string|null} [resource]
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
 * @typedef {Object} PermissionDto
 * @property {CompactEntityDto} from
 * @property {CompactEntityDto} to
 * @property {CompactEntityDto} via
 * @property {CompactRoleDto} role
 * @property {CompactRoleDto} viaRole
 * @property {AccessReason} reason
 */

/**
 * @typedef {Object} ResourcePermissionDto
 * @property {ResourceDto} resource
 * @property {Array<PermissionDto>|null} permissions
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
