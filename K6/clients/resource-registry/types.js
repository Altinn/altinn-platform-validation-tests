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
