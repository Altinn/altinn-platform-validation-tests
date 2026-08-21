/**
 * @typedef {"Hide"|"Show"} ConsentPortalViewMode
 */

/**
 * @typedef {"Hide"|"Show"|null} NullableOfConsentPortalViewMode
 */

/**
 * @typedef {"Created"|"Rejected"|"Accepted"|"Revoked"|"Deleted"|"Expired"|"Used"} ConsentRequestEventType
 */

/**
 * @typedef {"Created"|"Rejected"|"Accepted"|"Revoked"|"Deleted"} ConsentRequestStatusType
 */

/**
 * @typedef {object} ConsentResourceAttributeDto
 * @property {string|null} type
 * @property {string|null} value
 */

/**
 * @typedef {object} ConsentRightDto
 * @property {Array<string>|null} action
 * @property {Array<ConsentResourceAttributeDto>|null} resource
 * @property {{[key:string]: string}|null} metadata
 */

/**
 * @typedef {object} ConsentRequestDto
 * @property {string} id
 * @property {string|null} from
 * @property {string|null} requiredDelegator
 * @property {string|null} to
 * @property {string} validTo
 * @property {Array<ConsentRightDto>|null} consentRights
 * @property {{[key:string]: string}|null} requestMessage
 * @property {string|null} redirectUrl
 * @property {NullableOfConsentPortalViewMode} portalViewMode
 */

/**
 * @typedef {object} ConsentRequestEventDto
 * @property {string} consentEventID
 * @property {string} created
 * @property {string|null} performedBy
 * @property {ConsentRequestEventType} eventType
 * @property {string} consentRequestID
 */

/**
 * @typedef {object} ConsentRequestDetailsDto
 * @property {string} id
 * @property {string|null} from
 * @property {string|null} to
 * @property {string|null} requiredDelegator
 * @property {string|null} handledBy
 * @property {string} validTo
 * @property {Array<ConsentRightDto>|null} consentRights
 * @property {{[key:string]: string}|null} requestMessage
 * @property {ConsentRequestStatusType} status
 * @property {string|null} consented
 * @property {string|null} redirectUrl
 * @property {Array<ConsentRequestEventDto>|null} consentRequestEvents
 * @property {string|null} viewUri
 * @property {ConsentPortalViewMode} portalViewMode
 */

/**
 * @typedef {object} ConsentStatusChangeDto
 * @property {string} consentRequestId
 * @property {string|null} eventType
 * @property {string} changedDate
 */

/**
 * @typedef {object} PaginatedResultLinks
 * @property {string|null} next
 */

/**
 * @typedef {object} ConsentStatusChangeDtoPaginatedResult
 * @property {Array<ConsentStatusChangeDto>|null} data
 * @property {PaginatedResultLinks} links
 */

/**
 * @typedef {object} ProblemDetails
 * @property {string|null} type
 * @property {string|null} title
 * @property {number|null} status
 * @property {string|null} detail
 * @property {string|null} instance
 */

/**
 * Builder for creating ConsentRequestDto payloads.
 *
 * @typedef {object} ConsentRequestBuilder
 * @property {object} request The underlying consent request payload.
 * @property {string|null} request.id Consent request UUID.
 * @property {string|null} request.from Party URN the consent request is created from.
 * @property {string|null} request.requiredDelegator Required delegator party URN.
 * @property {string|null} request.to Party URN the consent request is created for.
 * @property {string|null} request.validTo Consent expiration date/time.
 * @property {Array<ConsentRightDto>|null} request.consentRights Consent rights included in the request.
 * @property {{[key:string]: string}|null} request.requestMessage Localized request message.
 * @property {string|null} request.redirectUrl Redirect URL after consent handling.
 * @property {ConsentPortalViewMode|null} request.portalViewMode Portal view mode.
 */

/**
 * Query parameters for {@link ConsentRequestEventsQueryBuilder}.
 *
 * @typedef {object} ConsentRequestEventsQuery
 * @property {string} [continuationToken] Pagination continuation token.
 * @property {string} [createdAfter] Filter events created after this timestamp.
 * @property {string} [createdBefore] Filter events created before this timestamp.
 * @property {Array<string>} [eventType] Event type filters.
 * @property {string} [consentRequestId] Consent request UUID filter.
 */

/**
 * Builder for creating query parameters for retrieving consent request events.
 *
 * @typedef {object} ConsentRequestEventsQueryBuilder
 * @property {ConsentRequestEventsQuery} query The underlying query parameter object.
 */

// Runtime stub, so a file documenting this typedef has something to import and an
// editor can follow the name back here. Only the typedefs that are actually
// imported get one, so add to this as they are needed rather than up front.

export const ConsentPortalViewMode = undefined;
export const ConsentRequestDetailsDto = undefined;
export const ConsentRequestDto = undefined;
export const ConsentRequestEventsQuery = undefined;
export const ConsentRequestEventsQueryBuilder = undefined;
export const ConsentRightDto = undefined;
export const ConsentStatusChangeDtoPaginatedResult = undefined;
