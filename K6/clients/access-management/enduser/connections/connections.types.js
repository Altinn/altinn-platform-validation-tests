/**
 * @typedef {object} PaginatedResultLinks
 * @property {string|null} next
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
 * @typedef {object} CompactRoleDto
 * @property {string} id UUID.
 * @property {string|null} code
 * @property {string|null} urn
 * @property {string|null} legacyurn
 * Note: the swagger declares this key as "legacyurn ", with a trailing space.
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
 * @typedef {object} ConnectionDto
 * @property {CompactEntityDto} party
 * @property {Array<CompactRoleDto>|null} roles
 * @property {Array<AccessPackageDto>|null} packages
 * @property {Array<ResourceDto>|null} resources
 * @property {Array<ConnectionInstanceDto>|null} instances
 * @property {Array<ConnectionDto>|null} connections
 */

/**
 * @typedef {object} ConnectionDtoPaginatedResult
 * @property {Array<ConnectionDto>|null} data
 * @property {PaginatedResultLinks} links
 */

/**
 * @typedef {object} AssignmentDto
 * @property {string} id UUID.
 * @property {string} roleId UUID.
 * @property {string} fromId UUID.
 * @property {string} toId UUID.
 */

/**
 * @typedef {object} PersonInput
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
 * @typedef {object} GetConnectionsQuery
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
 * @typedef {object} CreateConnectionQuery
 * @property {string} party Party UUID.
 * @property {string|null} [to] To UUID.
 */

/**
 * Query parameters for deleting a connection.
 *
 * Use {@link DeleteConnectionQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteConnectionQuery
 * @property {string} party Party UUID.
 * @property {string} from From UUID.
 * @property {string} to To UUID.
 * @property {boolean|null} [cascade]
 */

/**
 * @typedef {object} SimplifiedPartyDto
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} type
 * @property {string|null} variant
 * @property {string|null} organizationIdentifier
 * @property {boolean} isDeleted
 * @property {string|null} deletedAt ISO date-time.
 */

/**
 * @typedef {object} SimplifiedConnectionDto
 * @property {SimplifiedPartyDto} party
 * @property {Array<SimplifiedConnectionDto>|null} connections
 */

/**
 * @typedef {object} SimplifiedConnectionDtoPaginatedResult
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
 * @typedef {object} GetConnectionUsersQuery
 * @property {string} party Party UUID.
 */

/**
 * @typedef {object} CompactPackageDto
 * @property {string} id UUID.
 * @property {string|null} urn
 * @property {string} areaId UUID.
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
 * @typedef {object} PackagePermissionDto
 * @property {CompactPackageDto} package
 * @property {Array<PermissionDto>|null} permissions
 */

/**
 * @typedef {object} PackagePermissionDtoPaginatedResult
 * @property {Array<PackagePermissionDto>|null} data
 * @property {PaginatedResultLinks} links
 */

/**
 * @typedef {object} AssignmentPackageDto
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
 * @typedef {object} GetAccessPackagesQuery
 * @property {string} party Party UUID.
 * @property {string|null} [from]
 * @property {string|null} [to]
 */

/**
 * Query parameters for creating an access package assignment.
 *
 * Use {@link CreateAccessPackageQueryBuilder} to construct this object.
 *
 * @typedef {object} CreateAccessPackageQuery
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
 * @typedef {object} DeleteAccessPackageQuery
 * @property {string} party Party UUID.
 * @property {string} from From party UUID.
 * @property {string} to To party UUID.
 * @property {string|null} [packageId]
 * @property {string|null} [package]
 */

/**
 * Result of an access package delegation check.
 *
 * @typedef {object} AccessPackageDtoCheck
 * @property {AccessPackageDto} package
 * @property {boolean} result
 * @property {Array<AccessPackageDtoCheckReason>|null} reasons
 */

