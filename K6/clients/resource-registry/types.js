/**
 * @typedef {string} PartyUrnPartyUuid
 */

/**
 * @typedef {string} ResourceUrnResourceId
 */

/**
 * @typedef {object} AccessListResourceMembershipWithActionFilterDto
 * @property {PartyUrnPartyUuid} party
 * @property {ResourceUrnResourceId} resource
 * @property {string} since
 * @property {Array<string>|null} actionFilters
 */

/**
 * @typedef {object} AccessListResourceMembershipWithActionFilterDtoListObject
 * @property {Array<AccessListResourceMembershipWithActionFilterDto>} data
 */

/**
 * @typedef {"resources"|"resource-actions"|"members"} AccessListInclude
 */

/**
 * @typedef {Array<AccessListInclude>} AccessListIncludes
 */

/**
 * @typedef {object} AccessListInfoDto
 * @property {string|null} urn URN of the access list.
 * @property {string} identifier The access list identifier.
 * @property {string} name The access list name.
 * @property {string} description The access list description.
 * @property {string} createdAt When the access list was created.
 * @property {string} updatedAt When the access list was updated.
 * @property {Array<AccessListResourceConnectionDto>|null} resourceConnections The resource connections.
 */

/**
 * @typedef {object} CreateAccessListModel
 * @property {string|null} name The access list name.
 * @property {string|null} description The access list description.
 */

/**
 * @typedef {string} PartyUuidUrn
 */

/**
 * @typedef {string} PartyUrn
 */

/**
 * @typedef {object} AccessListResourceConnectionDto
 * @property {string} resourceIdentifier The resource identifier.
 * @property {string} createdAt When the connection was created.
 * @property {string} updatedAt When the connection was last updated.
 * @property {Array<string>|null} actionFilters Allowed actions.
 */

/**
 * @typedef {object} AccessListResourceConnectionWithVersionDto
 * @property {string} resourceIdentifier The resource identifier.
 * @property {string} createdAt When the connection was created.
 * @property {string} updatedAt When the connection was last updated.
 * @property {Array<string>|null} actionFilters Allowed actions.
 */

/**
 * Identifiers a membership can be looked up by. The keys are URNs, so the type
 * is written inline rather than with `@property` tags.
 *
 * @typedef {{"urn:altinn:party:id"?: number|null, "urn:altinn:party:uuid"?: string|null, "urn:altinn:organization:identifier-no"?: object|null}} AccessListMembershipIdentifiers
 */

/**
 * @typedef {object} AccessListMembershipDto
 * @property {PartyUuidUrn} id Party UUID URN.
 * @property {string} since Since when the party has been a member of the access list.
 * @property {AccessListMembershipIdentifiers|null} identifiers Optional identifiers.
 */

/**
 * @typedef {object} PaginatedLinks
 * @property {string|null} next Link to the next page of items.
 */

/**
 * @typedef {object} AccessListMembershipDtoAggregateVersionVersionedPaginated
 * @property {Array<AccessListMembershipDto>} data Items.
 * @property {PaginatedLinks} links Pagination links.
 */

/**
 * @typedef {object} AccessListResourceConnectionDtoAggregateVersionVersionedPaginated
 * @property {Array<AccessListResourceConnectionDto>} data Items.
 * @property {PaginatedLinks} links Pagination links.
 */

/**
 * @typedef {object} UpsertAccessListResourceConnectionDto
 * @property {Array<string>|null} actionFilters Allowed actions.
 */

/**
 * @typedef {object} JsonPatchOperation
 * @property {"add"|"copy"|"move"|"remove"|"replace"|"test"} op Operation type.
 * @property {string} path JSON pointer path.
 * @property {string|null} from Source path for copy/move operations.
 * @property {*} value Operation value.
 */

/**
 * @typedef {Array<JsonPatchOperation>} JsonPatchDocument
 */

/**
 * @typedef {string} StringOpaque
 */

/**
 * @typedef {string} AccessListMembersContinuationTokenOpaque
 */

/**
 * @typedef {string} AccessListResourceConnectionContinuationTokenOpaque
 */

