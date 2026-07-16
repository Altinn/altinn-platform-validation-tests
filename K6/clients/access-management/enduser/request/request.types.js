/**
 * @typedef {"None"|"Draft"|"Pending"|"Approved"|"Rejected"|"Withdrawn"} RequestStatus
 */

/**
 * @typedef {Object} RequestReferenceDto
 * @property {string|null} id UUID.
 * @property {string|null} referenceId
 */

/**
 * @typedef {Object} RequestLinks
 * @property {string|null} detailsLink
 * @property {string|null} statusLink
 */

/**
 * @typedef {Object} PartyEntityDto
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} type
 * @property {string|null} variant
 * @property {string|null} organizationIdentifier
 * @property {string|null} personIdentifier
 */

/**
 * @typedef {Object} PaginatedResultLinks
 * @property {string|null} next
 */

/**
 * @typedef {Object} RequestDto
 * @property {string} id UUID.
 * @property {RequestStatus} status
 * @property {string|null} type
 * @property {string} lastUpdated ISO date-time.
 * @property {string|null} lastUpdatedBy UUID.
 * @property {RequestReferenceDto|null} resource
 * @property {RequestReferenceDto|null} package
 * @property {RequestLinks|null} links
 * @property {PartyEntityDto|null} from
 * @property {PartyEntityDto|null} to
 * @property {PartyEntityDto|null} by
 */

/**
 * @typedef {Object} RequestDtoPaginatedResult
 * @property {Array<RequestDto>|null} data
 * @property {PaginatedResultLinks|null} links
 */