/**
 * Reason why an access package delegation check succeeded or failed.
 *
 * @typedef {object} AccessPackageDtoCheckReason
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
 * @typedef {object} AccessPackageDtoCheckPaginatedResult
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
 * @typedef {object} AccessPackageDelegationCheckQuery
 * @property {string} party Party UUID.
 * @property {Array<string>|null} [packageIds] Package UUIDs.
 * @property {Array<string>|null} [packages] Package identifiers.
 */

/**
 * @typedef {object} RoleDto
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
 * @typedef {object} RolePermissionDto
 * @property {RoleDto} role
 * @property {Array<PermissionDto>|null} permissions
 */

/**
 * @typedef {object} RolePermissionDtoPaginatedResult
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
 * @typedef {object} GetRolesQuery
 * @property {string} party Party UUID.
 * @property {string} from Source party UUID.
 * @property {string} to Target party UUID.
 */

/**
 * Query parameters for deleting a role permission.
 *
 * Use {@link DeleteRoleQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteRoleQuery
 * @property {string} party Party UUID.
 * @property {string} from Source party UUID.
 * @property {string} to Target party UUID.
 * @property {string} rolecode Role code.
 */

/**
 * @typedef {object} ResourcePermissionDto
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
 * @typedef {object} GetResourcesQuery
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
 * @typedef {object} DeleteResourceQuery
 * @property {string} party Party UUID.
 * @property {string} from From UUID.
 * @property {string} to To UUID.
 * @property {string|null} [resource] Resource identifier.
 */

/**
 * @typedef {object} ExternalResourceRightDto
 * @property {ResourceDto} resource
 * @property {Array<RightPermission>|null} directRights
 * @property {Array<RightPermission>|null} indirectRights
 */

/**
 * @typedef {object} RightKeyListDto
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
 * @typedef {object} GetResourceRightsQuery
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
 * @typedef {object} CreateResourceRightsQuery
 * @property {string} party Party UUID.
 * @property {string} to To UUID.
 * @property {string} resource Resource identifier.
 */

/**
 * Query parameters for updating resource rights.
 *
 * Use {@link UpdateResourceRightsQueryBuilder} to construct this object.
 *
 * @typedef {object} UpdateResourceRightsQuery
 * @property {string} party Party UUID.
 * @property {string} to To UUID.
 * @property {string} resource Resource identifier.
 */
/**
 * @typedef {object} RightPermission
 * @property {RightDto} right
 * @property {AccessReason} reason
 * @property {Array<PermissionDto>|null} permissions
 */

/**
 * @typedef {object} RightDto
 * @property {string|null} key
 * @property {string|null} name
 * @property {Array<AttributeDto>|null} resource
 * @property {AttributeDto} action
 */

/**
 * @typedef {object} AccessReason
 * @property {AccessReasonFlag} flag
 * @property {Array<AccessReasonRecord>|null} items
 */

/**
 * @typedef {number} AccessReasonFlag
 * Enum values:
 * 0, 1, 2, 4, 8, 16
 */

/**
 * @typedef {object} AccessReasonRecord
 * @property {string|null} name
 * @property {string|null} description
 */

/**
 * @typedef {object} ResourceCheckDto
 * @property {ResourceDto} resource
 * @property {Array<RightCheckDto>|null} rights
 */

/**
 * @typedef {object} RightCheckDto
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
 * @typedef {object} GetResourceDelegationCheckQuery
 * @property {string} party Party UUID.
 * @property {string|null} [resource] Resource identifier.
 */

/**
 * @typedef {object} InstanceTypeDto
 * @property {string} id UUID.
 * @property {string|null} name
 */

/**
 * @typedef {object} InstanceDto
 * @property {string|null} refId
 * @property {InstanceTypeDto} type
 */

/**
 * @typedef {object} InstancePermissionDto
 * @property {ResourceDto} resource
 * @property {InstanceDto} instance
 * @property {Array<PermissionDto>|null} permissions
 */