/**
 * @typedef {object} AccessListRequestHeaders
 * @property {string|null} ifMatch If-Match header.
 * @property {string|null} ifNoneMatch If-None-Match header.
 * @property {string|null} ifModifiedSince If-Modified-Since header.
 * @property {string|null} ifUnmodifiedSince If-Unmodified-Since header.
 */

/**
 * Builder for creating CreateAccessListModel payloads.
 *
 * @typedef {object} CreateAccessListBuilder
 * @property {object} model The underlying access list payload.
 * @property {string|null} model.name Access list name.
 * @property {string|null} model.description Access list description.
 */

/**
 * Builder for creating UpsertAccessListResourceConnectionDto payloads.
 *
 * @typedef {object} AccessListResourceConnectionBuilder
 * @property {object} model The underlying resource connection payload.
 * @property {Array<string>|null} model.actionFilters Allowed actions.
 */

/**
 * Builder for creating access list member payloads.
 *
 * @typedef {object} AccessListMembersBuilder
 * @property {object} model The underlying members payload.
 * @property {Array<PartyUrn>} model.data Members.
 */

/**
 * @typedef {object} Org
 * @property {{[key:string]: string|null}|null} name
 * Localized organization names keyed by language code.
 * @property {string|null} logo
 * @property {string|null} orgnr
 * @property {string|null} homepage
 * @property {Array<string>|null} environments
 */

/**
 * @typedef {object} OrgList
 * @property {{[key:string]: Org}|null} orgs
 */

/**
 * @typedef {object} AttributeMatchDTO
 * @property {string|null} type
 * @property {string|null} value
 */

/**
 * @typedef {object} RightDto
 * @property {string|null} key
 * Unique key for the action.
 * @property {string|null} name
 * Display name of the action.
 * @property {Array<AttributeMatchDTO>|null} resource
 * Resource attributes associated with the right.
 * @property {AttributeMatchDTO|null} action
 * Action associated with the right.
 */

/**
 * @typedef {object} RightDecomposedDto
 * @property {RightDto} right
 */

/**
 * @typedef {object} ResourceDecomposedDto
 * @property {Array<RightDecomposedDto>|null} rights
 */

/**
 * @typedef {"Default"|"Altinn1"|"Altinn2"|"Altinn3"|"ExternalPlatform"} ReferenceSource
 */

/**
 * @typedef {"Default"|"Uri"|"DelegationSchemeId"|"MaskinportenScope"|"ServiceCode"|"ServiceEditionCode"|"ApplicationId"|"ServiceEditionVersion"} ReferenceType
 */

/**
 * @typedef {"PrivatePerson"|"LegalEntityEnterprise"|"Company"|"BankruptcyEstate"|"SelfRegisteredUser"} ResourcePartyType
 */

/**
 * @typedef {0|1} ResourceAccessListMode
 */

/**
 * Serialized as a string by the registry, and the values live in
 * resource.constants.js.
 *
 * @typedef {"Default"|"Systemresource"|"MaskinportenSchema"|"Altinn2Service"|"AltinnApp"|"GenericAccessResource"|"BrokerService"|"CorrespondenceService"|"Consent"|"MigratedApp"} ResourceType
 */

/**
 * @typedef {object} ContactPoint
 * @property {string|null} category
 * @property {string|null} email
 * @property {string|null} telephone
 * @property {string|null} contactPage
 */

/**
 * @typedef {object} ResourceReference
 * @property {ReferenceSource} referenceSource
 * @property {string|null} reference
 * @property {ReferenceType} referenceType
 */

/**
 * @typedef {object} CompetentAuthority
 * @property {string|null} organization
 * @property {string|null} orgcode
 * @property {{[key:string]:string|null}|null} name
 */

/**
 * @typedef {object} Keyword
 * @property {string|null} word
 * @property {string|null} language
 */

/**
 * @typedef {object} AuthorizationReferenceAttribute
 * @property {string|null} id
 * @property {string|null} value
 */

/**
 * @typedef {object} ConsentMetadata
 * @property {boolean} optional
 */

