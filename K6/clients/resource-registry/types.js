/**
 * @typedef {string} PartyUrnPartyUuid
 */

/**
 * @typedef {string} ResourceUrnResourceId
 */

/**
 * @typedef {Object} AccessListResourceMembershipWithActionFilterDto
 * @property {PartyUrnPartyUuid} party
 * @property {ResourceUrnResourceId} resource
 * @property {string} since
 * @property {Array<string>|null} actionFilters
 */

/**
 * @typedef {Object} AccessListResourceMembershipWithActionFilterDtoListObject
 * @property {Array<AccessListResourceMembershipWithActionFilterDto>} data
 */

/**
 * @typedef {"resources"|"resource-actions"|"members"} AccessListInclude
 */

/**
 * @typedef {Array<AccessListInclude>} AccessListIncludes
 */

/**
 * @typedef {Object} AccessListInfoDto
 * @property {string|null} urn URN of the access list.
 * @property {string} identifier The access list identifier.
 * @property {string} name The access list name.
 * @property {string} description The access list description.
 * @property {string} createdAt When the access list was created.
 * @property {string} updatedAt When the access list was updated.
 * @property {Array<AccessListResourceConnectionDto>|null} resourceConnections The resource connections.
 */

/**
 * @typedef {Object} CreateAccessListModel
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
 * @typedef {Object} AccessListResourceConnectionDto
 * @property {string} resourceIdentifier The resource identifier.
 * @property {string} createdAt When the connection was created.
 * @property {string} updatedAt When the connection was last updated.
 * @property {Array<string>|null} actionFilters Allowed actions.
 */

/**
 * @typedef {Object} AccessListResourceConnectionWithVersionDto
 * @property {string} resourceIdentifier The resource identifier.
 * @property {string} createdAt When the connection was created.
 * @property {string} updatedAt When the connection was last updated.
 * @property {Array<string>|null} actionFilters Allowed actions.
 */

/**
 * @typedef {Object} AccessListMembershipIdentifiers
 * @property {number|null} ["urn:altinn:party:id"] Party identifier.
 * @property {string|null} ["urn:altinn:party:uuid"] Party UUID.
 * @property {Object|null} ["urn:altinn:organization:identifier-no"] Organization number.
 */

/**
 * @typedef {Object} AccessListMembershipDto
 * @property {PartyUuidUrn} id Party UUID URN.
 * @property {string} since Since when the party has been a member of the access list.
 * @property {AccessListMembershipIdentifiers|null} identifiers Optional identifiers.
 */

/**
 * @typedef {Object} PaginatedLinks
 * @property {string|null} next Link to the next page of items.
 */

/**
 * @typedef {Object} AccessListMembershipDtoAggregateVersionVersionedPaginated
 * @property {Array<AccessListMembershipDto>} data Items.
 * @property {PaginatedLinks} links Pagination links.
 */

/**
 * @typedef {Object} AccessListResourceConnectionDtoAggregateVersionVersionedPaginated
 * @property {Array<AccessListResourceConnectionDto>} data Items.
 * @property {PaginatedLinks} links Pagination links.
 */

/**
 * @typedef {Object} UpsertAccessListResourceConnectionDto
 * @property {Array<string>|null} actionFilters Allowed actions.
 */

/**
 * @typedef {Object} JsonPatchOperation
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
 * @typedef {Object} AccessListRequestHeaders
 * @property {string|null} ifMatch If-Match header.
 * @property {string|null} ifNoneMatch If-None-Match header.
 * @property {string|null} ifModifiedSince If-Modified-Since header.
 * @property {string|null} ifUnmodifiedSince If-Unmodified-Since header.
 */


/**
 * Builder for creating CreateAccessListModel payloads.
 *
 * @typedef {Object} CreateAccessListBuilder
 * @property {Object} model The underlying access list payload.
 * @property {string|null} model.name Access list name.
 * @property {string|null} model.description Access list description.
 */


/**
 * Builder for creating UpsertAccessListResourceConnectionDto payloads.
 *
 * @typedef {Object} AccessListResourceConnectionBuilder
 * @property {Object} model The underlying resource connection payload.
 * @property {Array<string>|null} model.actionFilters Allowed actions.
 */


