// -----------------------------------------------------------------------------
// Models shared by the Access Management BFF clients
//
// Generated from the Altinn.AccessManagement.UI swagger document. The models
// live here instead of next to each client because most of them are used by
// more than one of them.
// -----------------------------------------------------------------------------

/**
 * @typedef {object} AccessArea
 * @property {string|null} id
 * @property {string|null} name
 * @property {string|null} description
 * @property {string|null} iconUrl
 * @property {string} groupId UUID.
 * @property {string|null} urn
 * @property {AreaGroup} group
 */

/**
 * @typedef {object} AccessAreaFE
 * @property {string|null} id
 * @property {string|null} urn
 * @property {string|null} name
 * @property {string|null} description
 * @property {string|null} iconUrl
 * @property {string|null} typeName
 * @property {Array<AccessPackageFE>|null} accessPackages
 */

/**
 * @typedef {object} AccessPackageFE
 * @property {string|null} id
 * @property {string|null} urn
 * @property {string|null} name
 * @property {boolean} isAssignable
 * @property {boolean} isDelegable
 * @property {string|null} description
 * @property {AccessArea} area
 * @property {TypeDto} type
 * @property {Array<ServiceResourceFE>|null} resources
 * @property {Array<PermissionFE>|null} permissions
 */

/**
 * @typedef {object} AccessPackageResourceType
 * @property {string|null} id
 * @property {string|null} name
 */

/**
 * @typedef {object} ActivityLogDto
 * @property {string} id UUID.
 * @property {string|null} type
 * @property {string|null} subtype
 * @property {string|null} trigger
 * @property {string|null} status
 * @property {string} when ISO date-time.
 * @property {string|null} byId UUID.
 * @property {string|null} byName
 * @property {string|null} sourceId UUID.
 * @property {string|null} sourceName
 * @property {string|null} operationId
 * @property {string|null} fromId UUID.
 * @property {string|null} fromName
 * @property {string|null} fromType
 * @property {string|null} toId UUID.
 * @property {string|null} toName
 * @property {string|null} toType
 * @property {string|null} viaId UUID.
 * @property {string|null} viaName
 * @property {string|null} viaType
 * @property {string|null} roleId UUID.
 * @property {string|null} roleName
 * @property {string|null} viaRoleId UUID.
 * @property {string|null} viaRoleName
 * @property {string|null} packageId UUID.
 * @property {string|null} packageName
 * @property {string|null} resourceId UUID.
 * @property {string|null} resourceName
 * @property {string|null} instanceId
 * @property {string} itemId UUID.
 * @property {string|null} parentId UUID.
 * @property {any} details
 * @property {string|null} activityTypeId UUID.
 */

/**
 * @typedef {object} ActivityLogFilterValueDto
 * @property {string} id UUID.
 * @property {string|null} name
 */

/**
 * @typedef {object} AgentDelegationFE
 * @property {PartyFE} agent
 * @property {string} agentAddedAt ISO date-time.
 * @property {Array<ClientDelegationRoleAccessPackages>|null} access
 */

/**
 * @typedef {object} AgentDelegationRequestFE
 * @property {string} customerId UUID of the customer to delegate.
 * @property {Array<ClientRoleAccessPackages>|null} access Roles with the
 * access packages to delegate.
 */

/**
 * @typedef {object} Altinn2AccountFromTokenRequest
 * @property {string} token One time token identifying the account.
 */

/**
 * @typedef {object} Altinn2AccountRequest
 * @property {string} userName User name of the account.
 * @property {string} password Password of the account.
 */

/**
 * @typedef {object} Altinn2ForgotPasswordRequest
 * @property {string} userName User name of the account.
 * @property {string|null} language Language of the recovery message, e.g. nb.
 */

/**
 * @typedef {object} ApproveConsentContext
 * @property {string|null} language Language the consent was approved in, e.g.
 * nb.
 */

/**
 * @typedef {object} AreaGroup
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} description
 * @property {string} entityTypeId UUID.
 * @property {string|null} urn
 */

/**
 * @typedef {object} AssignmentDto
 * @property {string} id UUID.
 * @property {string} roleId UUID.
 * @property {string} fromId UUID.
 * @property {string} toId UUID.
 */

