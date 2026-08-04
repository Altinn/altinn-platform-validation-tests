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
 * @property {Array<AccessPackage>|null} accessPackages
 */

/**
 * @typedef {object} AccessPackage
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} urn
 * @property {string|null} description
 * @property {boolean} isAssignable
 * @property {boolean} isDelegable
 * @property {AccessArea} area
 * @property {Array<ResourceAM>|null} resources
 * @property {TypeDto} type
 */

/**
 * @typedef {object} AccessPackageFE
 * @property {string|null} id
 * @property {string|null} urn
 * @property {string|null} name
 * @property {boolean} isAssignable
 * @property {boolean} isDelegable
 * @property {string|null} description
 * @property {Array<AccessPackageResourceFE>|null} resources
 * @property {Array<Permission>|null} permissions
 */

/**
 * @typedef {object} AccessPackageResourceFE
 * @property {string|null} identifier
 * @property {string|null} title
 * @property {string|null} description
 * @property {string|null} resourceOwnerName
 * @property {string|null} resourceOwnerLogoUrl
 * @property {string|null} resourceOwnerOrgcode
 * @property {ResourceType} resourceType
 */

/**
 * @typedef {object} AccessPackageResourceType
 * @property {string|null} id
 * @property {string|null} name
 */

/**
 * @typedef {object} AgentDelegation
 * @property {CompactEntity} agent
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
 * Allowed values: "None", "Person", "Organization", "SelfIdentified".
 *
 * @typedef {string} AuthorizedPartyType
 */

/**
 * @typedef {object} ClientDelegation
 * @property {CompactEntity} client
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
 * @typedef {object} CompactEntity
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} type
 * @property {string|null} variant
 * @property {CompactEntity} parent
 * @property {Array<CompactEntity>|null} children
 * @property {number|null} partyId
 * @property {number|null} userId
 * @property {string|null} username
 * @property {string|null} organizationIdentifier
 * @property {string|null} dateOfBirth
 * @property {string|null} dateOfDeath
 * @property {boolean} isDeleted
 * @property {string|null} deletedAt ISO date-time.
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
 * @typedef {object} Connection
 * @property {Entity} party
 * @property {Array<RoleInfo>|null} roles
 * @property {Array<Connection>|null} connections
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
 * @typedef {object} Entity
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} type
 * @property {string|null} variant
 * @property {Entity} parent
 * @property {Array<Entity>|null} children
 * @property {number|null} partyId
 * @property {string|null} organizationIdentifier
 * @property {string|null} dateOfBirth
 * @property {boolean} isDeleted
 */

/**
 * @typedef {object} IdNamePairOfGuid
 * @property {string} id UUID.
 * @property {string|null} name
 */

/**
 * @typedef {object} IdValuePair
 * @property {string} id
 * @property {string} value
 */

/**
 * @typedef {object} InstanceDelegation
 * @property {ServiceResourceFE} resource
 * @property {DelegationInstance} instance
 * @property {Array<Permission>|null} permissions
 * @property {DialogLookup} dialogLookup
 */

/**
 * @typedef {object} InstanceRights
 * @property {ResourceAM} resource
 * @property {DelegationInstance} instance
 * @property {Array<RightAccess>|null} directRights
 * @property {Array<RightAccess>|null} indirectRights
 */

/**
 * @typedef {object} InstanceRightsDelegationDto
 * @property {PersonInput} to The person the rights are delegated to.
 * @property {Array<string>} directRightKeys Keys of the rights to delegate.
 */

/**
 * @typedef {object} MaskinportenConnection
 * @property {CompactEntity} party
 * @property {Array<CompactRole>|null} roles
 */

/**
 * @typedef {object} MyClientDelegation
 * @property {CompactEntity} provider
 * @property {Array<ClientDelegation>|null} clients
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
 * @typedef {object} OrgContact
 * @property {string|null} phone
 * @property {string|null} url
 */

/**
 * @typedef {object} OrgData
 * @property {object|null} name
 * @property {string|null} logo
 * @property {string|null} emblem
 * @property {string|null} orgnr
 * @property {string|null} homepage
 * @property {Array<string>|null} environments
 * @property {OrgContact} contact
 */

/**
 * @typedef {object} Organization
 * @property {string|null} orgNumber
 * @property {string|null} name
 * @property {string|null} unitType
 * @property {string|null} telephoneNumber
 * @property {string|null} mobileNumber
 * @property {string|null} faxNumber
 * @property {string|null} eMailAddress
 * @property {string|null} internetAddress
 * @property {string|null} mailingAddress
 * @property {string|null} mailingPostalCode
 * @property {string|null} mailingPostalCity
 * @property {string|null} businessAddress
 * @property {string|null} businessPostalCode
 * @property {string|null} businessPostalCity
 * @property {string|null} unitStatus
 */

