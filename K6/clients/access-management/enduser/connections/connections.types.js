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

/**
 * Result of an access package delegation check.
 *
 * @typedef {Object} AccessPackageDtoCheck
 * @property {AccessPackageDto} package
 * @property {boolean} result
 * @property {Array<AccessPackageDtoCheckReason>|null} reasons
 */

/**
 * Reason why an access package delegation check succeeded or failed.
 *
 * @typedef {Object} AccessPackageDtoCheckReason
 * @property {string|null} description
 * @property {string|null} roleId UUID.
 * @property {string|null} roleUrn
 * @property {string|null} fromId UUID.
 * @property {string|null} fromName
 * @property {string|null} toId UUID.
 * @property {string|null} toName
 * @property {string|null} viaId UUID.
 * @property {string|null} viaName
 * @property {string|null} viaRoleId UUID.
 * @property {string|null} viaRoleUrn
 */

/**
 * Paginated result containing access package delegation checks.
 *
 * @typedef {Object} AccessPackageDtoCheckPaginatedResult
 * @property {Array<AccessPackageDtoCheck>|null} data
 * @property {PaginatedResultLinks} links
 */

// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for checking access package delegation.
 *
 * Use {@link AccessPackageDelegationCheckQueryBuilder} to construct this object.
 *
 * @typedef {Object} AccessPackageDelegationCheckQuery
 * @property {string} party Party UUID.
 * @property {Array<string>|null} [packageIds] Package UUIDs.
 * @property {Array<string>|null} [packages] Package identifiers.
 */


/**
 * @typedef {Object} RoleDto
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} code
 * @property {string|null} description
 * @property {boolean} isKeyRole
 * @property {string|null} urn
 * @property {string|null} legacyRoleCode
 * @property {string|null} legacyUrn
 * @property {boolean} isResourcePolicyAvailable
 * @property {ProviderDto} provider
 * @property {boolean|null} isRevocable
 */

/**
 * @typedef {Object} RolePermissionDto
 * @property {RoleDto} role
 * @property {Array<PermissionDto>|null} permissions
 */

/**
 * @typedef {Object} RolePermissionDtoPaginatedResult
 * @property {Array<RolePermissionDto>|null} data
 * @property {PaginatedResultLinks} links
 */

// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for retrieving role permissions.
 *
 * Use {@link GetRolesQueryBuilder} to construct this object.
 *
 * @typedef {Object} GetRolesQuery
 * @property {string} party Party UUID.
 * @property {string} from Source party UUID.
 * @property {string} to Target party UUID.
 */

/**
 * Query parameters for deleting a role permission.
 *
 * Use {@link DeleteRoleQueryBuilder} to construct this object.
 *
 * @typedef {Object} DeleteRoleQuery
 * @property {string} party Party UUID.
 * @property {string} from Source party UUID.
 * @property {string} to Target party UUID.
 * @property {string} rolecode Role code.
 */


/**
 * @typedef {Object} ResourcePermissionDto
 * @property {ResourceDto} resource
 * @property {Array<PermissionDto>|null} permissions
 */

// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for retrieving resource permissions.
 *
 * Use {@link GetResourcesQueryBuilder} to construct this object.
 *
 * @typedef {Object} GetResourcesQuery
 * @property {string} party Party UUID.
 * @property {string|null} [from] From UUID.
 * @property {string|null} [to] To UUID.
 * @property {string|null} [resource] Resource identifier.
 */

/**
 * Query parameters for deleting a resource permission.
 *
 * Use {@link DeleteResourceQueryBuilder} to construct this object.
 *
 * @typedef {Object} DeleteResourceQuery
 * @property {string} party Party UUID.
 * @property {string} from From UUID.
 * @property {string} to To UUID.
 * @property {string|null} [resource] Resource identifier.
 */

/**
 * @typedef {Object} ExternalResourceRightDto
 * @property {ResourceDto} resource
 * @property {Array<RightPermission>|null} directRights
 * @property {Array<RightPermission>|null} indirectRights
 */

