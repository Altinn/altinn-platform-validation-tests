/**
 * @typedef {"None"|"Draft"|"Pending"|"Approved"|"Rejected"|"Withdrawn"} RequestStatus
 */

/**
 * @typedef {Object} RequestReferenceDto
 * @property {string|null} id
 * @property {string|null} referenceId
 */

/**
 * @typedef {Object} RequestLinks
 * @property {string|null} detailsLink
 * @property {string|null} statusLink
 */

/**
 * @typedef {Object} PartyEntityDto
 * @property {string} id
 * @property {string|null} name
 * @property {string|null} type
 * @property {string|null} variant
 * @property {string|null} organizationIdentifier
 * @property {string|null} personIdentifier
 */

/**
 * @typedef {Object} CreateServiceOwnerRequest
 * @property {string|null} from
 * @property {string|null} to
 * @property {RequestReferenceDto} resource
 * @property {RequestReferenceDto} package
 */

/**
 * @typedef {Object} RequestResourceDto
 * @property {string|null} from
 * @property {string|null} to
 * @property {string|null} resource
 * @property {Array<string>|null} rightKeys
 */

/**
 * @typedef {Object} RequestPackageDto
 * @property {string|null} from
 * @property {string|null} to
 * @property {string|null} package
 */

/**
 * @typedef {Object} RequestDto
 * @property {string} id
 * @property {RequestStatus} status
 * @property {string|null} type
 * @property {string} lastUpdated
 * @property {string|null} lastUpdatedBy
 * @property {RequestReferenceDto} resource
 * @property {RequestReferenceDto} package
 * @property {RequestLinks} links
 * @property {PartyEntityDto} from
 * @property {PartyEntityDto} to
 * @property {PartyEntityDto} by
 */