/**
 * @typedef {object} PackagePermission
 * @property {CompactPackage} package
 * @property {Array<Permission>|null} permissions
 */

/**
 * @typedef {object} PaginatedListOfServiceResourceFE
 * @property {number} page
 * @property {number} numEntriesTotal
 * @property {Array<ServiceResourceFE>|null} pageList
 */

/**
 * @typedef {object} PartyFE
 * @property {number} partyId
 * @property {string|null} partyUuid UUID.
 * @property {PartyType} partyTypeName
 * @property {string|null} orgNumber
 * @property {string|null} unitType
 * @property {string|null} name
 * @property {boolean} isDeleted
 * @property {string|null} dateOfBirth ISO date.
 * @property {boolean} onlyHierarchyElementWithNoAccess
 * @property {PersonFE} person
 * @property {Organization} organization
 * @property {Array<PartyFE>|null} childParties
 */

/**
 * Allowed values: 1, 2, 3, 4, 5.
 *
 * @typedef {number} PartyType
 */

/**
 * @typedef {object} Permission
 * @property {CompactEntity} from
 * @property {CompactEntity} to
 * @property {CompactEntity} via
 * @property {CompactRole} role
 * @property {CompactRole} viaRole
 * @property {Reason} reason
 */

/**
 * @typedef {object} PersonFE
 * @property {string|null} name
 * @property {string|null} firstName
 * @property {string|null} middleName
 * @property {string|null} lastName
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
 * Allowed values: "DAGL", "LEDE", "REGN", "SREVA", "FGRP", "HFOR", "HLSE",
 * "INNH", "KDAT", "KGRL", "KIRK", "KMOR", "KOMP", "KONT", "KTRF", "MEDL",
 * "NEST", "OBS", "OPMV", "ORGL", "POFE", "POHV", "PROK", "READ", "AAFY",
 * "AVKL", "BEDR", "DTPR", "DTSO", "EIKM", "FEMV", "RFAD", "SIFE", "SIGN",
 * "SIHV", "UTBG", "VARA", "VIFE", "MVAU", "MVAG", "KOMK", "KNUF", "KEMN",
 * "FF\u00d8R", "BEST", "REPR", "REVI", "BOBE", "STFT", "KENK", "KDEB", "HVAR",
 * "HNST", "HMDL", "HLED", "ESGR", "FUSJ", "FISJ", "ETDL", "ADOS".
 *
 * @typedef {string} RegistryRoleType
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
 * @property {Array<Permission>|null} permissions
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
 * @typedef {object} ResourceRight
 * @property {ResourceAM} resource
 * @property {Array<RightAccess>|null} directRights
 * @property {Array<RightAccess>|null} indirectRights
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
 * @typedef {object} RightAccess
 * @property {Right} right
 * @property {Reason} reason
 * @property {Array<Permission>|null} permissions
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
 * @typedef {object} RolePermission
 * @property {Role} role
 * @property {Array<Permission>|null} permissions
 */

/**
 * @typedef {object} ServiceResourceFE
 * @property {string|null} identifier
 * @property {string|null} title
 * @property {string|null} description
 * @property {string|null} rightDescription
 * @property {string|null} homepage
 * @property {string|null} status
 * @property {Array<string>|null} spatial
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
 * @property {Array<IdValuePair>|null} authorizationReference
 * @property {Array<string>|null} keywords
 */

/**
 * @typedef {object} SettingsControllerUpdateSelectedLanguageRequest
 * @property {string|null} languageCode Language code to select, e.g. nb.
 */

/**
 * @typedef {object} SimplifiedConnection
 * @property {SimplifiedParty} party
 * @property {Array<SimplifiedConnection>|null} connections
 */

/**
 * @typedef {object} SimplifiedParty
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} type
 * @property {string|null} variant
 * @property {string|null} organizationIdentifier
 * @property {boolean} isDeleted
 */

/**
 * @typedef {object} TypeDto
 * @property {string} id UUID.
 * @property {string} providerId UUID.
 * @property {string|null} name
 */

/**
 * @typedef {object} User
 * @property {string} partyUuid UUID.
 * @property {AuthorizedPartyType} partyType
 * @property {string|null} name
 * @property {Array<RegistryRoleType>|null} registryRoles
 * @property {Array<string>|null} roles
 * @property {string|null} organizationNumber
 * @property {string|null} unitType
 * @property {Array<User>|null} inheritingUsers
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
