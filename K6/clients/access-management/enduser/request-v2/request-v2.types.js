/**
 * @typedef {"None"|"Draft"|"Pending"|"Approved"|"Rejected"|"Withdrawn"|"PartialApprove"} RequestStatusV2
 */

/**
 * @typedef {object} PartyReferenceDto
 * @property {string} id UUID.
 * @property {string|null} name
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
 * @typedef {object} RequestReferenceDto
 * @property {string|null} id UUID.
 * @property {string|null} referenceId
 */

/**
 * @typedef {object} RequestResourceReferenceDto
 * @property {string|null} id UUID.
 * @property {string|null} referenceId
 * @property {Array<string>|null} requestedRightKeys
 * @property {Array<string>|null} approvedRightKeys
 */

/**
 * @typedef {object} RequestLinks
 * @property {string|null} detailsLink
 * @property {string|null} statusLink
 */

/**
 * @typedef {object} RequestDto
 * @property {string} id UUID.
 * @property {RequestStatusV2} status
 * @property {string|null} type
 * @property {string} lastUpdated ISO date-time.
 * @property {PartyReferenceDto|null} lastUpdatedBy
 * @property {RequestResourceReferenceDto|null} resource
 * @property {RequestReferenceDto|null} package
 * @property {RequestLinks|null} links
 * @property {PartyEntityDto|null} from
 * @property {PartyEntityDto|null} to
 * @property {PartyEntityDto|null} by
 */

/**
 * @typedef {object} PaginatedResultLinks
 * @property {string|null} next
 */

/**
 * @typedef {object} RequestDtoPaginatedResult
 * @property {Array<RequestDto>|null} data
 * @property {PaginatedResultLinks|null} links
 */

/**
 * @typedef {object} ReceivedRequestCountSubunitDto
 * @property {PartyEntityDto|null} party
 * @property {number} count
 */

/**
 * Body for PUT received/approve.
 *
 * @typedef {object} ApproveRequestDto
 * @property {Array<string>|null} rightKeys
 */

/**
 * Body for POST resource.
 *
 * @typedef {object} RequestedRightKeysDto
 * @property {Array<string>|null} requestedRightKeys
 */

/**
 * @typedef {object} ReceivedRequestsQuery
 * @property {string} party Party UUID.
 * @property {string} [from] Sender party UUID.
 * @property {Array<RequestStatusV2>} [status] Request status filters.
 * @property {string} [type] Request type.
 */

/**
 * @typedef {object} SentRequestsQuery
 * @property {string} party Party UUID.
 * @property {string} [to] Receiver party UUID.
 * @property {Array<RequestStatusV2>} [status] Request status filters.
 * @property {string} [type] Request type.
 */

/** @type {{[K in RequestStatusV2]: RequestStatusV2}} */
export const RequestStatusV2 = {
    None: "None",
    Draft: "Draft",
    Pending: "Pending",
    Approved: "Approved",
    Rejected: "Rejected",
    Withdrawn: "Withdrawn",
    PartialApprove: "PartialApprove",
};

export const ApproveRequestDto = undefined;
export const PartyEntityDto = undefined;
export const PartyReferenceDto = undefined;
export const ReceivedRequestCountSubunitDto = undefined;
export const ReceivedRequestsQuery = undefined;
export const RequestDto = undefined;
export const RequestDtoPaginatedResult = undefined;
export const RequestedRightKeysDto = undefined;
export const SentRequestsQuery = undefined;
