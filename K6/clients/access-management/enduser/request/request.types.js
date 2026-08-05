/**
 * @typedef {"None"|"Draft"|"Pending"|"Approved"|"Rejected"|"Withdrawn"} RequestStatus
 */

/**
 * @typedef {object} RequestReferenceDto
 * @property {string|null} id UUID.
 * @property {string|null} referenceId
 */

/**
 * @typedef {object} RequestLinks
 * @property {string|null} detailsLink
 * @property {string|null} statusLink
 */

/**
 * @typedef {object} PartyEntityDto
 * @property {string} id UUID.
 * @property {string|null} name
 * @property {string|null} type
 * @property {string|null} variant
 * @property {string|null} organizationIdentifier
 * @property {string|null} personIdentifier
 */

/**
 * @typedef {object} PaginatedResultLinks
 * @property {string|null} next
 */

/**
 * @typedef {object} RequestDto
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
 * @typedef {object} RequestDtoPaginatedResult
 * @property {Array<RequestDto>|null} data
 * @property {PaginatedResultLinks|null} links
 */

/**
 * The request statuses the API recognises, for use where a
 * {@link RequestStatus} is expected at runtime.
 *
 * @type {{[key: string]: RequestStatus}}
 */
export const RequestStatus = {
    None: "None",
    Draft: "Draft",
    Pending: "Pending",
    Approved: "Approved",
    Rejected: "Rejected",
    Withdrawn: "Withdrawn",
};
