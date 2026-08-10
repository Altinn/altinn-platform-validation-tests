/**
 * @typedef {object} AttributeDto
 * @property {string|null} type
 * @property {string|null} value
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
 * @typedef {0|1|2|4|8|16} AccessReasonFlag
 */

/**
 * @typedef {object} AccessReasonRecord
 * @property {string|null} name
 * @property {string|null} description
 */

/**
 * @typedef {object} AccessReason
 * @property {AccessReasonFlag} flag
 * @property {Array<AccessReasonRecord>|null} items
 */

/**
 * @typedef {object} RightDto
 * @property {string|null} key
 * @property {string|null} name
 * @property {Array<AttributeDto>|null} resource
 * @property {AttributeDto} action
 */

/**
 * @typedef {"Unknown"|"RoleAccess"|"DelegationAccess"|"MissingRoleAccess"|"MissingDelegationAccess"|"AccessListValidationFail"|"PackageAccess"|"MissingPackageAccess"|"ResourceNotDelegable"|"ResourceIsMaskinPortenSchema"} DelegationCheckReasonCode
 */

/**
 * @typedef {object} RightCheckDto
 * @property {RightDto} right
 * @property {boolean} result
 * @property {Array<DelegationCheckReasonCode>|null} reasonCodes
 */

/**
 * @typedef {object} ResourceCheckDto
 * @property {ResourceDto} resource
 * @property {Array<RightCheckDto>|null} rights
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
 * @typedef {object} AccessPackageDto
 * @property {string} id UUID.
 * @property {string|null} urn
 * @property {string} areaId UUID.
 */

/**
 * @typedef {object} ConnectionInstanceDto
 * @property {string|null} resourceRefId
 * @property {string|null} instanceId
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

/**
 * @typedef {object} AssignmentDto
 * @property {string|null} id UUID.
 * @property {string|null} roleId UUID.
 * @property {string|null} fromId UUID.
 * @property {string|null} toId UUID.
 */

// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for retrieving, creating or deleting Maskinporten suppliers.
 *
 * Use {@link MaskinportenSuppliersQueryBuilder} to construct this object.
 *
 * @typedef {object} MaskinportenSuppliersQuery
 * @property {string} party Party UUID.
 * @property {string|null} [supplier]
 * Supplier identifier.
 * @property {boolean|null} [cascade]
 * Whether associated delegations should also be removed.
 */

/**
 * Query parameters for retrieving, creating or deleting Maskinporten supplier
 * resources.
 *
 * Use {@link MaskinportenSupplierResourcesQueryBuilder} to construct this
 * object.
 *
 * @typedef {object} MaskinportenSupplierResourcesQuery
 * @property {string} party Party UUID.
 * @property {string|null} [supplier]
 * Supplier identifier.
 * @property {string|null} [resource]
 * Resource identifier.
 */

/**
 * Query parameters for checking whether a resource can be delegated.
 *
 * Use {@link MaskinportenSupplierDelegationCheckQueryBuilder} to construct this
 * object.
 *
 * @typedef {object} MaskinportenSupplierDelegationCheckQuery
 * @property {string} party Party UUID.
 * @property {string} resource Resource identifier.
 */