/**
 * Builder for creating access list member payloads.
 *
 * @typedef {Object} AccessListMembersBuilder
 * @property {Object} model The underlying members payload.
 * @property {Array<PartyUrn>} model.data Members.
 */


/**
 * @typedef {Object} Org
 * @property {{[key:string]: string|null}|null} name
 * Localized organization names keyed by language code.
 * @property {string|null} logo
 * @property {string|null} orgnr
 * @property {string|null} homepage
 * @property {Array<string>|null} environments
 */

/**
 * @typedef {Object} OrgList
 * @property {{[key:string]: Org}|null} orgs
 */


/**
 * @typedef {Object} AttributeMatchDTO
 * @property {string|null} type
 * @property {string|null} value
 */

/**
 * @typedef {Object} RightDto
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
 * @typedef {Object} RightDecomposedDto
 * @property {RightDto} right
 */

/**
 * @typedef {Object} ResourceDecomposedDto
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
 * @typedef {0|1|2|4|8|16|32|64|128} ResourceType
 */

/**
 * @typedef {Object} ContactPoint
 * @property {string|null} category
 * @property {string|null} email
 * @property {string|null} telephone
 * @property {string|null} contactPage
 */

/**
 * @typedef {Object} ResourceReference
 * @property {ReferenceSource} referenceSource
 * @property {string|null} reference
 * @property {ReferenceType} referenceType
 */

/**
 * @typedef {Object} CompetentAuthority
 * @property {string|null} organization
 * @property {string|null} orgcode
 * @property {{[key:string]:string|null}|null} name
 */

/**
 * @typedef {Object} Keyword
 * @property {string|null} word
 * @property {string|null} language
 */

/**
 * @typedef {Object} AuthorizationReferenceAttribute
 * @property {string|null} id
 * @property {string|null} value
 */

/**
 * @typedef {Object} ConsentMetadata
 * @property {boolean} optional
 */

/**
 * @typedef {Object} ServiceResource
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
 * @typedef {Object} ResourceListQueryBuilder
 * @property {boolean} [includeApps]
 * @property {boolean} [includeAltinn2]
 * @property {boolean} [includeMigratedApps]
 */


/**
 * @typedef {Object} AttributeMatchV2
 * @property {string} type
 * @property {string} value
 * @property {string} urn
 */

/**
 * @typedef {Object} AttributeMatchV2Paginated
 * @property {Array<AttributeMatchV2>} data
 * @property {PaginatedLinks} links
 */


/**
 * @typedef {Object} UrnJsonTypeValue
 * @property {string} type
 * @property {string} value
 */

/**
 * @typedef {Object} PolicyRuleDTO
 * @property {Array<UrnJsonTypeValue>|null} subject
 * @property {UrnJsonTypeValue} action
 * @property {Array<UrnJsonTypeValue>|null} resource
 */

/**
 * @typedef {Object} PolicySubjectDTO
 * @property {Array<UrnJsonTypeValue>|null} subjectAttributes
 */

/**
 * @typedef {Object} PolicyRightsDTO
 * @property {UrnJsonTypeValue} action
 * @property {Array<UrnJsonTypeValue>|null} resource
 * @property {Array<PolicySubjectDTO>|null} subjects
 * @property {string|null} rightKey
 * @property {Array<string>|null} subjectTypes
 */


/**
 * @typedef {Object} SubjectResources
 * @property {AttributeMatchV2} subject
 * @property {Array<AttributeMatchV2>} resources
 */

/**
 * @typedef {Object} SubjectResourcesPaginated
 * @property {Array<SubjectResources>} data
 * @property {PaginatedLinks} links
 */

/**
 * Builder for searching resources.
 *
 * @typedef {Object} ResourceSearchQueryBuilder
 * @property {string|null} Id Resource identifier filter.
 * @property {string|null} Title Title filter.
 * @property {string|null} Description Description filter.
 * @property {ResourceType|null} ResourceType Resource type filter.
 * @property {string|null} Keyword Keyword filter.
 * @property {string|null} Reference Reference filter.
 */