/**
 * @typedef {object} AuthorizedParty
 * @property {string} partyUuid UUID.
 * @property {string|null} name
 * @property {string|null} organizationNumber
 * @property {string|null} dateOfBirth
 * @property {number} partyId
 * @property {AuthorizedPartyType} type
 * @property {string|null} unitType
 * @property {boolean} isDeleted
 * @property {boolean} onlyHierarchyElementWithNoAccess
 * @property {Array<string>|null} authorizedResources
 * @property {Array<string>|null} authorizedRoles
 * @property {Array<AuthorizedParty>|null} subunits
 */

/**
 * @typedef {object} AuthorizedPartyFE
 * @property {string} id UUID.
 * @property {number|null} partyId
 * @property {string|null} name
 * @property {PartyTypeFE} type
 * @property {string|null} unitType
 * @property {string|null} organizationIdentifier
 * @property {string|null} dateOfBirth
 * @property {boolean} isDeleted
 * @property {Array<AuthorizedPartyFE>|null} children
 * @property {PartyFE} parent
 * @property {Array<string>|null} authorizedResources
 * @property {Array<string>|null} authorizedRoles
 * @property {boolean} onlyHierarchyElementWithNoAccess
 */

/**
 * Allowed values: "None", "Person", "Organization", "SelfIdentified".
 *
 * @typedef {string} AuthorizedPartyType
 */

/**
 * @typedef {object} BankruptcyEstateAdministratorFE
 * @property {PartyFE} administrator
 * @property {CompactRole} adminRole
 * @property {string} adminAddedAt ISO date-time.
 */

/**
 * @typedef {object} ClientDelegationFE
 * @property {PartyFE} client
 * @property {Array<ClientDelegationRoleAccessPackages>|null} access
 */

/**
 * @typedef {object} ClientDelegationRoleAccessPackages
 * @property {CompactRole} role
 * @property {Array<CompactPackage>|null} packages
 * @property {Array<CompactResource>|null} resources
 */

/**
 * @typedef {object} ClientRoleAccessPackages
 * @property {string|null} role
 * @property {Array<string>|null} packages
 */

/**
 * @typedef {object} CompactPackage
 * @property {string} id UUID.
 * @property {string|null} urn
 * @property {string} areaId UUID.
 */

/**
 * @typedef {object} CompactResource
 * @property {string} id UUID.
 * @property {string|null} refId
 * @property {ServiceResourceFE} details
 */

/**
 * @typedef {object} CompactRole
 * @property {string} id UUID.
 * @property {string|null} code
 * @property {string|null} urn
 * @property {string|null} legacyUrn
 * @property {Array<string>|null} children
 */

/**
 * @typedef {object} ConnectionFE
 * @property {PartyFE} party
 * @property {Array<RoleInfo>|null} roles
 * @property {Array<RoleInfo>|null} viaRoles
 * @property {Array<ConnectionFE>|null} connections
 */

/**
 * Allowed values: "Created", "Accepted", "Rejected", "Revoked", "Deleted",
 * "Expired".
 *
 * @typedef {string} ConsentRequestStatusType
 */

/**
 * @typedef {object} ContactPoint
 * @property {string|null} category
 * @property {string|null} email
 * @property {string|null} telephone
 * @property {string|null} contactPage
 */

/**
 * @typedef {object} DelegationBatchInputDto
 * @property {Array<DelegationBatchInputDtoPermission>|null} values
 */

/**
 * @typedef {object} DelegationBatchInputDtoPermission
 * @property {string|null} role
 * @property {Array<string>|null} packages
 */

/**
 * @typedef {object} DelegationCheck
 * @property {CompactPackage} package
 * @property {boolean} result
 * @property {Array<DelegationCheckReason>|null} reasons
 */

/**
 * @typedef {object} DelegationCheckReason
 * @property {string|null} description
 */

/**
 * Allowed values: "Unknown", "RoleAccess", "DelegationAccess",
 * "MissingRoleAccess", "MissingDelegationAccess",
 * "InsufficientAuthenticationLevel", "AccessListValidationFail",
 * "PackageAccess", "MissingPackageAccess", "ResourceNotDelegable".
 *
 * @typedef {string} DelegationCheckReasonCode
 */