/**
 * @typedef {object} ServiceResource
 * @property {string} identifier
 * @property {string|null} version
 * @property {{[key:string]:string}} title
 * @property {{[key:string]:string}} description
 * @property {{[key:string]:string}|null} rightDescription
 * @property {string|null} homepage
 * @property {string|null} status
 * @property {Array<string>|null} spatial
 * @property {Array<ContactPoint>} contactPoints
 * @property {Array<string>|null} produces
 * @property {string|null} isPartOf
 * @property {Array<string>|null} thematicAreas
 * @property {Array<ResourceReference>|null} resourceReferences
 * @property {boolean} delegable
 * @property {boolean} visible
 * @property {CompetentAuthority} hasCompetentAuthority
 * @property {Array<Keyword>|null} keywords
 * @property {ResourceAccessListMode} accessListMode
 * @property {boolean} selfIdentifiedUserEnabled
 * @property {boolean} enterpriseUserEnabled
 * @property {ResourceType} resourceType
 * @property {Array<ResourcePartyType>|null} availableForType
 * @property {Array<AuthorizationReferenceAttribute>|null} authorizationReference
 * @property {string|null} consentTemplate
 * @property {{[key:string]:ConsentMetadata}|null} consentMetadata
 * @property {{[key:string]:string}|null} consentText
 * @property {boolean} isOneTimeConsent
 * @property {number} versionId
 */

/**
 * Builder for creating query parameters for retrieving resources.
 *
 * @typedef {object} ResourceListQueryBuilder
 * @property {boolean} [includeApps]
 * @property {boolean} [includeAltinn2]
 * @property {boolean} [includeMigratedApps]
 */

/**
 * @typedef {object} AttributeMatchV2
 * @property {string} type
 * @property {string} value
 * @property {string} urn
 */

/**
 * @typedef {object} AccessListInfoDtoPaginated
 * @property {Array<AccessListInfoDto>} data
 * @property {PaginatedLinks} links
 */

/**
 * @typedef {object} AttributeMatchV2Paginated
 * @property {Array<AttributeMatchV2>} data
 * @property {PaginatedLinks} links
 */

/**
 * @typedef {object} UrnJsonTypeValue
 * @property {string} type
 * @property {string} value
 */

/**
 * @typedef {object} PolicyRuleDTO
 * @property {Array<UrnJsonTypeValue>|null} subject
 * @property {UrnJsonTypeValue} action
 * @property {Array<UrnJsonTypeValue>|null} resource
 */

/**
 * @typedef {object} PolicySubjectDTO
 * @property {Array<UrnJsonTypeValue>|null} subjectAttributes
 */

/**
 * @typedef {object} PolicyRightsDTO
 * @property {UrnJsonTypeValue} action
 * @property {Array<UrnJsonTypeValue>|null} resource
 * @property {Array<PolicySubjectDTO>|null} subjects
 * @property {string|null} rightKey
 * @property {Array<string>|null} subjectTypes
 */

/**
 * @typedef {object} SubjectResources
 * @property {AttributeMatchV2} subject
 * @property {Array<AttributeMatchV2>} resources
 */

/**
 * @typedef {object} SubjectResourcesPaginated
 * @property {Array<SubjectResources>} data
 * @property {PaginatedLinks} links
 */

/**
 * Builder for searching resources.
 *
 * @typedef {object} ResourceSearchQueryBuilder
 * @property {string|null} Id Resource identifier filter.
 * @property {string|null} Title Title filter.
 * @property {string|null} Description Description filter.
 * @property {ResourceType|null} ResourceType Resource type filter.
 * @property {string|null} Keyword Keyword filter.
 * @property {string|null} Reference Reference filter.
 * @property {string|null} OrgCode Resource owner filter.
 * @property {string|null} OrganizationId Resource owner organization number filter.
 */

/**
 * @typedef {object} UpdatedResourceSubject
 * @property {string|null} subjectUrn
 * @property {string|null} resourceUrn
 * @property {string} updatedAt
 * @property {boolean} deleted
 */

/**
 * @typedef {object} UpdatedResourceSubjectPaginated
 * @property {Array<UpdatedResourceSubject>|null} data
 * @property {PaginatedLinks} links
 */

/**
 * @typedef {object} UpdatedResourceSubjectsContinuationToken
 * @property {string|null} resourceUrn
 * @property {string|null} subjectUrn
 */