/**
 * @typedef {Object} RightKeyListDto
 * @property {Array<string>|null} directRightKeys
 */

// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for retrieving resource rights.
 *
 * Use {@link GetResourceRightsQueryBuilder} to construct this object.
 *
 * @typedef {Object} GetResourceRightsQuery
 * @property {string} party Party UUID.
 * @property {string} from From UUID.
 * @property {string} to To UUID.
 * @property {string} resource Resource identifier.
 */

/**
 * Query parameters for creating resource rights.
 *
 * Use {@link CreateResourceRightsQueryBuilder} to construct this object.
 *
 * @typedef {Object} CreateResourceRightsQuery
 * @property {string} party Party UUID.
 * @property {string} to To UUID.
 * @property {string} resource Resource identifier.
 */

/**
 * Query parameters for updating resource rights.
 *
 * Use {@link UpdateResourceRightsQueryBuilder} to construct this object.
 *
 * @typedef {Object} UpdateResourceRightsQuery
 * @property {string} party Party UUID.
 * @property {string} to To UUID.
 * @property {string} resource Resource identifier.
 */
/**
 * @typedef {Object} RightPermission
 * @property {RightDto} right
 * @property {AccessReason} reason
 * @property {Array<PermissionDto>|null} permissions
 */

/**
 * @typedef {Object} ExternalResourceRightDto
 * @property {ResourceDto} resource
 * @property {Array<RightPermission>|null} directRights
 * @property {Array<RightPermission>|null} indirectRights
 */

/**
 * @typedef {Object} RightKeyListDto
 * @property {Array<string>|null} directRightKeys
 */

/**
 * @typedef {Object} RightDto
 * @property {string|null} key
 * @property {string|null} name
 * @property {Array<AttributeDto>|null} resource
 * @property {AttributeDto} action
 */

/**
 * @typedef {Object} AccessReason
 * @property {AccessReasonFlag} flag
 * @property {Array<AccessReasonRecord>|null} items
 */

/**
 * @typedef {number} AccessReasonFlag
 * Enum values:
 * 0, 1, 2, 4, 8, 16
 */

/**
 * @typedef {Object} AccessReasonRecord
 * @property {string|null} name
 * @property {string|null} description
 */

/**
 * @typedef {Object} RightPermission
 * @property {RightDto} right
 * @property {AccessReason} reason
 * @property {Array<PermissionDto>|null} permissions
 */

/**
 * @typedef {Object} ExternalResourceRightDto
 * @property {ResourceDto} resource
 * @property {Array<RightPermission>|null} directRights
 * @property {Array<RightPermission>|null} indirectRights
 */

/**
 * @typedef {Object} RightKeyListDto
 * @property {Array<string>|null} directRightKeys
 */

/**
 * @typedef {number} AccessReasonFlag
 */

/**
 * @typedef {Object} ResourceCheckDto
 * @property {ResourceDto} resource
 * @property {Array<RightCheckDto>|null} rights
 */

/**
 * @typedef {Object} RightCheckDto
 * @property {RightDto} right
 * @property {boolean} result
 * @property {Array<DelegationCheckReasonCode>|null} reasonCodes
 */

/**
 * Reason code explaining the result of a resource delegation check.
 *
 * @typedef {"Unknown"|
 * "RoleAccess"|
 * "DelegationAccess"|
 * "MissingRoleAccess"|
 * "MissingDelegationAccess"|
 * "AccessListValidationFail"|
 * "PackageAccess"|
 * "MissingPackageAccess"|
 * "ResourceNotDelegable"|
 * "ResourceIsMaskinPortenSchema"} DelegationCheckReasonCode
 */

/**
 * Query parameters for checking resource delegation.
 *
 * Use {@link GetResourceDelegationCheckQueryBuilder} to construct this object.
 *
 * @typedef {Object} GetResourceDelegationCheckQuery
 * @property {string} party Party UUID.
 * @property {string|null} [resource] Resource identifier.
 */

/**
 * @typedef {Object} InstanceTypeDto
 * @property {string} id UUID.
 * @property {string|null} name
 */

