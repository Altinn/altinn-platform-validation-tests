/**
 * @typedef {0|1|2|4|8|16} AccessReasonFlag
 */

/**
 * @typedef {object} AccessReasonRecord
 * @property {string|null} name
 * @property {string|null} description
 */

/**
 * @typedef {object} ProviderTypeDto
 * @property {string} id UUID.
 * @property {string|null} name
 */

/**
 * @typedef {object} ResourceTypeDto
 * @property {string} id UUID.
 * @property {string|null} name
 */

/**
 * @typedef {object} AccessPackageDto
 * @property {string} id UUID.
 * @property {string} urn
 * @property {string} areaId UUID.
 */

/**
 * @typedef {object} ConnectionInstanceDto
 * @property {string|null} resourceRefId
 * @property {string|null} instanceId
 */

/**
 * @typedef {object} ProviderDto
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} refId
 * @property {string|null} logoUrl
 * @property {string|null} code
 * @property {string} typeId UUID.
 * @property {ProviderTypeDto} type
 */

/**
 * @typedef {object} AccessReason
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
 * @typedef {object} MaskinportenConsumersQuery
 * @property {string} party Party UUID.
 * @property {string|null} [consumer]
 * @property {boolean|null} [cascade]
 */

/**
 * Query parameters for retrieving or deleting Maskinporten consumer resources.
 *
 * Use {@link MaskinportenConsumerResourcesQueryBuilder} to construct this object.
 *
 * @typedef {object} MaskinportenConsumerResourcesQuery
 * @property {string} party Party UUID.
 * @property {string|null} [consumer]
 * @property {string|null} [resource]
 */

/**
 * @typedef {object} CompactRoleDto
 * @property {string} id UUID.
 * @property {string|null} code
 * @property {string|null} urn
 * @property {string|null} legacyurn
 * @property {Array<CompactRoleDto>|null} children
 */

/**
 * @typedef {object} CompactEntityDto
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
 * @typedef {object} ResourceDto
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
 * @typedef {object} PermissionDto
 * @property {CompactEntityDto} from
 * @property {CompactEntityDto} to
 * @property {CompactEntityDto} via
 * @property {CompactRoleDto} role
 * @property {CompactRoleDto} viaRole
 * @property {AccessReason} reason
 */

/**
 * @typedef {object} ResourcePermissionDto
 * @property {ResourceDto} resource
 * @property {Array<PermissionDto>|null} permissions
 */

/**
 * @typedef {object} ConnectionDto
 * @property {CompactEntityDto} party
 * @property {Array<CompactRoleDto>|null} roles
 * @property {Array<AccessPackageDto>|null} packages
 * @property {Array<ResourceDto>|null} resources
 * @property {Array<ConnectionInstanceDto>|null} instances
 * @property {Array<ConnectionDto>|null} connections
 */