/**
 * Query parameters for {@link UpdatedResourceSubjectsQueryBuilder}, and for the
 * resource search and updated resource reads that take the same shape.
 *
 * @typedef {object} UpdatedResourceSubjectsQuery
 * @property {string} [since] Date time used for filtering.
 * @property {string} [token] Continuation token.
 * @property {number} [limit] Maximum number of pairs returned.
 */

/**
 * Query parameters for searching resources.
 *
 * @typedef {object} ResourceSearchQuery
 * @property {string|null} [Id] Resource identifier filter.
 * @property {string|null} [Title] Title filter.
 * @property {string|null} [Description] Description filter.
 * @property {ResourceType|null} [ResourceType] Resource type filter.
 * @property {string|null} [Keyword] Keyword filter.
 * @property {string|null} [Reference] Reference filter.
 * @property {string|null} [OrgCode] Resource owner filter.
 * @property {string|null} [OrganizationId] Resource owner organization number filter.
 */

/**
 * @typedef {object} UpdatedResourceSubjectsQueryBuilder
 * @property {UpdatedResourceSubjectsQuery} query The underlying query parameter object.
 */

/**
 * Query parameters for listing the access lists of a resource owner.
 *
 * @typedef {object} AccessListGetByOwnerQuery
 * @property {string} [token] Continuation token for paging.
 * @property {Array<string>} [include] Related data to include.
 * @property {string} [resource] Resource identifier to filter by.
 */

/**
 * Query parameters for reading a single access list.
 *
 * @typedef {object} AccessListGetQuery
 * @property {Array<string>} [include] Related data to include.
 */

/**
 * Query parameters for the paged access list reads.
 *
 * @typedef {object} AccessListPagedQuery
 * @property {string} [token] Continuation token for paging.
 */

/**
 * Query parameters for looking up access list memberships.
 *
 * @typedef {object} AccessListMembershipsQuery
 * @property {Array<string>} [party] Parties to include.
 * @property {Array<string>} [resource] Resources to include.
 */

/**
 * Query parameters for reading the policy rights of a resource.
 *
 * @typedef {object} ResourcePolicyRightsQuery
 * @property {boolean} [includeServiceOwnerRights] Whether to include service owner rights.
 * @property {boolean} [includeAppRights] Whether to include app rights.
 */

/**
 * Query parameters for the resource list.
 *
 * @typedef {object} ResourceListQuery
 * @property {boolean} [includeApps] Whether to include apps.
 * @property {boolean} [includeAltinn2] Whether to include altinn2.
 * @property {boolean} [includeMigratedApps] Whether to include migrated apps.
 */

export const AccessListGetByOwnerQuery = undefined;
export const AccessListGetQuery = undefined;
export const AccessListInfoDto = undefined;
export const AccessListInfoDtoPaginated = undefined;
export const AccessListMembershipDtoAggregateVersionVersionedPaginated = undefined;
export const AccessListMembershipsQuery = undefined;
export const AccessListPagedQuery = undefined;
export const AccessListResourceConnectionDtoAggregateVersionVersionedPaginated = undefined;
export const AccessListResourceConnectionWithVersionDto = undefined;
export const AccessListResourceMembershipWithActionFilterDtoListObject = undefined;
export const AttributeMatchV2Paginated = undefined;
export const CreateAccessListModel = undefined;
export const JsonPatchOperation = undefined;
export const OrgList = undefined;
export const PolicyRightsDTO = undefined;
export const PolicyRuleDTO = undefined;
export const ResourceDecomposedDto = undefined;
export const ResourceListQuery = undefined;
export const ResourceListQueryBuilder = undefined;
export const ResourcePolicyRightsQuery = undefined;
export const ResourceSearchQuery = undefined;
export const ResourceSearchQueryBuilder = undefined;
export const ResourceType = undefined;
export const ServiceResource = undefined;
export const SubjectResourcesPaginated = undefined;
export const UpdatedResourceSubjectPaginated = undefined;
export const UpdatedResourceSubjectsQuery = undefined;
export const UpsertAccessListResourceConnectionDto = undefined;