/**
 * @typedef {object} DelegationDto
 * @property {string} roleId UUID.
 * @property {string} packageId UUID.
 * @property {string} viaId UUID.
 * @property {string} fromId UUID.
 * @property {string} toId UUID.
 */

/**
 * @typedef {object} DelegationInstance
 * @property {string|null} refId
 * @property {IdNamePairOfGuid} type
 */

/**
 * @typedef {object} DialogLookup
 * @property {DialogLookupStatus} status
 * @property {string} dialogId UUID.
 * @property {string|null} instanceRef
 * @property {Array<DialogLookupLocalization>|null} title
 */

/**
 * @typedef {object} DialogLookupLocalization
 * @property {string|null} value
 * @property {string|null} languageCode
 */

/**
 * Allowed values: "Success", "NotFound", "Forbidden".
 *
 * @typedef {string} DialogLookupStatus
 */

/**
 * @typedef {object} IdNamePairOfGuid
 * @property {string} id UUID.
 * @property {string|null} name
 */

/**
 * @typedef {object} InstanceDelegation
 * @property {ServiceResourceFE} resource
 * @property {DelegationInstance} instance
 * @property {Array<PermissionFE>|null} permissions
 * @property {DialogLookup} dialogLookup
 */

/**
 * @typedef {object} InstanceRightsDelegationDto
 * @property {PersonInput} to The person the rights are delegated to.
 * @property {Array<string>} directRightKeys Keys of the rights to delegate.
 */

/**
 * @typedef {object} InstanceRightsFE
 * @property {ServiceResourceFE} resource
 * @property {DelegationInstance} instance
 * @property {Array<RightAccessFE>|null} directRights
 * @property {Array<RightAccessFE>|null} indirectRights
 */

/**
 * @typedef {object} MaskinportenConnectionFE
 * @property {PartyFE} party
 * @property {Array<CompactRole>|null} roles
 */

/**
 * @typedef {object} MyClientDelegationFE
 * @property {PartyFE} provider
 * @property {Array<ClientDelegationFE>|null} clients
 */

/**
 * @typedef {object} NewSystemUserRequest
 * @property {string|null} integrationTitle Name of the integration.
 * @property {string|null} systemId Identifier of the system in the system
 * register.
 */

/**
 * @typedef {object} NotificationAddressModel
 * @property {string|null} countryCode Country code of the phone number, e.g.
 * +47.
 * @property {string|null} email Email address to notify.
 * @property {string|null} phone Phone number to notify.
 */

/**
 * @typedef {object} NotificationAddressResponse
 * @property {string|null} countryCode
 * @property {string|null} email
 * @property {string|null} phone
 * @property {number} notificationAddressId
 */

/**
 * @typedef {object} PackagePermissionFE
 * @property {CompactPackage} package
 * @property {Array<PermissionFE>|null} permissions
 */

/**
 * @typedef {object} PaginatedListOfServiceResourceFE
 * @property {number} page
 * @property {number} numEntriesTotal
 * @property {Array<ServiceResourceFE>|null} pageList
 */

/**
 * @typedef {object} PaginatedResultLinks
 * @property {string|null} next
 */

/**
 * @typedef {object} PaginatedResultOfActivityLogDto
 * @property {Array<ActivityLogDto>|null} data
 * @property {PaginatedResultLinks} links
 */

/**
 * @typedef {object} PaginatedResultOfActivityLogFilterValueDto
 * @property {Array<ActivityLogFilterValueDto>|null} data
 * @property {PaginatedResultLinks} links
 */

/**
 * @typedef {object} PartyFE
 * @property {string} id UUID.
 * @property {number|null} partyId
 * @property {string|null} name
 * @property {PartyTypeFE} type
 * @property {string|null} unitType
 * @property {string|null} organizationIdentifier
 * @property {string|null} dateOfBirth ISO date.
 * @property {boolean} isDeleted
 * @property {Array<PartyFE>|null} children
 * @property {PartyFE} parent
 */

/**
 * Allowed values: "Person", "Organization", "SystemUser", "SelfIdentified".
 *
 * @typedef {string} PartyTypeFE
 */

/**
 * @typedef {object} PermissionFE
 * @property {PartyFE} from
 * @property {PartyFE} to
 * @property {PartyFE} via
 * @property {CompactRole} role
 * @property {CompactRole} viaRole
 * @property {Reason} reason
 */