/**
 * @typedef {Object} InstanceDto
 * @property {string|null} refId
 * @property {InstanceTypeDto} type
 */

/**
 * @typedef {Object} InstancePermissionDto
 * @property {ResourceDto} resource
 * @property {InstanceDto} instance
 * @property {Array<PermissionDto>|null} permissions
 */

/**
 * Query parameters for retrieving instance permissions.
 *
 * Use {@link GetInstancesQueryBuilder} to construct this object.
 *
 * @typedef {Object} GetInstancesQuery
 * @property {string} party Party UUID.
 * @property {string|null} [from] From UUID.
 * @property {string|null} [to] To UUID.
 * @property {string|null} [resource] Resource identifier.
 * @property {string|null} [instance] Instance identifier.
 */

/**
 * Query parameters for deleting instance permissions.
 *
 * Use {@link DeleteInstanceQueryBuilder} to construct this object.
 *
 * @typedef {Object} DeleteInstanceQuery
 * @property {string} party Party UUID.
 * @property {string} from From UUID.
 * @property {string} to To UUID.
 * @property {string} resource Resource identifier.
 * @property {string} instance Instance identifier.
 */
/**
 * @typedef {Object} ExtInstanceRightDto
 * @property {ResourceDto} resource
 * @property {InstanceDto} instance
 * @property {Array<RightPermission>|null} directRights
 * @property {Array<RightPermission>|null} indirectRights
 */

/**
 * @typedef {Object} InstanceRightsDelegationDto
 * @property {PersonInputDto} to
 * @property {Array<string>|null} directRightKeys
 */
/**
 * @typedef {Object} PersonInputDto
 * @property {string|null} personIdentifier Person identifier.
 * @property {string|null} lastName Last name.
 */

/**
 * Query parameters for retrieving instance rights.
 *
 * Use {@link GetInstanceRightsQueryBuilder} to construct this object.
 *
 * @typedef {Object} GetInstanceRightsQuery
 * @property {string} party Party UUID.
 * @property {string} from From party UUID.
 * @property {string} to To party UUID.
 * @property {string} resource Resource identifier.
 * @property {string} instance Instance identifier.
 */

/**
 * Query parameters for creating instance rights.
 *
 * Use {@link CreateInstanceRightsQueryBuilder} to construct this object.
 *
 * @typedef {Object} CreateInstanceRightsQuery
 * @property {string} party Party UUID.
 * @property {string|null} [to] To UUID.
 * @property {string} resource Resource identifier.
 * @property {string} instance Instance identifier.
 */

/**
 * Query parameters for updating instance rights.
 *
 * Use {@link UpdateInstanceRightsQueryBuilder} to construct this object.
 *
 * @typedef {Object} UpdateInstanceRightsQuery
 * @property {string} party Party UUID.
 * @property {string} to To UUID.
 * @property {string} resource Resource identifier.
 * @property {string} instance Instance identifier.
 */

/**
 * @typedef {Object} InstanceCheckDto
 * @property {ResourceDto} resource
 * @property {InstanceDto} instance
 * @property {RightCheckDto[]|null} rights
 */

/**
* @typedef {Object} GetInstanceDelegationCheckQuery
* @property {string} party Party identifier.
* @property {string} resource Resource identifier.
* @property {string} instance Instance reference.
*/


/**
 * @typedef {Object} SimplifiedPartyDto
 * @property {string} id
 * @property {string|null} name
 * @property {string|null} type
 * @property {string|null} variant
 * @property {string|null} organizationIdentifier
 * @property {boolean} isDeleted
 * @property {string|null} deletedAt
 */

/**
 * @typedef {Object} PaginatedResultLinks
 * @property {string|null} next
 */

/**
 * @typedef {Object} SimplifiedPartyDtoPaginatedResult
 * @property {SimplifiedPartyDto[]|null} data
 * @property {PaginatedResultLinks} links
 */


/**
 * @typedef {Object} GetInstanceUsersQuery
 * @property {string} party Party identifier.
 * @property {string} resource Resource identifier.
 * @property {string} instance Instance reference.
 */