/**
 * Query parameters for retrieving instance permissions.
 *
 * Use {@link GetInstancesQueryBuilder} to construct this object.
 *
 * @typedef {object} GetInstancesQuery
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
 * @typedef {object} DeleteInstanceQuery
 * @property {string} party Party UUID.
 * @property {string} from From UUID.
 * @property {string} to To UUID.
 * @property {string} resource Resource identifier.
 * @property {string} instance Instance identifier.
 */
/**
 * @typedef {object} ExtInstanceRightDto
 * @property {ResourceDto} resource
 * @property {InstanceDto} instance
 * @property {Array<RightPermission>|null} directRights
 * @property {Array<RightPermission>|null} indirectRights
 */

/**
 * @typedef {object} InstanceRightsDelegationDto
 * @property {PersonInputDto} to
 * @property {Array<string>|null} directRightKeys
 */
/**
 * @typedef {object} PersonInputDto
 * @property {string|null} personIdentifier Person identifier.
 * @property {string|null} lastName Last name.
 */

/**
 * Query parameters for retrieving instance rights.
 *
 * Use {@link GetInstanceRightsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetInstanceRightsQuery
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
 * @typedef {object} CreateInstanceRightsQuery
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
 * @typedef {object} UpdateInstanceRightsQuery
 * @property {string} party Party UUID.
 * @property {string} to To UUID.
 * @property {string} resource Resource identifier.
 * @property {string} instance Instance identifier.
 */

/**
 * @typedef {object} InstanceCheckDto
 * @property {ResourceDto} resource
 * @property {InstanceDto} instance
 * @property {RightCheckDto[]|null} rights
 */

/**
 * @typedef {object} GetInstanceDelegationCheckQuery
 * @property {string} party Party identifier.
 * @property {string} resource Resource identifier.
 * @property {string} instance Instance reference.
 */

/**
 * @typedef {object} SimplifiedPartyDtoPaginatedResult
 * @property {SimplifiedPartyDto[]|null} data
 * @property {PaginatedResultLinks} links
 */

/**
 * @typedef {object} GetInstanceUsersQuery
 * @property {string} party Party identifier.
 * @property {string} resource Resource identifier.
 * @property {string} instance Instance reference.
 */

export const AccessPackageDelegationCheckQuery = undefined;
export const AccessPackageDtoCheckPaginatedResult = undefined;
export const ConnectionDtoPaginatedResult = undefined;
export const CreateAccessPackageQuery = undefined;
export const CreateConnectionQuery = undefined;
export const CreateInstanceRightsQuery = undefined;
export const CreateResourceRightsQuery = undefined;
export const DeleteAccessPackageQuery = undefined;
export const DeleteConnectionQuery = undefined;
export const DeleteInstanceQuery = undefined;
export const DeleteResourceQuery = undefined;
export const DeleteRoleQuery = undefined;
export const ExtInstanceRightDto = undefined;
export const ExternalResourceRightDto = undefined;
export const GetAccessPackagesQuery = undefined;
export const GetConnectionUsersQuery = undefined;
export const GetConnectionsQuery = undefined;
export const GetInstanceDelegationCheckQuery = undefined;
export const GetInstanceRightsQuery = undefined;
export const GetInstanceUsersQuery = undefined;
export const GetInstancesQuery = undefined;
export const GetResourceDelegationCheckQuery = undefined;
export const GetResourceRightsQuery = undefined;
export const GetResourcesQuery = undefined;
export const GetRolesQuery = undefined;
export const InstanceCheckDto = undefined;
export const InstancePermissionDto = undefined;
export const InstanceRightsDelegationDto = undefined;
export const PackagePermissionDtoPaginatedResult = undefined;
export const PersonInput = undefined;
export const RightKeyListDto = undefined;
export const RoleDto = undefined;
export const RolePermissionDtoPaginatedResult = undefined;
export const SimplifiedConnectionDtoPaginatedResult = undefined;
export const SimplifiedPartyDtoPaginatedResult = undefined;
export const UpdateInstanceRightsQuery = undefined;
export const UpdateResourceRightsQuery = undefined;