/**
 * @typedef {object} PersonInput
 * @property {string} personIdentifier
 * @property {string} lastName
 */

/**
 * @typedef {object} ProfileSettingPreference
 * @property {string|null} languageType
 * @property {string|null} language
 * @property {number|null} preSelectedPartyId
 * @property {boolean|null} doNotPromptForParty
 * @property {string|null} preselectedPartyUuid UUID.
 * @property {boolean|null} showClientUnits
 * @property {boolean} shouldShowSubEntities
 * @property {boolean|null} shouldShowDeletedEntities
 */

/**
 * @typedef {object} Provider
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} refId
 * @property {string|null} logoUrl
 * @property {string|null} code
 * @property {string} typeId UUID.
 */

/**
 * @typedef {object} Reason
 * @property {Array<ReasonItem>|null} items
 */

/**
 * @typedef {object} ReasonItem
 * @property {string|null} name
 * @property {string|null} description
 */

/**
 * Allowed values: 0, 1, 2, 3, 4.
 *
 * @typedef {number} ReferenceSource
 */

/**
 * Allowed values: 0, 1, 2, 3, 4, 5, 6, 7.
 *
 * @typedef {number} ReferenceType
 */

/**
 * Allowed values: "None", "Draft", "Pending", "Approved", "Rejected",
 * "Withdrawn".
 *
 * @typedef {string} RequestStatus
 */

/**
 * @typedef {object} ResourceAM
 * @property {string} id UUID.
 * @property {string} providerId UUID.
 * @property {string} typeId UUID.
 * @property {string|null} name
 * @property {string|null} description
 * @property {string|null} refId
 * @property {Provider} provider
 * @property {AccessPackageResourceType} type
 */

/**
 * @typedef {object} ResourceCheckDto
 * @property {ResourceAM} resource
 * @property {Array<RightCheck>|null} rights
 */

/**
 * @typedef {object} ResourceDelegation
 * @property {ServiceResourceFE} resource
 * @property {Array<PermissionFE>|null} permissions
 */

/**
 * @typedef {object} ResourceDelegationBatchInputDto
 * @property {Array<ResourceDelegationBatchInputDtoPermission>|null} values
 */

/**
 * @typedef {object} ResourceDelegationBatchInputDtoPermission
 * @property {string|null} role
 * @property {Array<string>|null} resources
 */

/**
 * @typedef {object} ResourceDelegationDto
 * @property {string} roleId UUID.
 * @property {string} resourceId UUID.
 * @property {string} viaId UUID.
 * @property {string} fromId UUID.
 * @property {string} toId UUID.
 */

/**
 * @typedef {object} ResourceOwnerFE
 * @property {string|null} organisationName
 * @property {string|null} organisationNumber
 * @property {string|null} organisationCode
 */

/**
 * @typedef {object} ResourceReference
 * @property {ReferenceSource} referenceSource
 * @property {string|null} reference
 * @property {ReferenceType} referenceType
 */

/**
 * @typedef {object} ResourceRightFE
 * @property {ServiceResourceFE} resource
 * @property {Array<RightAccessFE>|null} directRights
 * @property {Array<RightAccessFE>|null} indirectRights
 */

/**
 * Allowed values: 0, 1, 2, 4, 8, 16, 32, 64, 128, 256.
 *
 * @typedef {number} ResourceType
 */

/**
 * @typedef {object} Right
 * @property {string|null} key
 * @property {string|null} name
 */

/**
 * @typedef {object} RightAccessFE
 * @property {Right} right
 * @property {Reason} reason
 * @property {Array<PermissionFE>|null} permissions
 */

/**
 * @typedef {object} RightCheck
 * @property {Right} right
 * @property {boolean} result
 * @property {Array<DelegationCheckReasonCode>|null} reasonCodes
 */

/**
 * @typedef {object} Role
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} code
 * @property {string|null} description
 * @property {boolean} isKeyRole
 * @property {string|null} urn
 * @property {string|null} legacyRoleCode
 * @property {string|null} legacyUrn
 * @property {Provider} provider
 * @property {boolean} isRevocable
 */

/**
 * @typedef {object} RoleInfo
 * @property {string} id UUID.
 * @property {string|null} code
 */

/**
 * @typedef {object} RolePermissionFE
 * @property {Role} role
 * @property {Array<PermissionFE>|null} permissions
 */

/**
 * @typedef {object} ServiceResourceFE
 * @property {string|null} identifier
 * @property {string|null} title
 * @property {string|null} description
 * @property {string|null} rightDescription
 * @property {string|null} homepage
 * @property {string|null} status
 * @property {Array<ContactPoint>|null} contactPoints
 * @property {boolean} delegable
 * @property {boolean} visible
 * @property {string|null} resourceOwnerName
 * @property {string|null} resourceOwnerOrgNumber
 * @property {string|null} resourceOwnerLogoUrl
 * @property {string|null} resourceOwnerOrgcode
 * @property {Array<ResourceReference>|null} resourceReferences
 * @property {number|null} priorityCounter
 * @property {ResourceType} resourceType
 * @property {Array<string>|null} keywords
 */

/**
 * @typedef {object} SettingsControllerUpdateSelectedLanguageRequest
 * @property {string|null} languageCode Language code to select, e.g. nb.
 */

/**
 * @typedef {object} SimplifiedConnectionFE
 * @property {PartyFE} party
 * @property {Array<SimplifiedConnectionFE>|null} connections
 */

/**
 * @typedef {object} TypeDto
 * @property {string} id UUID.
 * @property {string} providerId UUID.
 * @property {string|null} name
 */

/**
 * @typedef {object} UserProfileFE
 * @property {number} userId
 * @property {string|null} userUuid UUID.
 * @property {string|null} userName
 * @property {string|null} externalIdentity
 * @property {boolean} isReserved
 * @property {string|null} phoneNumber
 * @property {string|null} email
 * @property {number} partyId
 * @property {PartyFE} party
 * @property {UserType} userType
 * @property {ProfileSettingPreference} profileSettingPreference
 */

/**
 * Allowed values: 0, 1, 2, 3, 4, 5, 6.
 *
 * @typedef {number} UserType
 */

/**
 * @typedef {object} ValidatePersonInput
 * @property {string|null} personIdentifier Either an 11-digit national
 * identity number or a username.
 * @property {string|null} lastName Last name of the person.
 */

export const AccessAreaFE = undefined;
export const AccessPackageFE = undefined;
export const AgentDelegationFE = undefined;
export const AgentDelegationRequestFE = undefined;
export const Altinn2AccountFromTokenRequest = undefined;
export const Altinn2AccountRequest = undefined;
export const Altinn2ForgotPasswordRequest = undefined;
export const ApproveConsentContext = undefined;
export const AssignmentDto = undefined;
export const AuthorizedParty = undefined;
export const AuthorizedPartyFE = undefined;
export const BankruptcyEstateAdministratorFE = undefined;
export const ClientDelegationFE = undefined;
export const ClientRoleAccessPackages = undefined;
export const ConnectionFE = undefined;
export const ConsentRequestStatusType = undefined;
export const DelegationBatchInputDto = undefined;
export const DelegationCheck = undefined;
export const DelegationDto = undefined;
export const InstanceDelegation = undefined;
export const InstanceRightsDelegationDto = undefined;
export const InstanceRightsFE = undefined;
export const MaskinportenConnectionFE = undefined;
export const MyClientDelegationFE = undefined;
export const NewSystemUserRequest = undefined;
export const NotificationAddressModel = undefined;
export const PaginatedListOfServiceResourceFE = undefined;
export const PaginatedResultOfActivityLogDto = undefined;
export const PaginatedResultOfActivityLogFilterValueDto = undefined;
export const PartyFE = undefined;
export const PersonInput = undefined;
export const RequestStatus = undefined;
export const ResourceCheckDto = undefined;
export const ResourceDelegation = undefined;
export const ResourceDelegationBatchInputDto = undefined;
export const ResourceDelegationDto = undefined;
export const ResourceOwnerFE = undefined;
export const ResourceRightFE = undefined;
export const ResourceType = undefined;
export const Right = undefined;
export const RightCheck = undefined;
export const Role = undefined;
export const RolePermissionFE = undefined;
export const ServiceResourceFE = undefined;
export const SettingsControllerUpdateSelectedLanguageRequest = undefined;
export const SimplifiedConnectionFE = undefined;
export const UserProfileFE = undefined;
export const ValidatePersonInput = undefined;
